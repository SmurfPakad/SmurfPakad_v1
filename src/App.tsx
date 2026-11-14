import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ToastContainer } from "@/components/ToastNotification";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthCallback from "./pages/AuthCallback";
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Upload = lazy(() => import("./pages/Upload"));
const Analysis = lazy(() => import("./pages/Analysis"));
const Graph = lazy(() => import("./pages/Graph"));
const Reports = lazy(() => import("./pages/Reports"));
const Settings = lazy(() => import("./pages/Settings"));
const Patterns = lazy(() => import("./pages/Patterns"));
const Benchmarks = lazy(() => import("./pages/Benchmarks"));
const Heatmap = lazy(() => import("./pages/Heatmap"));
const LiveThreatMap = lazy(() => import("./pages/LiveThreatMap"));
const WarRoom = lazy(() => import("./pages/WarRoom"));
const AgentChat = lazy(() => import("./pages/AgentChat"));
const Governance = lazy(() => import("./pages/Governance"));
const FederatedDemo = lazy(() => import("./pages/FederatedDemo"));
const ComplianceDashboard = lazy(() => import("./pages/ComplianceDashboard"));
const Documentation = lazy(() => import("./pages/Documentation"));

const queryClient = new QueryClient();

// Pages are code-split; this shows while a page chunk downloads.
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#0a0b10]" role="status" aria-label="Loading">
    <div className="h-8 w-8 rounded-full border-2 border-violet-400/30 border-t-violet-400 animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ToastContainer />
        <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/cryptoflow" element={<Index />} />
          <Route path="/cryptoflow/auth/callback" element={<AuthCallback />} />
          <Route path="/cryptoflow/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/cryptoflow/threats" element={
            <ProtectedRoute>
              <LiveThreatMap />
            </ProtectedRoute>
          } />
          <Route path="/cryptoflow/warroom" element={
            <ProtectedRoute>
              <WarRoom />
            </ProtectedRoute>
          } />
          <Route path="/cryptoflow/upload" element={
            <ProtectedRoute>
              <Upload />
            </ProtectedRoute>
          } />
          <Route path="/cryptoflow/analysis" element={
            <ProtectedRoute>
              <Analysis />
            </ProtectedRoute>
          } />
          <Route path="/cryptoflow/graph" element={
            <ProtectedRoute>
              <Graph />
            </ProtectedRoute>
          } />
          <Route path="/cryptoflow/heatmap" element={
            <ProtectedRoute>
              <Heatmap />
            </ProtectedRoute>
          } />
          <Route path="/cryptoflow/reports" element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          } />
          <Route path="/cryptoflow/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/cryptoflow/patterns" element={
            <ProtectedRoute>
              <Patterns />
            </ProtectedRoute>
          } />
          <Route path="/cryptoflow/benchmarks" element={
            <ProtectedRoute>
              <Benchmarks />
            </ProtectedRoute>
          } />
          <Route path="/cryptoflow/agent" element={
            <ProtectedRoute>
              <AgentChat />
            </ProtectedRoute>
          } />
          <Route path="/cryptoflow/governance" element={
            <ProtectedRoute>
              <Governance />
            </ProtectedRoute>
          } />
          <Route path="/cryptoflow/federated" element={
            <ProtectedRoute>
              <FederatedDemo />
            </ProtectedRoute>
          } />
          <Route path="/cryptoflow/compliance" element={
            <ProtectedRoute>
              <ComplianceDashboard />
            </ProtectedRoute>
          } />
          <Route path="/cryptoflow/documentation" element={
            <ProtectedRoute>
              <Documentation />
            </ProtectedRoute>
          } />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

