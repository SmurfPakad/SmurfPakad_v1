/**
 * LiveAlertBanner — Real-time WebSocket alert component
 * Shows a dismissable red banner at the top of the dashboard
 * when the backend flags a new high-risk wallet via WebSocket.
 *
 * Falls back gracefully when backend is offline (no errors shown).
 */
import { useState, useEffect, useRef } from "react";
import { AlertTriangle, X, ArrowRight, Wifi, WifiOff } from "lucide-react";
import { Link } from "react-router-dom";
import gsap from "gsap";

interface Alert {
  sample?: boolean;
  id: string;
  walletId: string;
  riskScore: number;
  platform: string;
  message: string;
  timestamp: string;
}

const WS_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000")
  .replace("http://", "ws://")
  .replace("https://", "wss://");

export default function LiveAlertBanner() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [connected, setConnected] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const wsRef = useRef<WebSocket | null>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>();
  const unmounted = useRef(false);

  const connectWS = () => {
    const token = localStorage.getItem("authToken");
    // The backend's /ws endpoint requires a real JWT; offline demo sessions skip the socket.
    if (!token || token === "offline-demo" || unmounted.current) return;
    try {
      const ws = new WebSocket(`${WS_URL}/ws?token=${encodeURIComponent(token)}`);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        // WS connected silently
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          // Backend broadcasts { type: "safeguard_alert", data: {...} }
          const data = msg.type === "safeguard_alert" ? { ...msg.data, type: "high_risk_alert" } : msg;
          if (data.type === "high_risk_alert" || data.riskScore > 0.75) {
            const alert: Alert = {
              id: data.id || crypto.randomUUID(),
              walletId: data.walletId || data.wallet_id || "Unknown",
              riskScore: data.riskScore || data.risk_score || 0.9,
              platform: data.platform || "Unknown",
              message: data.message || `High-risk wallet detected — ${data.platform}`,
              timestamp: data.timestamp || new Date().toISOString(),
            };
            setAlerts((prev) => [alert, ...prev.slice(0, 4)]); // max 5
            animateIn();
          }
        } catch { /* no-op: invalid JSON from WS is silently discarded */ }
      };

      ws.onclose = () => {
        setConnected(false);
        // Reconnect after 5s silently — but never after the banner unmounted
        if (!unmounted.current) reconnectTimer.current = setTimeout(connectWS, 5000);
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch {
      // Backend offline — silent fail, no UI error
    }
  };

  useEffect(() => {
    unmounted.current = false;
    connectWS();
    return () => {
      unmounted.current = true;
      wsRef.current?.close();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, []);

  const animateIn = () => {
    if (!bannerRef.current) return;
    gsap.fromTo(
      bannerRef.current,
      { y: -6, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.25, ease: "power2.out" }
    );
  };

  const dismiss = (id: string) => {
    setDismissed((prev) => new Set([...prev, id]));
  };

  const visibleAlerts = alerts.filter((a) => !dismissed.has(a.id));

  // Demo mode: inject a sample alert if no WS connection after 3s
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!connected && alerts.length === 0) {
        const demoAlert: Alert = {
          id: "demo-001",
          sample: true,
          walletId: "PTM-0x8f4a...2b91",
          riskScore: 0.94,
          platform: "Paytm",
          message: "Smurfing pattern detected — 47 micro-transactions in 90min",
          timestamp: new Date().toISOString(),
        };
        setAlerts([demoAlert]);
        animateIn();
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [connected]);

  if (visibleAlerts.length === 0) return null;

  return (
    <div ref={bannerRef} className="space-y-2">
      {visibleAlerts.map((alert) => (
        <div
          key={alert.id}
          className="flex items-center gap-3 rounded-xl border border-red-500/25 bg-red-500/[0.06] px-4 py-3"
        >
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-red-600 dark:text-red-300">
              {alert.sample ? "Sample alert" : "Live alert"} · <span className="font-mono">{new Date(alert.timestamp).toLocaleTimeString()}</span>
            </p>
            <p className="truncate text-sm text-zinc-800 dark:text-zinc-100">
              <span className="font-mono">{alert.walletId}</span>
              <span className="text-zinc-500"> · </span>
              {alert.message}
            </p>
          </div>
          <span className="shrink-0 font-mono text-sm tabular-nums text-zinc-700 dark:text-zinc-200">
            {(alert.riskScore * 100).toFixed(0)}
          </span>
          <Link
            to={`/cryptoflow/warroom?walletId=${encodeURIComponent(alert.walletId)}&riskScore=${alert.riskScore}&platform=${encodeURIComponent(alert.platform)}`}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-black/[0.1] px-2.5 py-1.5 text-xs text-zinc-700 transition-colors hover:bg-black/[0.04] dark:border-white/[0.12] dark:text-zinc-200 dark:hover:bg-white/[0.06]"
          >
            Investigate <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          </Link>
          <button
            onClick={() => dismiss(alert.id)}
            className="shrink-0 rounded-md p-1 text-zinc-500 transition-colors hover:bg-black/[0.04] hover:text-zinc-900 dark:hover:bg-white/[0.06] dark:hover:text-white"
            aria-label="Dismiss alert"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      ))}
    </div>
  );
}
