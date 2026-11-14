import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ChevronRight, Crosshair, Info, Play, ShieldAlert, Upload as UploadIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DashboardLayout } from "@/components/DashboardLayout";
import CrossPlatformGraph from "@/components/CrossPlatformGraph";
import LiveAlertBanner from "@/components/LiveAlertBanner";
import SmurfingAttackDemo from "@/components/SmurfingAttackDemo";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { analysisApi, dashboardApi, isMockId, modelApi, uploadApi, type ModelInfo, type SuspiciousAddress, type Upload } from "@/lib/api";

interface Stats {
  transactions: number;
  flagged: number;
  patterns: number;
  uploads: number;
}

const riskDot = (score: number) => (score >= 0.65 ? "bg-red-500" : score >= 0.35 ? "bg-amber-400" : "bg-emerald-500");
const riskWord = (score: number) => (score >= 0.65 ? "High" : score >= 0.35 ? "Medium" : "Low");
const fmt = (n: number) => n.toLocaleString("en-IN");

/** Signature detail: a wallet handle in mono with its risk dot */
function WalletHandle({ address, score }: { address: string; score: number }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${riskDot(score)}`} aria-label={`${riskWord(score)} risk`} />
      <span className="truncate font-mono text-[13px]">{address}</span>
    </span>
  );
}

export default function Dashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [wallets, setWallets] = useState<SuspiciousAddress[]>([]);
  const [walletsUploadId, setWalletsUploadId] = useState<string | null>(null);
  const [model, setModel] = useState<ModelInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [attackOpen, setAttackOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const [statsRes, historyRes, modelRes] = await Promise.all([
        dashboardApi.getStats().catch(() => null),
        uploadApi.getHistory(1, 5).catch(() => ({ uploads: [] as Upload[] })),
        modelApi.getInfo().catch(() => null),
      ]);
      const s = (statsRes as { stats?: Record<string, number> } | null)?.stats ?? {};
      setIsDemo(Boolean((statsRes as { isDemo?: boolean } | null)?.isDemo));
      setStats({
        transactions: Number(s.totalTransactions ?? s.total_transactions ?? 0),
        flagged: Number(s.suspiciousCount ?? s.suspicious_count ?? 0),
        patterns: Number(s.patternsCount ?? 0),
        uploads: Number(s.activeCases ?? s.total_uploads ?? 0),
      });
      const list = historyRes.uploads || [];
      setUploads(list);
      setModel(modelRes);

      // Highest-risk wallets from the most recent ledger
      const latest = list.find(u => u.status === "completed") ?? list[0];
      const addrRes = await analysisApi.getSuspiciousAddresses(latest?.id).catch(() => ({ addresses: [] }));
      setWallets((addrRes.addresses || []).slice().sort((a, b) => (b.riskScore ?? 0) - (a.riskScore ?? 0)).slice(0, 8));
      setWalletsUploadId(latest?.id ?? null);
      setLoading(false);
    })();
  }, []);

  const latestName = uploads[0]?.name || uploads[0]?.filename;
  const sample = isDemo || isMockId(walletsUploadId);
  const today = new Date().toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });

  const tiles = [
    { label: t("dashboard.total_transactions"), value: stats?.transactions, note: stats ? `across ${fmt(stats.uploads)} ledger${stats.uploads === 1 ? "" : "s"}` : "" },
    { label: t("dashboard.flagged_wallets"), value: stats?.flagged, note: "risk score ≥ 0.50" },
    { label: t("dashboard.patterns_detected"), value: stats?.patterns, note: "structuring, layering, fan-in/out" },
    {
      label: "Model F1 · Elliptic2",
      value: model ? model.metrics.tg_gatv2.f1.toFixed(3) : undefined,
      note: model ? `vs ${model.metrics.gatv2_baseline.f1.toFixed(3)} GATv2 baseline` : "",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Heading */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs text-zinc-500">{today}</p>
            <h2 className="mt-1 text-2xl font-medium tracking-tight">Money-laundering risk across your ledgers</h2>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={attackOpen} onOpenChange={setAttackOpen}>
              <DialogTrigger asChild>
                <button className="inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-lg border border-black/[0.1] px-3 text-sm text-zinc-700 transition-colors hover:bg-black/[0.03] dark:border-white/[0.12] dark:text-zinc-200 dark:hover:bg-white/[0.05]">
                  <Play className="h-4 w-4" strokeWidth={1.5} /> Simulate attack
                </button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] max-w-6xl overflow-hidden p-0">
                <SmurfingAttackDemo />
              </DialogContent>
            </Dialog>
            <Link
              to="/cryptoflow/upload"
              className="inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-lg bg-zinc-900 px-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              <UploadIcon className="h-4 w-4" strokeWidth={1.5} /> {t("dashboard.upload_data")}
            </Link>
          </div>
        </div>

        {sample && !loading && (
          <div className="flex items-start gap-3 rounded-lg border border-amber-400/30 bg-amber-400/[0.08] px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
            <Info className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} />
            <p>Showing sample data. Sign in with the API running and upload a ledger to see your own figures.</p>
          </div>
        )}

        <LiveAlertBanner />

        {/* Stat tiles */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {tiles.map(tile => (
            <div key={tile.label} className="rounded-xl border border-black/[0.08] bg-white p-5 dark:border-white/[0.08] dark:bg-[#141518]">
              <p className="text-sm text-zinc-500">{tile.label}</p>
              <p className="mt-2 text-3xl font-medium tabular-nums tracking-tight">
                {loading || tile.value === undefined ? "—" : typeof tile.value === "number" ? fmt(tile.value) : tile.value}
              </p>
              <p className="mt-1 text-xs text-zinc-500">{tile.note}</p>
            </div>
          ))}
        </div>

        {/* Moment: highest-risk wallets + side column */}
        <div className="grid gap-4 xl:grid-cols-3">
          <section className="rounded-xl border border-black/[0.08] bg-white dark:border-white/[0.08] dark:bg-[#141518] xl:col-span-2">
            <div className="flex items-center justify-between px-5 pt-5">
              <div>
                <h3 className="text-[15px] font-medium">Highest-risk wallets</h3>
                <p className="mt-0.5 text-xs text-zinc-500">
                  {latestName ? <>From <span className="font-mono">{latestName}</span></> : "Most recent ledger"} · each with the red flags that triggered it
                </p>
              </div>
              <Link
                to={`/cryptoflow/analysis${walletsUploadId ? `?uploadId=${walletsUploadId}` : ""}`}
                className="inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-white"
              >
                Full analysis <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
              </Link>
            </div>

            <ul className="mt-4 divide-y divide-black/[0.06] dark:divide-white/[0.06]">
              {loading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <li key={i} className="px-5 py-4">
                    <div className="h-4 w-2/3 animate-pulse rounded bg-black/[0.05] dark:bg-white/[0.06]" />
                  </li>
                ))}
              {!loading && wallets.length === 0 && (
                <li className="px-5 py-10 text-center text-sm text-zinc-500">
                  No flagged wallets yet. Upload a ledger to score it.
                </li>
              )}
              {!loading &&
                wallets.map(w => {
                  const score = w.riskScore ?? w.suspiciousScore ?? 0;
                  const reason = (w.flags || w.patterns || [])[0];
                  return (
                    <li key={w.address} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-1 px-5 py-3 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)_7rem]">
                      <WalletHandle address={w.address} score={score} />
                      <p className="order-3 col-span-2 truncate text-xs text-zinc-500 sm:order-none sm:col-span-1">{reason || "—"}</p>
                      <div className="flex items-center justify-end gap-3">
                        <div className="hidden h-1 w-14 overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/[0.08] sm:block">
                          <div className={`h-full rounded-full ${riskDot(score)}`} style={{ width: `${Math.round(score * 100)}%` }} />
                        </div>
                        <span className="w-8 text-right font-mono text-sm tabular-nums">{Math.round(score * 100)}</span>
                      </div>
                    </li>
                  );
                })}
            </ul>
          </section>

          <div className="space-y-4">
            {[
              { to: "/cryptoflow/threats", icon: ShieldAlert, title: "Live threats", body: "Payment checks and anomaly alerts as they arrive" },
              { to: "/cryptoflow/warroom", icon: Crosshair, title: "War room", body: "Investigate a wallet, get a watsonx.ai brief, file a SAR" },
            ].map(card => (
              <Link
                key={card.to}
                to={card.to}
                className="group flex items-center gap-4 rounded-xl border border-black/[0.08] bg-white p-5 transition-colors hover:bg-zinc-50 dark:border-white/[0.08] dark:bg-[#141518] dark:hover:bg-[#18191d]"
              >
                <card.icon className="h-5 w-5 shrink-0 text-zinc-500" strokeWidth={1.5} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{card.title}</p>
                  <p className="text-xs text-zinc-500">{card.body}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-400 transition-transform group-hover:translate-x-0.5" strokeWidth={1.5} />
              </Link>
            ))}

            <section className="rounded-xl border border-black/[0.08] bg-white p-5 dark:border-white/[0.08] dark:bg-[#141518]">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Recent ledgers</h3>
                <Link to="/cryptoflow/upload" className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white">Upload</Link>
              </div>
              <ul className="mt-3 space-y-1">
                {!loading && uploads.length === 0 && <li className="py-4 text-sm text-zinc-500">No uploads yet</li>}
                {uploads.slice(0, 5).map(u => (
                  <li key={u.id}>
                    <Link
                      to={`/cryptoflow/analysis?uploadId=${u.id}`}
                      className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-mono text-[13px]">{u.name || u.filename}</span>
                        <span className="block text-xs text-zinc-500">
                          {new Date(u.uploadedAt || u.date || Date.now()).toLocaleDateString()}
                          {u.records || u.rows ? ` · ${fmt(Number(u.records || u.rows))} rows` : ""}
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-1.5 text-xs text-zinc-500">
                        <span className={`h-1.5 w-1.5 rounded-full ${u.status === "completed" ? "bg-emerald-500" : u.status === "failed" ? "bg-red-500" : "bg-amber-400"}`} />
                        {u.status}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        {/* Second moment: cross-platform flow */}
        <CrossPlatformGraph />
      </div>
    </DashboardLayout>
  );
}
