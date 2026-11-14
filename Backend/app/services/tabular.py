"""
Shared loading + schema normalisation for uploaded transaction files.

Every service (upload, analysis, graph) reads uploads through ``read_transactions``
so a file with ``sender,receiver,amount`` columns behaves exactly like one with
``Source_Wallet_ID,Dest_Wallet_ID,Amount``.
"""
from pathlib import Path
import re
from typing import Dict, List, Optional

import pandas as pd

SUPPORTED_EXTENSIONS = (".csv", ".xlsx", ".xls", ".json")

# canonical column -> accepted aliases (compared after lower-casing and stripping non-alphanumerics)
COLUMN_ALIASES: Dict[str, List[str]] = {
    "Source_Wallet_ID": ["sourcewalletid", "source", "src", "sender", "senderid", "from", "fromaddress",
                         "fromwallet", "fromaccount", "payer", "origin", "nameorig"],
    "Dest_Wallet_ID": ["destwalletid", "destination", "dest", "dst", "receiver", "receiverid", "recipient",
                       "to", "toaddress", "towallet", "toaccount", "payee", "beneficiary", "namedest"],
    "Amount": ["amount", "amt", "value", "transactionamount", "txnamount", "amountpaid", "sum"],
    "Timestamp": ["timestamp", "time", "date", "datetime", "createdat", "txntime", "transactiontime",
                  "blocktimestamp", "step"],
    "Token_Type": ["tokentype", "token", "currency", "coin", "asset", "paymentcurrency"],
}

# Ground-truth columns that must never reach the model as features
LABEL_COLUMNS = {"label", "class", "isfraud", "is_fraud", "fraud", "islaundering", "is_laundering",
                 "isflaggedfraud", "category", "target", "y"}


def _norm(name: str) -> str:
    return re.sub(r"[^a-z0-9]", "", str(name).lower())


def normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Rename recognised alias columns to their canonical names (first match wins)."""
    if df.empty:
        return df
    normalized = {_norm(c): c for c in df.columns}
    renames: Dict[str, str] = {}
    taken = set(df.columns)
    for canonical, aliases in COLUMN_ALIASES.items():
        if canonical in taken:
            continue
        for alias in [_norm(canonical), *aliases]:
            original = normalized.get(alias)
            if original is not None and original not in renames and original not in COLUMN_ALIASES:
                renames[original] = canonical
                taken.add(canonical)
                break
    return df.rename(columns=renames) if renames else df


def label_columns(df: pd.DataFrame) -> List[str]:
    return [c for c in df.columns if str(c).lower() in LABEL_COLUMNS]


def read_transactions(path: Path) -> pd.DataFrame:
    ext = path.suffix.lower()
    if ext == ".csv":
        df = pd.read_csv(path)
    elif ext in (".xlsx", ".xls"):
        df = pd.read_excel(path)
    elif ext == ".json":
        df = pd.read_json(path)
    else:
        raise ValueError(f"Unsupported file type: {ext}")
    return normalize_columns(df)


def find_upload_file(upload_dir: Path, upload_id: str) -> Optional[Path]:
    for ext in SUPPORTED_EXTENSIONS:
        candidate = upload_dir / f"{upload_id}{ext}"
        if candidate.exists():
            return candidate
    return None
