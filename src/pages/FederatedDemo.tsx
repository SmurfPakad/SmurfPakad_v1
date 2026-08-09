import React, { useState } from 'react';
import { Play, Loader2, Lock, Server, Database, ArrowRight, CheckCircle2, Shield, Zap } from 'lucide-react';
import FederatedGlobe3D from '@/components/FederatedGlobe3D';
import { usePageEntrance } from '@/hooks/useGSAP';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface RoundData {
  round: number;
  globalMetrics: { accuracy: number; f1Score: number; averageLoss: number };
  clients: { client: string; accuracy: number; f1: number; finalLoss: number; transactions: number }[];
}

interface SimResult {
  simulationId: string;
  config: { numRounds: number; numClients: number; algorithm: string };
  rounds: RoundData[];
  finalMetrics: { accuracy: number; f1Score: number; averageLoss: number };
  improvement: { accuracyGain: number; convergenceRound: number };
  federatedVsIsolated: {
    federated: { accuracy: number; f1Score: number };
    isolated: { averageAccuracy: number; averageF1: number; perClient: { client: string; accuracy: number; f1: number }[] };
    improvement: { accuracyGain: number; f1Gain: number };
    verdict: string;
  };
  privacySummary: { rawDataShared: boolean; totalDataPoints: number; dataPointsExposed: number; privacyTechnique: string; complianceNote: string };
}

const BANKS = [
  { name: 'Paytm (Bank A)', color: '#2196F3', txns: '5,000', fraud: '2.2%' },
  { name: 'PhonePe (Bank B)', color: '#7C3AED', txns: '3,500', fraud: '3.1%' },
  { name: 'GPay (Bank C)', color: '#10B981', txns: '2,800', fraud: '1.8%' },
];

