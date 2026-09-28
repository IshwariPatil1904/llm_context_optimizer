import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Zap,
  BarChart3,
  Cpu,
  FileCode,
  BookOpen,
  Info,
  Activity,
  Server,
  SlidersHorizontal
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  backendOnline: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, backendOnline }) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'workspace', label: 'Workspace', icon: Zap },
    { id: 'analyzer', label: 'Documents', icon: FileText },
    { id: 'optimization', label: 'Optimization', icon: SlidersHorizontal },
    { id: 'comparison', label: 'Analytics', icon: BarChart3 },
    { id: 'benchmark', label: 'Benchmarks', icon: Cpu },
    { id: 'guide', label: 'Documentation', icon: BookOpen },
    { id: 'context', label: 'Selected Context', icon: FileCode },
    { id: 'about', label: 'Architecture', icon: Info }
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between h-screen sticky top-0 z-30 select-none">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="font-bold text-slate-100 text-base leading-tight tracking-tight">
              Context<span className="text-indigo-400">Opt</span>
            </h1>
            <p className="text-xs text-slate-400 font-mono">Optimization Engine</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Backend Status Indicator */}
      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-850 rounded-lg p-3 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-mono text-slate-300">C++ REST Core</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                backendOnline ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-amber-400'
              }`}
            />
            <span className="text-[11px] font-semibold text-slate-300 font-mono">
              {backendOnline ? '8080 ON' : 'STANDBY'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
