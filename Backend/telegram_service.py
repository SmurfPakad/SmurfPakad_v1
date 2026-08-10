"""
Telegram Alert Service for SmurfPakad
Sends real-time high-risk transaction alerts to an ops Telegram chat.
Called from the backend's safeguard/alert pipeline.
"""

import os
import asyncio
import httpx
from datetime import datetime

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID   = os.getenv("TELEGRAM_CHAT_ID", "")

TELEGRAM_API = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}"

RISK_EMOJI = {
    "critical": "🔴",
    "high":     "🟠",
    "medium":   "🟡",
    "low":      "🟢",
}

ACTION_EMOJI = {
    "FILE_SAR":  "📋",
    "ESCALATE":  "⚠️",
    "MONITOR":   "👁",
    "DISMISS":   "✅",
}


def _build_message(alert: dict) -> str:
    """Build a rich Telegram message from an alert dict."""
    risk     = alert.get("riskLevel", "high")
    action   = alert.get("recommendedAction", "ESCALATE")
    wallet   = alert.get("walletId", "unknown")
    amount   = alert.get("amount", 0)
    platform = alert.get("platform", "unknown").upper()
    score    = alert.get("riskScore", 0)
    pattern  = alert.get("pattern", alert.get("reasons", ["Unknown pattern"])[0] if alert.get("reasons") else "Unknown pattern")
    ts       = datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")

    lines = [
        f"{RISK_EMOJI.get(risk, '🔴')} *SmurfPakad AML Alert*",
        f"━━━━━━━━━━━━━━━━━━━━",
        f"🏦 *Platform:* `{platform}`",
        f"💳 *Wallet:* `{wallet}`",
        f"💰 *Amount:* ₹{amount:,.0f}",
        f"📊 *Risk Score:* `{score * 100:.1f}%`  ({risk.upper()})",
        f"🔍 *Pattern:* {pattern}",
        f"",
        f"{ACTION_EMOJI.get(action, '⚠️')} *Recommended Action:* `{action}`",
        f"",
        f"🤖 _Powered by SmurfPakad GATv2 + IBM watsonx.ai_",
        f"🕐 _{ts}_",
    ]
    return "\n".join(lines)


async def send_alert_async(alert: dict) -> bool:
    """
    Async: send a Telegram message for a risk alert.
    Returns True on success, False on failure.
    Silently skips if TOKEN or CHAT_ID is not configured.
    """
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        return False  # Not configured — skip silently

    text = _build_message(alert)

    try:
        async with httpx.AsyncClient(timeout=8) as client:
            resp = await client.post(
                f"{TELEGRAM_API}/sendMessage",
                json={
                    "chat_id":    TELEGRAM_CHAT_ID,
                    "text":       text,
                    "parse_mode": "Markdown",
                },
            )
            return resp.status_code == 200
    except Exception as e:
        print(f"[Telegram] Failed to send alert: {e}")
        return False


def send_alert(alert: dict) -> bool:
    """Sync wrapper — safe to call from non-async FastAPI routes."""
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            # Schedule as a background task — don't block the response
            asyncio.create_task(send_alert_async(alert))
            return True
        else:
            return loop.run_until_complete(send_alert_async(alert))
    except Exception as e:
        print(f"[Telegram] send_alert error: {e}")
        return False


async def send_test_message() -> bool:
    """Send a test message to confirm the bot is working."""
    return await send_alert_async({
        "riskLevel": "high",
        "recommendedAction": "MONITOR",
        "walletId": "test_wallet@paytm",
        "amount": 9800,
        "platform": "paytm",
        "riskScore": 0.87,
        "pattern": "TEST — SmurfPakad Telegram integration active ✅",
    })
