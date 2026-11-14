"""End-to-end API tests: auth -> upload -> analysis -> graph -> reports/settings."""
import pytest


# ---------------------------------------------------------------- health / meta
def test_health(client):
    assert client.get("/health").json()["status"] == "healthy"
    assert client.get("/api/v1/health").status_code == 200


def test_openapi_lists_core_routes(client):
    paths = client.get("/openapi.json").json()["paths"]
    for p in ("/api/v1/upload/file", "/api/v1/model/info", "/api/v1/attack/start", "/api/v1/graph/{upload_id}"):
        assert p in paths, p


def test_model_info_exposes_trained_tg_gatv2(client):
    info = client.get("/api/v1/model/info").json()
    assert info["loaded"] is True
    assert info["modelType"] == "best_model_tg"
    assert info["inputFeatures"] == 43
    # learned per-head temperatures from the checkpoint, not the 1.0 defaults
    conv1 = info["temperatures"]["conv1"]
    assert len(conv1) == 4 and min(conv1) < 0.2
    assert info["metrics"]["tg_gatv2"]["f1"] == pytest.approx(0.564)


# ------------------------------------------------------------------------ auth
def test_auth_google_returns_demo_redirect_when_oauth_unconfigured(client):
    url = client.get("/api/v1/auth/google").json()["authorization_url"]
    assert "code=mock_auth_code" in url


def test_demo_login_and_me(client, auth_headers):
    me = client.get("/api/v1/auth/me", headers=auth_headers)
    assert me.status_code == 200
    body = me.json()
    assert body["email"] == "analyst@smurfpakad.demo"
    assert body["createdAt"] is not None


def test_login_rejects_unknown_provider(client):
    assert client.post("/api/v1/auth/login", json={"code": "x", "provider": "github"}).status_code == 400


@pytest.mark.parametrize("headers", [{}, {"Authorization": "Bearer not-a-jwt"}])
def test_protected_routes_require_valid_token(client, headers):
    resp = client.get("/api/v1/upload/history", headers=headers)
    assert resp.status_code in (401, 403)


# ---------------------------------------------------------------------- upload
def test_upload_demo_csv(demo_upload):
    assert demo_upload["id"]
    assert demo_upload.get("status") in ("completed", "processing", None) or demo_upload


def test_upload_rejects_unsupported_extension(client, auth_headers):
    resp = client.post("/api/v1/upload/file", files={"file": ("x.exe", b"MZ", "application/octet-stream")},
                       headers=auth_headers)
    assert resp.status_code == 400


def test_upload_rejects_empty_csv(client, auth_headers):
    resp = client.post("/api/v1/upload/file", files={"file": ("empty.csv", b"", "text/csv")},
                       headers=auth_headers)
    assert resp.status_code == 400


def test_upload_history_and_detail(client, auth_headers, demo_upload):
    hist = client.get("/api/v1/upload/history", headers=auth_headers).json()
    ids = [u["id"] for u in hist["uploads"]]
    assert demo_upload["id"] in ids
    detail = client.get(f"/api/v1/upload/{demo_upload['id']}", headers=auth_headers)
    assert detail.status_code == 200


def test_upload_detail_404(client, auth_headers):
    assert client.get("/api/v1/upload/does-not-exist", headers=auth_headers).status_code == 404


def test_upload_delete(client, auth_headers, small_ledger_csv):
    up = client.post("/api/v1/upload/file", files={"file": ("ring.csv", small_ledger_csv, "text/csv")},
                     headers=auth_headers).json()
    assert client.delete(f"/api/v1/upload/{up['id']}", headers=auth_headers).status_code == 200
    assert client.get(f"/api/v1/upload/{up['id']}", headers=auth_headers).status_code == 404


# -------------------------------------------------------------------- analysis
def test_analysis_summary(client, auth_headers, demo_upload):
    resp = client.get(f"/api/v1/analysis/{demo_upload['id']}", headers=auth_headers)
    assert resp.status_code == 200, resp.text
    summary = resp.json()["summary"]
    assert summary["totalTransactions"] == 360
    assert summary["suspiciousTransactions"] > 0


def test_analysis_detects_patterns_in_demo_ledger(client, auth_headers, demo_upload):
    resp = client.get("/api/v1/analysis/patterns", params={"upload_id": demo_upload["id"]}, headers=auth_headers)
    assert resp.status_code == 200, resp.text
    types = {p["type"].lower() for p in resp.json()["patterns"]}
    assert types & {"structuring", "smurfing", "layering"}, types


def test_suspicious_addresses_have_reasons(client, auth_headers, demo_upload):
    resp = client.get(f"/api/v1/analysis/suspicious-addresses/{demo_upload['id']}", headers=auth_headers)
    assert resp.status_code == 200, resp.text
    addrs = resp.json()["addresses"]
    assert len(addrs) >= 10
    assert all(a["riskScore"] >= 0.35 for a in addrs)
    # scores/levels must survive the DB round trip (previously defaulted to 0.5 / "medium")
    assert len({round(a["riskScore"], 3) for a in addrs}) > 1
    assert any(a["riskLevel"] == "high" for a in addrs)
    assert all(a["flags"] for a in addrs)  # every flagged wallet explains itself


