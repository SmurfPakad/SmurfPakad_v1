"""Unit tests for schema normalisation, typology scoring and model fidelity."""
from pathlib import Path

import numpy as np
import pandas as pd
import pytest
import torch

from app.services.ml_service import BestModelTG, ml_service
from app.services.tabular import label_columns, normalize_columns
from app.services.typology import entity_key, score_wallets

REPO_ROOT = Path(__file__).resolve().parents[2]


# ------------------------------------------------------------ column aliases
@pytest.mark.parametrize("cols", [
    ["sender", "receiver", "amount", "timestamp"],
    ["from", "to", "value", "date"],
    ["Source_Wallet_ID", "Dest_Wallet_ID", "Amount", "Timestamp"],
    ["nameOrig", "nameDest", "amount", "step"],
])
def test_normalize_columns(cols):
    df = normalize_columns(pd.DataFrame([[1, 2, 3, 4]], columns=cols))
    assert {"Source_Wallet_ID", "Dest_Wallet_ID", "Amount", "Timestamp"} <= set(df.columns)


def test_label_columns_detected():
    df = pd.DataFrame(columns=["sender", "isFraud", "label", "amount"])
    assert set(label_columns(df)) == {"isFraud", "label"}


# ------------------------------------------------------------------ typology
def _ring():
    rows = []
    for i in range(5):
        rows.append(("boss@ybl", f"mule{i}@paytm", 9500 + i, f"2026-08-01T10:0{i}:00"))
        rows.append((f"mule{i}@paytm", "collector@okaxis", 9400 + i, f"2026-08-01T12:0{i}:00"))
    for i in range(40):
        rows.append((f"user{i}@upi", f"shop{i % 8}@upi", 120 + 13 * i, f"2026-08-{1 + i % 20:02d}T09:00:00"))
    return pd.DataFrame(rows, columns=["Source_Wallet_ID", "Dest_Wallet_ID", "Amount", "Timestamp"])


def test_typology_flags_smurfing_ring_not_shoppers():
    df = _ring()
    ids = sorted(set(df.Source_Wallet_ID) | set(df.Dest_Wallet_ID))
    res = score_wallets(df, ids)
    assert res["boss@ybl"].score >= 0.5 and "fan_out" in res["boss@ybl"].flags
    assert res["collector@okaxis"].score >= 0.5 and "fan_in" in res["collector@okaxis"].flags
    assert all(res[f"mule{i}@paytm"].score >= 0.35 for i in range(5))
    assert all(res[f"user{i}@upi"].score < 0.35 for i in range(40))
    assert res["boss@ybl"].reasons  # explanation is always given


def test_entity_resolution_merges_upi_handles():
    assert entity_key("kavita7537@ybl") == entity_key("kavita7537@okaxis") == "kavita7537"
    assert entity_key("0xabc") == "0xabc"


def test_typology_on_shipped_demo_has_no_false_positives():
    from app.services.tabular import read_transactions
    df = read_transactions(REPO_ROOT / "demo_data" / "upi_transactions_demo.csv")
    ids = sorted(set(df.Source_Wallet_ID.astype(str)) | set(df.Dest_Wallet_ID.astype(str)))
    res = score_wallets(df, ids)
    bad = set(df.loc[df.label == 1, "Source_Wallet_ID"].astype(str)) | set(df.loc[df.label == 1, "Dest_Wallet_ID"].astype(str))
    flagged = {w for w in ids if res[w].score >= 0.35}
    assert flagged and flagged <= bad
    assert len(flagged & bad) / len(bad) >= 0.8


# ------------------------------------------------------------ model fidelity
def test_checkpoint_loads_every_key_including_temperatures():
    sd = torch.load(REPO_ROOT / "AI" / "All_models" / "best_model_tg.pt", map_location="cpu", weights_only=True)
    model = BestModelTG(in_channels=43, hidden_channels=64, heads=4)
    missing, unexpected = model.load_state_dict(sd, strict=True), None  # strict: raises on any mismatch
    assert model.temperatures()["conv1"][0] == pytest.approx(0.1323, abs=1e-3)


def test_predict_outputs_probabilities_for_any_feature_width():
    ml_service.load_model()
    rng = np.random.default_rng(0)
    for width in (6, 43, 80):
        x = rng.normal(size=(12, width)).astype(np.float32)
        ei = np.array([[0, 1, 2, 3, 4], [1, 2, 3, 4, 5]])
        preds, probs = ml_service.predict(x, ei)
        assert probs.shape == (12,) and np.all((probs >= 0) & (probs <= 1))


def test_predict_handles_nan_features_and_no_edges():
    ml_service.load_model()
    x = np.full((3, 43), np.nan, dtype=np.float32)
    _, probs = ml_service.predict(x, np.zeros((2, 0), dtype=np.int64))
    assert np.isfinite(probs).all()
