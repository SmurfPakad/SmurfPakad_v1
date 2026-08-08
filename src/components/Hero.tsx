
import { useState, useEffect, useRef } from 'react';
import { ArrowRight, ArrowUpRight, ChevronRight, Shield, Brain, Zap } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import graphImage from '@/images/laundering_graph.png';

// ============================================================================
// Animated Counter Hook
// ============================================================================
function useCountUp(target: number, duration = 2000, decimals = 0) {
  const [value, setValue] = useState(0);
  const startTime = useRef<number | null>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(eased * target);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return decimals > 0 ? value.toFixed(decimals) : Math.floor(value).toLocaleString();
}

// ============================================================================
// Stat Counter Component
// ============================================================================
function AnimatedStat({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const count = useCountUp(value, 2200);
  return (
    <div className="text-center sm:text-left">
      <p className="text-2xl md:text-3xl font-bold text-white tabular-nums">
        {count}
        <span className="text-crypto-purple">{suffix}</span>
      </p>
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}

// ============================================================================
// Hero Component
// ============================================================================
const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 150);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-gradient-hero hero-glow">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-crypto-purple/10 rounded-full filter blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-crypto-light-purple/10 rounded-full filter blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        {/* Extra floating orbs */}
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-blue-500/5 rounded-full filter blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-pink-500/5 rounded-full filter blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="flex flex-col lg:flex-row items-center">
          {/* Left Column */}
          <div className={`lg:w-1/2 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            {/* Badge Row */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <div className="inline-flex items-center bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5">
                <span className="text-xs font-medium text-crypto-purple mr-2">RegTech Solution</span>
                <span className="text-xs text-gray-300">Graph Neural Network Powered</span>
                <ChevronRight className="h-4 w-4 text-gray-400 ml-1" />
              </div>
              {/* IBM Badge */}
              <div className="inline-flex items-center gap-1.5 bg-blue-500/10 backdrop-blur-sm border border-blue-500/20 rounded-full px-3 py-1.5">
                <span className="text-blue-400 font-bold text-xs">IBM</span>
                <span className="text-blue-300/70 text-[10px]">watsonx.ai</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="text-gradient">Hunt Smurfing</span>
              {' '}in
              <br />
              <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                Blockchain Graphs
              </span>
            </h1>

            <p className="text-lg text-gray-300 mb-8 max-w-lg leading-relaxed">
              Detect money laundering patterns using advanced Graph Neural Networks. 
              Identify suspicious "Fan-Out/Fan-In" topologies and layering schemes 
              in blockchain transactions — powered by{' '}
              <span className="text-blue-400 font-medium">IBM watsonx.ai</span>.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/cryptoflow/dashboard">
                <Button size="lg" className="bg-crypto-purple hover:bg-crypto-dark-purple text-white px-8 py-6 shadow-lg shadow-crypto-purple/30 hover:shadow-crypto-purple/50 transition-all duration-300">
                  Analyze Transactions
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/cryptoflow/threats">
                <Button variant="outline" size="lg" className="border-gray-700 text-white hover:bg-white/5 py-6 hover:border-red-500/50 transition-all duration-300">
                  View Live Threats
                  <ArrowUpRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>

            {/* Animated Stats */}
            <div className="mt-10 flex items-center gap-6 sm:gap-8">
              <AnimatedStat value={98.5} suffix="%" label="Detection Accuracy" />
              <div className="h-12 w-px bg-gray-700/50"></div>
              <AnimatedStat value={2500000} suffix="+" label="Wallets Analyzed" />
              <div className="h-12 w-px bg-gray-700/50"></div>
              <AnimatedStat value={15000} suffix="+" label="Illicit Patterns" />
            </div>

            {/* Tech Stack Pills */}
            <div className="mt-6 flex flex-wrap gap-2">
              {[
                { icon: Brain, label: "GNN (GraphSAGE)", color: "text-purple-400 border-purple-500/20 bg-purple-500/5" },
                { icon: Shield, label: "SafeGuard Shield", color: "text-green-400 border-green-500/20 bg-green-500/5" },
                { icon: Zap, label: "Real-time Detection", color: "text-yellow-400 border-yellow-500/20 bg-yellow-500/5" },
              ].map((pill) => (
                <div key={pill.label} className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-medium ${pill.color}`}>
                  <pill.icon className="h-3 w-3" />
                  {pill.label}
                </div>
              ))}
            </div>
          </div>

          {/* Right Column — Graph Image */}
          <div className={`lg:w-1/2 mt-12 lg:mt-0 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <div className="relative max-w-2xl mx-auto animate-float">
              <img 
                src={graphImage}
                alt="Detected Laundering Subgraph - Top 20 Suspicious Transactions" 
                className="rounded-xl shadow-2xl border border-white/10 hover:scale-105 transition-transform duration-500"
              />
              {/* Floating Badge — Bottom Right */}
              <div className="absolute -right-4 -bottom-4 bg-crypto-purple/20 backdrop-blur-md rounded-lg p-4 border border-crypto-purple/30 shadow-lg shadow-purple-500/10">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-red-500/20 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Suspicion Score</p>
                    <p className="text-lg font-bold text-red-500">High (94.2%)</p>
                  </div>
                </div>
              </div>
              {/* Floating Badge — Top Left */}
              <div className="absolute -left-4 -top-4 bg-crypto-purple/20 backdrop-blur-md rounded-lg p-4 border border-crypto-purple/30 shadow-lg shadow-purple-500/10">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-crypto-purple/20 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-crypto-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Pattern Type</p>
                    <p className="text-lg font-bold text-white">Fan-Out/In</p>
                  </div>
                </div>
              </div>
              {/* NEW: IBM Powered Badge — Top Right */}
              <div className="absolute -right-2 -top-2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-500/15 backdrop-blur-md border border-blue-500/25 shadow-lg">
                <span className="text-blue-400 font-bold text-[10px]">IBM</span>
                <span className="text-blue-300/60 text-[9px]">Granite 3.3</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
