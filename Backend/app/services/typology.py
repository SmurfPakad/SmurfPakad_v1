"""
Typology (red-flag) scoring for wallet-ledger uploads.

The TG-GATv2 checkpoint was trained on Elliptic2's 43 anonymised features. A
UPI/bank/crypto ledger with sender/receiver/amount/time columns does not have
those features, so for such uploads the GNN output is only a weak, out-of-domain
signal. This module scores each wallet with interpretable FATF-style red flags
and returns the reasons, which the UI shows as the explanation.

Thresholds are generic AML heuristics, not fitted to any dataset:
  * structuring    - amounts at 90-100% of a common reporting threshold
  * fan-out/fan-in - unusually many distinct counterparties (peer-group: above
                     the ledger's 95th percentile and at least 3)
  * velocity       - unusually many transfers inside a one-hour window (same rule)
  * pass-through   - funds received and forwarded at a similar value (layering)
  * high value     - transfers far above the ledger's typical amount
  * multi-platform - one holder (same UPI local part) active on several apps;
                     only amplifies other flags, never flags on its own

Scores are computed per account holder (UPI handles merged by local part), then
one hop of risk is propagated from strongly flagged hubs to their counterparties.
"""
from dataclasses import dataclass, field
from typing import Dict, List

import numpy as np
import pandas as pd

# Common reporting / scrutiny thresholds across INR, USD, EUR ledgers
REPORTING_THRESHOLDS = (10_000, 50_000, 100_000, 200_000, 1_000_000)

WEIGHTS = {
    "structuring": 0.30,
    "fan_out": 0.20,
    "fan_in": 0.20,
    "velocity": 0.15,
    "pass_through": 0.20,
    "high_value": 0.20,
    "multi_platform": 0.15,
}

PEER_QUANTILE = 0.95

STRUCTURAL_FLAGS = {"fan_out", "fan_in", "velocity", "pass_through"}


@dataclass
class WalletTypology:
    score: float
    flags: Dict[str, float] = field(default_factory=dict)
    reasons: List[str] = field(default_factory=list)


def _near_threshold(amounts: np.ndarray) -> np.ndarray:
    hit = np.zeros(len(amounts), dtype=bool)
    for t in REPORTING_THRESHOLDS:
        hit |= (amounts >= 0.90 * t) & (amounts < t)
    return hit