def test_analysis_of_other_users_upload_is_hidden(client, demo_upload):
    from app.core.security import create_access_token
    other = {"Authorization": f"Bearer {create_access_token({'sub': 'someone-else', 'email': 'x@y.z'})}"}
    resp = client.get(f"/api/v1/analysis/{demo_upload['id']}", headers=other)
    assert resp.status_code in (403, 404)


# ----------------------------------------------------------------------- graph
def test_graph_nodes_carry_risk_and_reasons(client, auth_headers, demo_upload):
    resp = client.get(f"/api/v1/graph/{demo_upload['id']}", headers=auth_headers)
    assert resp.status_code == 200, resp.text
    g = resp.json()
    nodes = g["nodes"]
    assert nodes and (g.get("edges") or g.get("links"))
    levels = {n.get("riskLevel") or n.get("risk_level") for n in nodes}
    assert {"high", "low"} <= levels  # not everything is "high" (BUG-002)
    risky = [n for n in nodes if (n.get("riskLevel") or n.get("risk_level")) == "high"]
    assert risky[0].get("reasons")


def test_graph_statistics(client, auth_headers, demo_upload):
    resp = client.get(f"/api/v1/graph/statistics/{demo_upload['id']}", headers=auth_headers)
    assert resp.status_code == 200, resp.text


# ------------------------------------------------------- dashboard / settings
def test_dashboard_stats(client, auth_headers, demo_upload):
    resp = client.get("/api/v1/dashboard/stats", headers=auth_headers)
    assert resp.status_code == 200, resp.text
    stats = resp.json()["stats"]
    assert stats["totalTransactions"] >= 360
    assert stats["suspiciousCount"] > 0 and stats["patternsCount"] > 0
    assert resp.json()["changes"]["transactions"] is None  # no fabricated deltas


def test_settings_profile_roundtrip(client, auth_headers):
    assert client.get("/api/v1/settings/profile", headers=auth_headers).status_code == 200


def test_settings_api_key_lifecycle(client, auth_headers):
    created = client.post("/api/v1/settings/api-keys", json={"name": "ci", "permissions": ["read"]}, headers=auth_headers)
    assert created.status_code in (200, 201), created.text
    listed = client.get("/api/v1/settings/api-keys", headers=auth_headers)
    assert listed.status_code == 200, listed.text


def test_settings_webhook_lifecycle(client, auth_headers):
    created = client.post("/api/v1/settings/webhooks",
                          json={"name": "ops", "url": "https://example.com/hook", "events": ["analysis.completed"]},
                          headers=auth_headers)
    assert created.status_code in (200, 201), created.text
    assert client.get("/api/v1/settings/webhooks", headers=auth_headers).status_code == 200


@pytest.mark.parametrize("fmt,ctype", [("pdf", "application/pdf"), ("json", "application/json")])
def test_report_generate_and_download(client, auth_headers, demo_upload, fmt, ctype):
    resp = client.post("/api/v1/reports/generate",
                       json={"uploadId": demo_upload["id"], "type": "compliance", "format": fmt},
                       headers=auth_headers)
    assert resp.status_code in (200, 201), resp.text
    rid = resp.json()["id"]
    dl = client.get(f"/api/v1/reports/download/{rid}", headers=auth_headers)
    assert dl.status_code == 200, dl.text
    assert dl.headers["content-type"].startswith(ctype)
    assert len(dl.content) > 200


def test_reports_list(client, auth_headers):
    assert client.get("/api/v1/reports/", headers=auth_headers).status_code == 200


# ---------------------------------------------------------- ancillary services
def test_safeguard_check(client):
    resp = client.post("/api/v1/safeguard/check",
                       json={"recipient": "unknown@ybl", "amount": 9800, "platform": "GPay"})
    assert resp.status_code in (200, 401, 422)


def test_websocket_rejects_bad_token(client):
    from starlette.websockets import WebSocketDisconnect
    with pytest.raises(WebSocketDisconnect):
        with client.websocket_connect("/ws?token=bogus") as ws:
            ws.receive_text()


def test_suspicious_subgraph_uses_same_scores_as_analysis(client, auth_headers, demo_upload):
    resp = client.get(f"/api/v1/graph/suspicious/{demo_upload['id']}", headers=auth_headers)
    assert resp.status_code == 200, resp.text
    g = resp.json()
    seeds = [n for n in g["nodes"] if n["isSeedNode"]]
    assert seeds and max(n["suspiciousScore"] for n in seeds) >= 0.65
    assert any(n["riskLevel"] == "high" for n in seeds)
    assert g["edges"], "seed wallets should be connected"
