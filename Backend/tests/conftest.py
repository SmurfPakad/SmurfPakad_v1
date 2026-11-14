"""
Test fixtures for the SmurfPakad backend.

Tests run against the real FastAPI app with an isolated, throw-away SQLite
database and upload directory. Set TEST_DATABASE_URL to run the same suite
against PostgreSQL, e.g.:
    TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/smurfpakad_test pytest
"""
import os
import sys
import tempfile
from pathlib import Path

import pytest

# ---- Isolate environment BEFORE the app (and its settings/engine) is imported ----
_TMP = Path(tempfile.mkdtemp(prefix="smurfpakad-tests-"))
os.environ["DATABASE_URL"] = os.environ.get("TEST_DATABASE_URL", f"sqlite:///{(_TMP / 'test.db').as_posix()}")
os.environ["UPLOAD_DIR"] = str(_TMP / "uploads")
os.environ["GOOGLE_CLIENT_ID"] = ""          # forces demo login
os.environ["JWT_SECRET_KEY"] = "test-secret-key-for-pytest-only-0123456789"

BACKEND_DIR = Path(__file__).resolve().parent.parent
REPO_ROOT = BACKEND_DIR.parent
sys.path.insert(0, str(BACKEND_DIR))

from fastapi.testclient import TestClient  # noqa: E402

from main import app  # noqa: E402

DEMO_CSV = REPO_ROOT / "demo_data" / "upi_transactions_demo.csv"


@pytest.fixture(scope="session")
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="session")
def auth_headers(client):
    """Real token from the demo login flow (Google OAuth not configured)."""
    resp = client.post("/api/v1/auth/login", json={"code": "mock_auth_code", "provider": "google"})
    assert resp.status_code == 200, resp.text
    return {"Authorization": f"Bearer {resp.json()['token']}"}


@pytest.fixture(scope="session")
def demo_upload(client, auth_headers):
    """Upload the shipped demo ledger once; returns the upload JSON."""
    with open(DEMO_CSV, "rb") as fh:
        resp = client.post(
            "/api/v1/upload/file",
            files={"file": ("upi_transactions_demo.csv", fh, "text/csv")},
            headers=auth_headers,
        )
    assert resp.status_code == 200, resp.text
    return resp.json()


@pytest.fixture
def small_ledger_csv() -> bytes:
    """A tiny smurfing ring: one source fans out to 4 mules who forward to a collector."""
    rows = ["sender,receiver,amount,timestamp"]
    for i in range(4):
        rows.append(f"boss@ybl,mule{i}@paytm,9{i}00,2026-08-01T10:0{i}:00")
        rows.append(f"mule{i}@paytm,collector@okaxis,9{i}00,2026-08-01T11:0{i}:00")
    for i in range(20):
        rows.append(f"user{i}@upi,shop{i % 5}@upi,{150 + i * 7},2026-08-0{1 + i % 9}T1{i % 10}:30:00")
    return ("\n".join(rows) + "\n").encode()
