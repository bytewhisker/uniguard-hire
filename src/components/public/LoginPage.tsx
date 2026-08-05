import React, { useState } from 'react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { ShieldCheck, Lock, ChevronLeft, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, setActivePage } = useRecruitment();
  const [password, setPassword] = useState('admin');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(password);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center items-center px-4 relative overflow-hidden font-sans">
      
      {/* Background design elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        
        {/* Logo Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-zinc-950 shadow-lg mx-auto border border-emerald-400/20">
            <ShieldCheck className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">Uniguard Hire Admin</h2>
          <p className="text-xs text-zinc-400">UK Security Recruitment & Manual Vetting Portal</p>
        </div>

        {/* Card */}
        <div className="linear-card p-6 sm:p-8 rounded-3xl border border-zinc-800 space-y-6">
          
          <div className="border-b border-zinc-850 pb-4">
            <h3 className="text-sm font-bold text-zinc-200">Sign in to Recruitment Desk</h3>
            <p className="text-[11px] text-zinc-400 mt-1">Recruiter credentials are pre-configured for review.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-1 text-xs">
              <label className="block text-zinc-400">Username</label>
              <input
                type="text"
                disabled
                value="admin"
                className="w-full linear-input rounded-xl p-3 bg-zinc-900/40 text-zinc-500 border border-zinc-850 cursor-not-allowed font-mono"
              />
            </div>

            <div className="space-y-1 text-xs">
              <label className="block text-zinc-400">Password</label>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full linear-input rounded-xl p-3 font-mono text-emerald-400 border border-zinc-800 focus:border-emerald-500/60"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/40 transition-all active:scale-[0.98]"
              >
                <span>Sign In as Recruiter</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>

          {/* Preset help info */}
          <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-850 text-[11px] text-zinc-400 space-y-1">
            <span className="font-semibold text-zinc-200 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Review Mode Auto-Fill</span>
            </span>
            <p className="leading-relaxed">
              For convenience, password is set to <span className="font-mono text-emerald-400 font-semibold">"admin"</span>. Click the button above to login instantly.
            </p>
          </div>

        </div>

        {/* Back Link */}
        <button
          onClick={() => setActivePage('landing')}
          className="w-full flex items-center justify-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Careers Landing Page</span>
        </button>

      </div>

    </div>
  );
};
