import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle2, TrendingUp, Activity, BarChart3, Info, RefreshCw } from 'lucide-react';
import AnalyticsChart3D from '@/components/AnalyticsChart3D';
import { usePageEntrance, useScrollReveal } from '@/hooks/useGSAP';


interface FairnessData {
  fairnessScore: number;
  fairnessGrade: string;
  totalPredictions: number;
  metrics: { demographicParity: number; equalizedOddsProxy: number; scoreDisparity: number };
  byCategory: Record<string, { count: number; meanRiskScore: number; flagRate: number; highRiskRate: number }>;
  byPlatform: Record<string, { count: number; meanRiskScore: number; flagRate: number }>;
  biasAlerts: { severity: string; type: string; message: string; recommendation: string }[];
  recommendations: string[];
}

interface DriftData {
  driftStatus: string;
  baselineMean: number;
  currentMean: number;
  maxDrift: number;
  dailyMetrics: { date: string; meanRiskScore: number; predictions: number; flagRate: number; driftScore: number }[];
}

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export default function Governance() {
  const [fairness, setFairness] = useState<FairnessData | null>(null);
  const [drift, setDrift] = useState<DriftData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fRes, dRes] = await Promise.all([
        fetch(`${API}/api/v1/governance/fairness`),
        fetch(`${API}/api/v1/governance/drift`),
      ]);
      if (fRes.ok) setFairness(await fRes.json());
      if (dRes.ok) setDrift(await dRes.json());
    } catch { /* demo fallback */ }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const gradeColor: Record<string, string> = {
    A: 'text-green-400', B: 'text-blue-400', C: 'text-yellow-400', D: 'text-orange-400', F: 'text-red-400',
  };
  const driftColor: Record<string, string> = {
    STABLE: 'text-green-400', WARNING: 'text-yellow-400', ALERT: 'text-red-400',
  };

  usePageEntrance(".governance-content");
  useScrollReveal();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0b10] to-[#0f1117] text-white p-6 space-y-6 governance-content">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Shield className="w-7 h-7 text-blue-400" />
            AI Governance Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Model fairness, bias detection & drift monitoring — aligned with IBM watsonx.governance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchData} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
            <RefreshCw className={`w-4 h-4 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#054ADA]/10 border border-[#054ADA]/20">
            <span className="text-[#5B8DEF] font-bold text-xs">IBM</span>
            <span className="text-[#5B8DEF]/50 text-[10px]">watsonx.governance</span>
          </div>
        </div>
      </div>

      {/* Top Stats */}
      {fairness && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Fairness Score"
            value={fairness.fairnessScore.toFixed(1)}
            unit="/100"
            extra={<span className={`text-xl font-bold ${gradeColor[fairness.fairnessGrade] || 'text-gray-400'}`}>Grade {fairness.fairnessGrade}</span>}
            color="blue"
          />
          <StatCard
            label="Demographic Parity"
            value={(fairness.metrics.demographicParity * 100).toFixed(1)}
            unit="%"
            extra={<span className={`text-xs ${fairness.metrics.demographicParity < 0.08 ? 'text-green-400' : 'text-yellow-400'}`}>{fairness.metrics.demographicParity < 0.08 ? '✅ Within threshold' : '⚠️ Monitor'}</span>}
            color="purple"
          />
          <StatCard
            label="Score Disparity"
            value={(fairness.metrics.scoreDisparity * 100).toFixed(1)}
            unit="%"
            extra={<span className={`text-xs ${fairness.metrics.scoreDisparity < 0.08 ? 'text-green-400' : 'text-orange-400'}`}>{fairness.metrics.scoreDisparity < 0.08 ? '✅ Low' : '⚠️ Elevated'}</span>}
            color="cyan"
          />
          <StatCard
            label="Drift Status"
            value={drift?.driftStatus || 'N/A'}
            unit=""
            extra={drift && <span className="text-xs text-gray-500">Max drift: {drift.maxDrift.toFixed(1)}%</span>}
            color={drift?.driftStatus === 'STABLE' ? 'green' : 'yellow'}
          />
        </div>
      )}

      {/* 3D Analytics Chart */}
      {fairness && (
        <div className="rounded-xl overflow-hidden border border-blue-500/20 gsap-reveal">
          <div className="bg-blue-500/5 px-4 py-3 border-b border-blue-500/20">
            <h3 className="text-sm font-semibold text-blue-300 uppercase tracking-widest">📊 3D Platform Risk Distribution</h3>
          </div>
          <AnalyticsChart3D
            height="300px"
            bars={Object.entries(fairness.byPlatform || {}).map(([k, v]) => ({
              label: k,
              value: (v as any).meanRiskScore || Math.random() * 0.8 + 0.1,
              color: (v as any).meanRiskScore > 0.7 ? '#ef4444' : (v as any).meanRiskScore > 0.4 ? '#f97316' : '#22c55e',
              sublabel: ((v as any).flagRate * 100).toFixed(0) + '% flagged',
            }))}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Fairness */}
        {fairness && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              Fairness by Wallet Category
            </h2>
            <div className="space-y-3">
              {Object.entries(fairness.byCategory).map(([cat, stats]) => (
                <div key={cat} className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-24 truncate">{cat}</span>
                  <div className="flex-1">
                    <div className="w-full h-3 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-700"
                        style={{ width: `${Math.min(stats.meanRiskScore * 300, 100)}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-gray-300 w-12 text-right font-mono">{(stats.meanRiskScore * 100).toFixed(1)}%</span>
                  <span className="text-[10px] text-gray-500 w-16 text-right">Flag: {(stats.flagRate * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Platform Fairness */}
        {fairness && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Fairness by Platform
            </h2>
            <div className="space-y-3">
              {Object.entries(fairness.byPlatform).map(([plat, stats]) => (
                <div key={plat} className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-28 truncate">{plat}</span>
                  <div className="flex-1">
                    <div className="w-full h-3 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-700"
                        style={{ width: `${Math.min(stats.meanRiskScore * 300, 100)}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-gray-300 w-12 text-right font-mono">{(stats.meanRiskScore * 100).toFixed(1)}%</span>
                  <span className="text-[10px] text-gray-500 w-16 text-right">n={stats.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bias Alerts */}
      {fairness && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            Bias Alerts
          </h2>
          <div className="space-y-2">
            {fairness.biasAlerts.map((alert, i) => (
              <div key={i} className={`flex items-start gap-3 px-4 py-3 rounded-lg border ${
                alert.severity === 'HIGH' ? 'bg-red-500/10 border-red-500/20' :
                alert.severity === 'MEDIUM' ? 'bg-yellow-500/10 border-yellow-500/20' :
                'bg-green-500/10 border-green-500/20'
              }`}>
                {alert.severity === 'HIGH' ? <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" /> :
                 alert.severity === 'MEDIUM' ? <Info className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" /> :
                 <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />}
                <div>
                  <p className="text-sm text-gray-200">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-1">Recommendation: {alert.recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Drift Chart */}
      {drift && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            Prediction Drift (7-Day)
            <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-medium ${
              drift.driftStatus === 'STABLE' ? 'bg-green-500/20 text-green-300' :
              'bg-yellow-500/20 text-yellow-300'
            }`}>{drift.driftStatus}</span>
          </h2>
          <div className="flex items-end gap-2 h-32">
            {drift.dailyMetrics.map((day, i) => {
              const height = (day.meanRiskScore / 0.5) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px] text-gray-500 font-mono">{(day.meanRiskScore * 100).toFixed(1)}%</span>
                  <div className="w-full rounded-t-md bg-gradient-to-t from-blue-600 to-cyan-400 transition-all duration-500"
                    style={{ height: `${Math.max(height, 10)}%` }} />
                  <span className="text-[9px] text-gray-600">{day.date.slice(5)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {fairness && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-300 mb-3">Governance Recommendations</h2>
          <ul className="space-y-1.5">
            {fairness.recommendations.map((rec, i) => (
              <li key={i} className="text-sm text-gray-400">{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, unit, extra, color }: {
  label: string; value: string; unit: string; extra?: React.ReactNode; color: string;
}) {
  const colors: Record<string, string> = {
    blue: 'from-blue-500/10 to-blue-500/5 border-blue-500/20',
    purple: 'from-purple-500/10 to-purple-500/5 border-purple-500/20',
    cyan: 'from-cyan-500/10 to-cyan-500/5 border-cyan-500/20',
    green: 'from-green-500/10 to-green-500/5 border-green-500/20',
    yellow: 'from-yellow-500/10 to-yellow-500/5 border-yellow-500/20',
  };
  return (
    <div className={`bg-gradient-to-br ${colors[color] || colors.blue} border rounded-xl p-4`}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}<span className="text-sm text-gray-500 font-normal">{unit}</span></p>
      {extra && <div className="mt-1">{extra}</div>}
    </div>
  );
}
