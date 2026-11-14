import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Award, ChevronLeft, Cpu, Database, Info, Layers, Shield, Target, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, LabelList, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { modelApi, type ModelInfo } from "@/lib/api";

// Validated pair (dataviz validator, dark surface #0f1117): violet = ours, aqua = baseline.
const OURS = "#9085e9";
const BASE = "#199e70";
const OURS_LABEL = "TG-GATv2 (ours)";
const BASE_LABEL = "GATv2 baseline";

// Diverging temperature scale on log(τ): blue = sharper than softmax, gray = τ≈1, red = softer.
const SHARP = [57, 135, 229];   // #3987e5
const MID = [56, 56, 53];       // #383835
const SOFT = [230, 103, 103];   // #e66767
function tempColor(t: number) {
  const x = Math.max(-1, Math.min(1, Math.log(t) / Math.log(8))); // τ = 1/8 → full blue, 8 → full red
  const [a, b] = x < 0 ? [MID, SHARP] : [MID, SOFT];
  const k = Math.abs(x);
  return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * k)).join(",")})`;
}

const METRIC_ROWS: Array<{ key: "f1" | "pr_auc" | "precision" | "recall"; label: string }> = [
  { key: "f1", label: "F1 (suspicious)" },
  { key: "pr_auc", label: "PR-AUC" },
  { key: "precision", label: "Precision" },
  { key: "recall", label: "Recall" },
];

function delta(a: number, b: number) {
  const d = a - b;
  return `${d >= 0 ? "+" : "−"}${Math.abs(d).toFixed(3)}`;
}

export default function Benchmarks() {
  const [info, setInfo] = useState<ModelInfo | null>(null);

  useEffect(() => {
    modelApi.getInfo().then(setInfo);
  }, []);

  const ours = info?.metrics.tg_gatv2;
  const base = info?.metrics.gatv2_baseline;
  const cm = info?.metrics.confusion_matrix;
  const chartData = ours && base
    ? METRIC_ROWS.map(r => ({ metric: r.label, [OURS_LABEL]: ours[r.key], [BASE_LABEL]: base[r.key] }))
    : [];

  return (
    <DashboardLayout>
      <div className="space-y-6 min-h-screen bg-gradient-to-b from-[#0a0b10] to-[#0f1117] text-white -m-4 lg:-m-8 p-4 lg:p-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <button onClick={() => window.history.back()} className="text-gray-400 hover:text-white transition-colors" aria-label="Back">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <Award className="w-6 h-6 text-violet-300" />
              <h1 className="text-2xl font-semibold tracking-tight">Model card · Temperature-Gated GATv2</h1>
            </div>
            <p className="text-sm text-gray-400 ml-16 max-w-2xl">
              Held-out results on Elliptic2 against the published GATv2 baseline. One learnable softmax temperature per
              attention head, 12 extra parameters, same inference cost.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
              <Database className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs font-medium text-gray-200">Elliptic2 · 121,810 subgraphs</p>
                <p className="text-[11px] text-gray-500">2.27% suspicious · temporal split 72/8/20</p>
              </div>
            </div>
            {info && (
              <span className={"text-[11px] px-2 py-0.5 rounded-full border " + (info.offline
                ? "border-amber-400/30 text-amber-300 bg-amber-400/10"
                : "border-emerald-400/30 text-emerald-300 bg-emerald-400/10")}>
                {info.offline ? "Backend offline · showing published numbers" : `Live from ${info.checkpoint} · ${info.parameters.toLocaleString()} params`}
              </span>
            )}
          </div>
        </div>

        {/* KPI tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Test F1", icon: Target, value: ours?.f1.toFixed(3), sub: ours && base ? `${delta(ours.f1, base.f1)} vs GATv2 (${base.f1.toFixed(3)})` : "" },
            { label: "PR-AUC", icon: TrendingUp, value: ours?.pr_auc.toFixed(3), sub: ours && base ? `${delta(ours.pr_auc, base.pr_auc)} vs GATv2 (${base.pr_auc.toFixed(3)})` : "" },
            { label: "Recall", icon: Shield, value: ours?.recall.toFixed(3), sub: ours && base ? `${delta(ours.recall, base.recall)} — catches more schemes` : "" },
            { label: "Decision threshold", icon: Cpu, value: ours?.threshold.toFixed(2), sub: "validation-optimal (baseline: 0.79)" },
          ].map(k => (
            <div key={k.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center gap-2 text-gray-400">
                <k.icon className="w-4 h-4" />
                <span className="text-xs">{k.label}</span>
              </div>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-white">{k.value ?? "—"}</p>
              <p className="mt-1 text-[11px] text-gray-500">{k.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-4">
          {/* Comparison chart */}
          <section className="lg:col-span-3 rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-sm font-semibold text-gray-100">Held-out test metrics</h2>
            <p className="text-xs text-gray-500 mb-4">Positive class = suspicious subgraph. Each model at its own validation-optimal threshold.</p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barGap={2} barCategoryGap="28%" margin={{ top: 20, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="metric" tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 0.8]} tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.04)" }}
                    contentStyle={{ background: "#16181f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: "#e5e7eb" }}
                    itemStyle={{ color: "#d1d5db" }}
                    formatter={(v: number) => v.toFixed(4)}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" formatter={(v: string) => <span style={{ color: "#d1d5db" }}>{v}</span>} />
                  <Bar dataKey={OURS_LABEL} fill={OURS} radius={[4, 4, 0, 0]}>
                    <LabelList dataKey={OURS_LABEL} position="top" formatter={(v: number) => v.toFixed(3)} fill="#e5e7eb" fontSize={11} />
                  </Bar>
                  <Bar dataKey={BASE_LABEL} fill={BASE} radius={[4, 4, 0, 0]}>
                    <LabelList dataKey={BASE_LABEL} position="top" formatter={(v: number) => v.toFixed(3)} fill="#9ca3af" fontSize={11} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex gap-2 rounded-lg bg-white/[0.03] border border-white/5 p-3 text-xs text-gray-400">
              <Info className="w-4 h-4 shrink-0 text-gray-500 mt-0.5" />
              <p>
                We report F1 and PR-AUC rather than accuracy: with 2.27% positives, a model that labels every subgraph
                licit already scores 97.7% accuracy while catching nothing.
              </p>
            </div>
          </section>

          {/* Confusion matrix */}
          <section className="lg:col-span-2 rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-sm font-semibold text-gray-100">Confusion matrix · TG-GATv2</h2>
            <p className="text-xs text-gray-500 mb-4">Test split, threshold {ours?.threshold.toFixed(2) ?? "0.70"} · {cm ? (cm.tn + cm.fp + cm.fn + cm.tp).toLocaleString() : "—"} subgraphs</p>
            {cm && (
              <div className="grid grid-cols-[auto_1fr_1fr] gap-2 text-sm">
                <div />
                <div className="text-center text-[11px] text-gray-500">Predicted licit</div>
                <div className="text-center text-[11px] text-gray-500">Predicted suspicious</div>
                <div className="self-center text-[11px] text-gray-500 pr-1">Actual licit</div>
                <Cell value={cm.tn} label="True negative" tone="good" />
                <Cell value={cm.fp} label="False alarm" tone="warn" />
                <div className="self-center text-[11px] text-gray-500 pr-1">Actual suspicious</div>
                <Cell value={cm.fn} label="Missed" tone="bad" />
                <Cell value={cm.tp} label="Caught" tone="good" />
              </div>
            )}
            {cm && (
              <p className="mt-4 text-xs text-gray-400">
                False-positive rate <span className="text-gray-100 tabular-nums">{((cm.fp / (cm.fp + cm.tn)) * 100).toFixed(2)}%</span> —
                about {Math.round(cm.fp / ((cm.tn + cm.fp) / 1000))} alerts per 1,000 clean subgraphs, which keeps analyst queues workable.
              </p>
            )}
          </section>
        </div>

        {/* Temperature heatmap */}
        <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-sm font-semibold text-gray-100 flex items-center gap-2"><Layers className="w-4 h-4 text-gray-400" /> Learned attention temperatures (τ per head)</h2>
              <p className="text-xs text-gray-500 mt-1 max-w-2xl">
                α = softmax(e / τ). τ &lt; 1 sharpens attention onto the single most informative neighbour; τ = 1 is standard GATv2.
                The specialisation below emerged from training alone.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-gray-400">
              <span>sharper</span>
              <div className="h-2 w-40 rounded-full" style={{ background: `linear-gradient(90deg, ${tempColor(0.125)}, ${tempColor(1)}, ${tempColor(8)})` }} />
              <span>softer</span>
            </div>
          </div>

          {info?.temperatures && (
            <div className="mt-5 overflow-x-auto">
              <table className="min-w-[480px] w-full border-separate" style={{ borderSpacing: 4 }}>
                <thead>
                  <tr>
                    <th className="text-left text-[11px] font-normal text-gray-500 w-24">Layer</th>
                    {[1, 2, 3, 4].map(h => <th key={h} className="text-[11px] font-normal text-gray-500">Head {h}</th>)}
                    <th className="text-left text-[11px] font-normal text-gray-500 pl-3">Reading</th>
                  </tr>
                </thead>
                <tbody>
                  {(["conv1", "conv2", "conv3"] as const).map((layer, i) => (
                    <tr key={layer}>
                      <td className="text-xs text-gray-300">Conv {i + 1}</td>
                      {info.temperatures![layer].map((t, h) => (
                        <td key={h} className="p-0">
                          <div
                            title={`Conv ${i + 1}, head ${h + 1}: τ = ${t.toFixed(3)} (${t < 0.9 ? "sharper" : t > 1.1 ? "softer" : "≈ standard"} attention)`}
                            className="h-12 rounded-md flex items-center justify-center text-sm tabular-nums text-white transition-transform hover:scale-[1.03] cursor-default"
                            style={{ background: tempColor(t) }}
                          >
                            {t.toFixed(2)}
                          </div>
                        </td>
                      ))}
                      <td className="text-xs text-gray-400 pl-3">
                        {i === 0 && "3 heads near one-hot: isolate the discriminative neighbour"}
                        {i === 1 && "2 sharp mixing heads, 2 structural heads"}
                        {i === 2 && "near-standard refinement"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* How production scoring works */}
        <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-sm font-semibold text-gray-100">How uploads are scored</h2>
          <div className="mt-3 grid md:grid-cols-2 gap-4 text-xs text-gray-400 leading-relaxed">
            <p>
              <span className="text-gray-200 font-medium">Elliptic-format data</span> (43 node features) is scored directly by
              TG-GATv2 and flagged at decision threshold {info?.decisionThreshold.toFixed(2) ?? "0.70"}. This is the setting the metrics above describe.
            </p>
            <p>
              <span className="text-gray-200 font-medium">Payment ledgers</span> (sender, receiver, amount, time — UPI, bank, crypto)
              don't carry those features, so each wallet is scored with explainable FATF-style red flags: structuring below
              reporting thresholds, peer-relative fan-in/fan-out and velocity, pass-through layering, cross-app identity
              linking and one-hop propagation from flagged hubs. The GNN probability is still shown alongside as a secondary signal.
            </p>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

function Cell({ value, label, tone }: { value: number; label: string; tone: "good" | "warn" | "bad" }) {
  const ring = tone === "good" ? "border-emerald-400/25" : tone === "warn" ? "border-amber-400/25" : "border-red-400/30";
  return (
    <div className={"rounded-lg border bg-white/[0.03] px-3 py-4 text-center " + ring}>
      <p className="text-2xl font-semibold tabular-nums text-white">{value.toLocaleString()}</p>
      <p className="text-[11px] text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}