def score_wallets(
    df: pd.DataFrame,
    wallet_ids: List[str],
    source_col: str = "Source_Wallet_ID",
    target_col: str = "Dest_Wallet_ID",
    amount_col: str = "Amount",
    time_col: str = "Timestamp",
    resolve_entities: bool = True,
) -> Dict[str, WalletTypology]:
    handles_src = df[source_col].astype(str)
    handles_dst = df[target_col].astype(str)
    entity_of = {h: entity_key(h) if resolve_entities else h
                 for h in set(handles_src) | set(handles_dst) | set(wallet_ids)}
    handles_per_entity: Dict[str, set] = {}
    for h, e in entity_of.items():
        handles_per_entity.setdefault(e, set()).add(h)

    tx = pd.DataFrame({
        "src": handles_src.map(entity_of),
        "dst": handles_dst.map(entity_of),
        "amt": pd.to_numeric(df[amount_col], errors="coerce").fillna(0.0) if amount_col in df else 0.0,
    })
    has_time = time_col in df.columns
    if has_time:
        tx["ts"] = pd.to_datetime(df[time_col], errors="coerce")
        has_time = tx["ts"].notna().any()

    tx["near_thr"] = _near_threshold(tx["amt"].to_numpy())
    median_amt = float(tx["amt"].median()) if len(tx) else 0.0
    high_cut = max(10.0 * median_amt, float(tx["amt"].quantile(0.95))) if len(tx) else np.inf

    # Long format: one row per (wallet, transaction, direction)
    sent = tx.assign(wallet=tx["src"], peer=tx["dst"], direction="out")
    recv = tx.assign(wallet=tx["dst"], peer=tx["src"], direction="in")
    long = pd.concat([sent, recv], ignore_index=True)

    g = long.groupby("wallet")
    n_tx = g.size()
    out = sent.groupby("wallet")
    inn = recv.groupby("wallet")
    uniq_out = out["peer"].nunique()
    uniq_in = inn["peer"].nunique()
    vol_out = out["amt"].sum()
    vol_in = inn["amt"].sum()
    near_thr = g["near_thr"].sum()
    high_val = (long["amt"] >= high_cut).groupby(long["wallet"]).sum()

    burst = pd.Series(0, index=n_tx.index, dtype=float)
    if has_time:
        timed = long.dropna(subset=["ts"]).sort_values("ts")
        # max number of a wallet's transfers within any rolling 1-hour window
        counts = (
            timed.set_index("ts").groupby("wallet")["amt"]
            .rolling("1h").count()
        )
        burst = counts.groupby(level=0).max().reindex(n_tx.index).fillna(0)

    # Peer-group thresholds: a count is only a red flag when it is anomalous for
    # *this* ledger (above its 95th percentile), never below the textbook minimum of 3.
    def peer_cut(series: pd.Series) -> int:
        vals = series[series > 0]
        return max(3, int(np.ceil(vals.quantile(PEER_QUANTILE)))) if len(vals) else 3

    fan_out_cut, fan_in_cut, burst_cut = peer_cut(uniq_out), peer_cut(uniq_in), peer_cut(burst)

    results: Dict[str, WalletTypology] = {}
    for w in sorted(handles_per_entity):
        flags: Dict[str, float] = {}
        reasons: List[str] = []
        total = int(n_tx.get(w, 0))
        if total == 0:
            results[w] = WalletTypology(0.0)
            continue

        k = int(near_thr.get(w, 0))
        if k >= 2 or (k >= 1 and total <= 2):
            flags["structuring"] = min(1.0, k / 3)
            reasons.append(f"{k} transfer(s) just below a reporting threshold")

        fo, fi = int(uniq_out.get(w, 0)), int(uniq_in.get(w, 0))
        if fo >= fan_out_cut:
            flags["fan_out"] = min(1.0, (fo - fan_out_cut + 1) / 4)
            reasons.append(f"Fan-out to {fo} distinct recipients")
        if fi >= fan_in_cut:
            flags["fan_in"] = min(1.0, (fi - fan_in_cut + 1) / 4)
            reasons.append(f"Fan-in from {fi} distinct senders")

        b = int(burst.get(w, 0))
        if b >= burst_cut:
            flags["velocity"] = min(1.0, (b - burst_cut + 1) / 4)
            reasons.append(f"{b} transfers within one hour")

        vi, vo = float(vol_in.get(w, 0.0)), float(vol_out.get(w, 0.0))
        if vi > 0 and vo > 0 and min(vi, vo) / max(vi, vo) >= 0.8 and max(vi, vo) >= high_cut:
            flags["pass_through"] = min(vi, vo) / max(vi, vo)
            reasons.append("Receives and forwards a similar high value (pass-through / layering)")

        handles = handles_per_entity.get(w, {w})
        # Using several apps is normal; it only amplifies other red flags
        if len(handles) >= 2 and total >= 2 and flags:
            flags["multi_platform"] = min(1.0, (len(handles) - 1) / 2)
            apps = ", ".join(sorted("@" + x.split("@", 1)[1] for x in handles if "@" in x))
            reasons.append(f"Likely same holder operating {len(handles)} handles across apps ({apps})")

        h = int(high_val.get(w, 0))
        if h >= 1:
            flags["high_value"] = min(1.0, h / 2)
            reasons.append(f"{h} transfer(s) far above the ledger's typical amount")

        raw = sum(WEIGHTS[f] * v for f, v in flags.items())
        # Co-occurring red flags compound risk; squash into [0, 1)
        score = float(1.0 - np.exp(-2.2 * raw))
        results[w] = WalletTypology(score=score, flags=flags, reasons=reasons)

    _propagate_from_hubs(tx, results, high_cut)
    # Map entity-level results back to every handle that was asked for
    return {h: results.get(entity_of.get(h, h), WalletTypology(0.0)) for h in wallet_ids}


def entity_key(handle: str) -> str:
    """UPI VPA 'name123@ybl' -> 'name123' so one holder's handles on different apps merge."""
    if "@" in handle:
        local = handle.split("@", 1)[0].strip().lower()
        if local:
            return local
    return handle


HUB_MIN_SCORE = 0.5      # only strongly flagged wallets spread risk
PROPAGATION = 0.7        # fraction of a hub's risk passed to a direct counterparty


def _propagate_from_hubs(tx: pd.DataFrame, results: Dict[str, WalletTypology], high_cut: float) -> None:
    """One hop of guilt-by-association: mules/feeders of a flagged hub inherit risk.

    Hubs flagged for structure (fan-out, fan-in, bursts, pass-through) spread risk
    over every edge; other hubs only over unusual transfers (near a threshold or
    high value). A busy but otherwise clean wallet (< HUB_MIN_SCORE) spreads nothing.
    """
    own = {w: r.score for w, r in results.items()}
    hubs = {w for w, s in own.items() if s >= HUB_MIN_SCORE}
    if not hubs:
        return
    structural = {w for w in hubs if STRUCTURAL_FLAGS & results[w].flags.keys()}
    unusual = tx["near_thr"] | (tx["amt"] >= high_cut)
    inherited: Dict[str, tuple] = {}
    for src, dst, flag in zip(tx["src"], tx["dst"], unusual):
        for wallet, hub in ((src, dst), (dst, src)):
            # A fan-out/fan-in/burst hub taints all its counterparties; other hubs
            # only through transfers that are themselves unusual.
            if hub in hubs and wallet != hub and (flag or hub in structural):
                cand = PROPAGATION * own[hub]
                if cand > inherited.get(wallet, (0.0, ""))[0]:
                    inherited[wallet] = (cand, hub)
    for wallet, (cand, hub) in inherited.items():
        r = results.get(wallet)
        if r is None or cand <= 0:
            continue
        combined = 1.0 - (1.0 - r.score) * (1.0 - cand)
        if combined > r.score:
            r.flags["linked_to_flagged_hub"] = cand
            r.reasons.append(f"Direct unusual transfer with flagged wallet {hub}")
            r.score = float(combined)
