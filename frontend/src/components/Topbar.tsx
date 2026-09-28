import React, { useState } from 'react';
import { RefreshCw, Cpu, Layers, User, LogIn, UserPlus, LogOut, X } from 'lucide-react';

interface TopbarProps {
  title: string;
  subtitle?: string;
  tokenBudget: number;
  onRefresh?: () => void;
  loading?: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({
  title,
  subtitle,
  tokenBudget,
  onRefresh,
  loading
}) => {
  const [user, setUser] = useState<{ email: string; name: string } | null>({
    name: 'Demo Architect',
    email: 'architect@enterprise.io'
  });
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  const [emailInput, setEmailInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    setUser({
      name: emailInput.split('@')[0] || 'User',
      email: emailInput
    });
    setShowAuthModal(false);
    setEmailInput('');
    setPasswordInput('');
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h2 className="text-lg font-bold text-slate-100">{title}</h2>
        {subtitle && <p className="text-xs text-slate-400 font-medium">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Token Budget Chip */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span>Max Budget:</span>
          <span className="font-bold text-indigo-300">{tokenBudget} tokens</span>
        </div>

        {/* C++ Engine Chip */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300">
          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          <span>C++20 Engine</span>
        </div>

        {/* Refresh Action */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            title="Refresh Data"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 border border-slate-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        )}

        {/* Authentication Controls */}
        {user ? (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-850 border border-slate-750 text-xs">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-mono text-slate-200 font-medium max-w-28 truncate">{user.name}</span>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <button
              onClick={() => { setAuthMode('signin'); setShowAuthModal(true); }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5 text-indigo-400" /> Sign In
            </button>
            <button
              onClick={() => { setAuthMode('register'); setShowAuthModal(true); }}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <UserPlus className="w-3.5 h-3.5" /> Create Account
            </button>
          </div>
        )}
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                {authMode === 'signin' ? <LogIn className="w-4 h-4 text-indigo-400" /> : <UserPlus className="w-4 h-4 text-indigo-400" />}
                {authMode === 'signin' ? 'Sign In to Workspace' : 'Create Enterprise Account'}
              </h3>
              <button
                onClick={() => setShowAuthModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="developer@enterprise.io"
                  className="w-full bg-slate-850 border border-slate-750 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-indigo-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-850 border border-slate-750 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-indigo-500 outline-none font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs transition-colors shadow-sm"
              >
                {authMode === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="text-center text-xs text-slate-400 pt-1">
              {authMode === 'signin' ? (
                <span>Need an account? <button onClick={() => setAuthMode('register')} className="text-indigo-400 underline font-semibold">Create Account</button></span>
              ) : (
                <span>Already have an account? <button onClick={() => setAuthMode('signin')} className="text-indigo-400 underline font-semibold">Sign In</button></span>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
