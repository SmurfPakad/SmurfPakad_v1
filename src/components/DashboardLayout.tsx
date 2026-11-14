import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Award,
  BarChart3,
  BookOpen,
  Bot,
  Crosshair,
  FileText,
  GitBranch,
  Grid3X3,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Network,
  Scale,
  Settings,
  ShieldAlert,
  Share2,
  Sun,
  Target,
  Upload,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useTheme } from "@/contexts/ThemeContext";
import LanguageSwitcher from "./LanguageSwitcher";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

type NavItem = { name: string; href: string; icon: typeof LayoutDashboard };

const navigation: Array<{ label: string; items: NavItem[] }> = [
  {
    label: "Investigate",
    items: [
      { name: "Overview", href: "/cryptoflow/dashboard", icon: LayoutDashboard },
      { name: "Live threats", href: "/cryptoflow/threats", icon: ShieldAlert },
      { name: "War room", href: "/cryptoflow/warroom", icon: Crosshair },
      { name: "AML agent", href: "/cryptoflow/agent", icon: Bot },
    ],
  },
  {
    label: "Data",
    items: [
      { name: "Upload ledger", href: "/cryptoflow/upload", icon: Upload },
      { name: "Analysis", href: "/cryptoflow/analysis", icon: BarChart3 },
      { name: "Transaction graph", href: "/cryptoflow/graph", icon: Share2 },
      { name: "Heatmap", href: "/cryptoflow/heatmap", icon: Grid3X3 },
      { name: "Patterns", href: "/cryptoflow/patterns", icon: GitBranch },
      { name: "Reports", href: "/cryptoflow/reports", icon: FileText },
    ],
  },
  {
    label: "Model and oversight",
    items: [
      { name: "Model card", href: "/cryptoflow/benchmarks", icon: Award },
      { name: "Governance", href: "/cryptoflow/governance", icon: Target },
      { name: "Federated learning", href: "/cryptoflow/federated", icon: Network },
      { name: "Compliance", href: "/cryptoflow/compliance", icon: Scale },
    ],
  },
  {
    label: "Workspace",
    items: [
      { name: "Documentation", href: "/cryptoflow/documentation", icon: BookOpen },
      { name: "Settings", href: "/cryptoflow/settings", icon: Settings },
    ],
  },
];

const allItems = navigation.flatMap(g => g.items);

type ServiceState =
  | { kind: "checking" }
  | { kind: "offline" }
  | { kind: "online"; watsonx: boolean; model?: string };

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [service, setService] = useState<ServiceState>({ kind: "checking" });

  useEffect(() => {
    const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
    fetch(`${API}/api/v1/ibm-ai/status`, { signal: AbortSignal.timeout(3000) })
      .then(r => (r.ok ? r.json() : Promise.reject(r)))
      .then(d => setService({ kind: "online", watsonx: !!d?.configured, model: d?.model }))
      .catch(() => setService({ kind: "offline" }));
  }, []);

  const status = {
    checking: { dot: "bg-zinc-400", text: "Checking services" },
    offline: { dot: "bg-amber-400", text: "API offline · sample data" },
    online: {
      dot: "bg-emerald-500",
      text: service.kind === "online" && service.watsonx ? "API online · watsonx.ai connected" : "API online · local AI fallback",
    },
  }[service.kind];

  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    navigate("/cryptoflow");
  };

  const pageTitle = allItems.find(item => item.href === location.pathname)?.name || "SmurfPakad";

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-[#0e0f11] dark:text-zinc-100">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-black/[0.08] bg-white transition-transform duration-200 ease-out dark:border-white/[0.08] dark:bg-[#121316] lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center justify-between px-4">
          <Link to="/cryptoflow/dashboard" className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-violet-500 text-[11px] font-semibold text-white">SP</span>
            <span className="text-[15px] font-semibold tracking-tight">SmurfPakad</span>
          </Link>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
            <X className="h-4 w-4 text-zinc-500" strokeWidth={1.5} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          {navigation.map(group => (
            <div key={group.label} className="mt-4 first:mt-2">
              <p className="mb-1 px-2 text-xs text-zinc-500">{group.label}</p>
              <div className="space-y-0.5">
                {group.items.map(item => {
                  const active = location.pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`relative flex h-9 items-center gap-2.5 rounded-lg px-2 text-sm transition-colors ${
                        active
                          ? "bg-black/[0.05] font-medium text-zinc-900 dark:bg-white/[0.07] dark:text-white"
                          : "text-zinc-600 hover:bg-black/[0.03] hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/[0.04] dark:hover:text-zinc-100"
                      } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60`}
                    >
                      {active && <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-violet-500" />}
                      <item.icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-black/[0.08] p-3 dark:border-white/[0.08]">
          <div className="mb-2 flex items-center gap-2 px-2 text-xs text-zinc-500">
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${status.dot}`} />
            <span className="truncate">{status.text}</span>
          </div>
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar} alt={user?.name} />
              <AvatarFallback className="bg-zinc-200 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">{user?.name || "Guest"}</p>
              <p className="truncate font-mono text-[11px] text-zinc-500">{user?.email || "Not signed in"}</p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-black/[0.04] hover:text-zinc-900 dark:hover:bg-white/[0.06] dark:hover:text-white"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-black/[0.08] bg-zinc-50/90 px-4 backdrop-blur dark:border-white/[0.08] dark:bg-[#0e0f11]/90 lg:px-8">
          <div className="flex items-center gap-3">
            <button className="lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
              <Menu className="h-5 w-5 text-zinc-500" strokeWidth={1.5} />
            </button>
            <h1 className="text-[15px] font-medium">{pageTitle}</h1>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-black/[0.04] hover:text-zinc-900 dark:hover:bg-white/[0.06] dark:hover:text-white"
              aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" strokeWidth={1.5} /> : <Moon className="h-4 w-4" strokeWidth={1.5} />}
            </button>
          </div>
        </header>

        <main className="mx-auto min-h-screen max-w-[1600px] p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
};