export default function FederatedDemo() {
  const [result, setResult] = useState<SimResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeRound, setActiveRound] = useState(0);

  usePageEntrance(".federated-content");

  const runSimulation = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${API}/api/v1/federated/simulate?num_rounds=10`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
        setActiveRound(data.rounds.length - 1);
      }
    } catch { /* offline fallback handled by UI */ }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0b10] to-[#0f1117] text-white p-6 space-y-6 federated-content">
      {/* Header + 3D Globe */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-center">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <Server className="w-7 h-7 text-purple-400" />
                Federated Learning Demo
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Privacy-preserving cross-bank AML training — each bank keeps its data, only gradients are shared
              </p>
            </div>
            <button
              onClick={runSimulation}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 text-sm font-medium shadow-lg shadow-purple-600/20 transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {loading ? 'Training...' : 'Run Simulation'}
            </button>
          </div>
          {/* Privacy badges */}
          <div className="flex flex-wrap gap-2">
            {['FedAvg Algorithm', '(ε=1.0, δ=1e-5)-DP', 'GDPR Article 5(1)(c)', 'Zero Data Exposure'].map(badge => (
              <span key={badge} className="px-3 py-1 text-xs rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300">{badge}</span>
            ))}
          </div>
        </div>
        <div className="relative rounded-xl overflow-hidden border border-purple-500/20">
          <div className="absolute top-3 left-4 z-10 text-xs text-purple-300 font-semibold uppercase tracking-widest">
            {loading ? '🔄 Training in progress...' : '3D Federation Model'}
          </div>
          <FederatedGlobe3D height="280px" isTraining={loading} />
        </div>
      </div>

      {/* The Story Card */}
      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-5">
        <h2 className="text-lg font-bold text-white mb-2">🔒 Why Federated Learning?</h2>
        <p className="text-sm text-gray-300 leading-relaxed">
          <strong className="text-purple-300">The Problem:</strong> Banks can't share customer data due to privacy regulations (GDPR, PCI-DSS). 
          But smurfing happens <em>across</em> banks — money enters Paytm, moves through PhonePe, exits via GPay. 
          No single bank can see the full picture.
        </p>
        <p className="text-sm text-gray-300 leading-relaxed mt-2">
          <strong className="text-blue-300">Our Solution:</strong> Each bank trains the GNN model on its local data. 
          Only model <em>gradients</em> (not raw data) are shared with a federated server via <strong>FedAvg</strong>. 
          The combined model catches cross-bank patterns that no single institution could detect alone.
        </p>
      </div>

      {/* Architecture Diagram */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-gray-300 mb-5">Architecture</h2>
        <div className="flex flex-col md:flex-row items-center gap-4 justify-center">
          {/* Banks */}
          {BANKS.map((bank, i) => (
            <React.Fragment key={bank.name}>
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 border border-white/10 min-w-[140px]" style={{ borderColor: `${bank.color}33` }}>
                <Database className="w-6 h-6" style={{ color: bank.color }} />
                <span className="text-xs font-medium text-gray-200">{bank.name}</span>
                <span className="text-[10px] text-gray-500">{bank.txns} txns · {bank.fraud} fraud</span>
                <div className="flex items-center gap-1 mt-1">
                  <Lock className="w-3 h-3 text-green-400" />
                  <span className="text-[9px] text-green-400">Data stays local</span>
                </div>
              </div>
              {i < BANKS.length - 1 && <ArrowRight className="w-4 h-4 text-gray-600 hidden md:block rotate-0" />}
            </React.Fragment>
          ))}
          
          {/* Arrow down to server */}
          <div className="hidden md:flex flex-col items-center mx-2">
            <div className="w-px h-8 bg-gradient-to-b from-purple-500 to-blue-500" />
            <span className="text-[9px] text-gray-500 my-1">Gradients only</span>
            <div className="w-px h-8 bg-gradient-to-b from-blue-500 to-cyan-500" />
          </div>

          {/* Server */}
          <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 min-w-[160px]">
            <Server className="w-6 h-6 text-purple-400" />
            <span className="text-xs font-medium text-purple-300">Federated Server</span>
            <span className="text-[10px] text-gray-500">FedAvg Aggregation</span>
            <span className="text-[9px] text-green-400">Zero raw data access</span>
          </div>
        </div>
      </div>

      {/* Results */}
      {result && (
        <>
          {/* Federated vs Isolated Comparison */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              Federated vs Isolated Training
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Federated */}
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <span className="text-sm font-medium text-green-300">Federated (SmurfPakad)</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-3xl font-bold text-white">{(result.federatedVsIsolated.federated.accuracy * 100).toFixed(1)}%</p>
                    <p className="text-xs text-gray-500">Accuracy</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-white">{(result.federatedVsIsolated.federated.f1Score * 100).toFixed(1)}%</p>
                    <p className="text-xs text-gray-500">F1 Score</p>
                  </div>
                </div>
              </div>
              {/* Isolated */}
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-red-400" />
                  <span className="text-sm font-medium text-red-300">Isolated (Traditional)</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-3xl font-bold text-white">{(result.federatedVsIsolated.isolated.averageAccuracy * 100).toFixed(1)}%</p>
                    <p className="text-xs text-gray-500">Accuracy</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-white">{(result.federatedVsIsolated.isolated.averageF1 * 100).toFixed(1)}%</p>
                    <p className="text-xs text-gray-500">F1 Score</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 px-4 py-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <p className="text-sm text-purple-200">
                📈 <strong>+{(result.federatedVsIsolated.improvement.accuracyGain * 100).toFixed(1)}% accuracy gain</strong> from federated learning. 
                Converged in round {result.improvement.convergenceRound}.
              </p>
              <p className="text-xs text-gray-400 mt-1">{result.federatedVsIsolated.verdict}</p>
            </div>
          </div>

          {/* Training Rounds Chart */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-300 mb-4">Training Convergence (Accuracy per Round)</h2>
            <div className="flex items-end gap-1 h-40">
              {result.rounds.map((round, i) => {
                const height = round.globalMetrics.accuracy * 100;
                const isActive = i === activeRound;
                return (
                  <button
                    key={i}
                    onClick={() => setActiveRound(i)}
                    className={`flex-1 rounded-t transition-all duration-300 ${isActive ? 'bg-gradient-to-t from-purple-600 to-blue-400' : 'bg-gradient-to-t from-purple-600/40 to-blue-400/40 hover:from-purple-600/60 hover:to-blue-400/60'}`}
                    style={{ height: `${Math.max(height - 30, 5)}%` }}
                    title={`Round ${round.round}: ${(round.globalMetrics.accuracy * 100).toFixed(1)}%`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-[10px] text-gray-600">Round 1</span>
              <span className="text-[10px] text-gray-600">Round {result.rounds.length}</span>
            </div>
          </div>

          {/* Per-Client Details for Active Round */}
          {result.rounds[activeRound] && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-gray-300 mb-4">
                Round {result.rounds[activeRound].round} — Per-Client Metrics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {result.rounds[activeRound].clients.map((client, i) => (
                  <div key={i} className="bg-white/5 rounded-lg p-4 border border-white/5">
                    <p className="text-sm font-medium text-gray-200 mb-2" style={{ color: BANKS[i]?.color }}>{client.client}</p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-lg font-bold text-white">{(client.accuracy * 100).toFixed(1)}%</p>
                        <p className="text-[10px] text-gray-500">Accuracy</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-white">{(client.f1 * 100).toFixed(1)}%</p>
                        <p className="text-[10px] text-gray-500">F1</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-white">{client.finalLoss.toFixed(3)}</p>
                        <p className="text-[10px] text-gray-500">Loss</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Privacy Summary */}
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-green-300 mb-3 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Privacy Guarantee
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-2xl font-bold text-white">{result.privacySummary.totalDataPoints.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Total Data Points</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-400">{result.privacySummary.dataPointsExposed}</p>
                <p className="text-xs text-gray-500">Data Points Exposed</p>
              </div>
              <div>
                <p className="text-sm font-medium text-white mt-1">{result.privacySummary.privacyTechnique}</p>
              </div>
              <div>
                <p className="text-sm text-green-300 mt-1">{result.privacySummary.complianceNote}</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Call to action if no result yet */}
      {!result && !loading && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Server className="w-16 h-16 text-purple-500/30 mb-4" />
          <p className="text-gray-500 mb-2">Click <strong className="text-purple-400">"Run Simulation"</strong> to train across 3 banks</p>
          <p className="text-xs text-gray-600">Simulates 10 rounds of FedAvg with Paytm, PhonePe, and GPay data partitions</p>
        </div>
      )}
    </div>
  );
}
