import React, { useState } from 'react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { Shield, LockKeyhole, User, ArrowRight } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const { login, setActivePage } = useRecruitment();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError('');
    setBusy(true);
    const ok = await login(email, password);
    setBusy(false);
    if (!ok) {
      setError('Invalid email or password, or this account has no admin access.');
    }
  };

  return (
    <div className="min-h-screen bg-page flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <button onClick={() => setActivePage('landing')} className="block mx-auto mb-8 cursor-pointer">
          <img src="/uniguardlogo.png" alt="Uniguard" className="h-10 w-auto object-contain mx-auto" />
        </button>

        <div className="rounded-2xl border border-line bg-panel p-8 shadow-lg">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(175,124,40,0.1)' }}>
              <Shield className="w-7 h-7" style={{ color: '#AF7C28' }} />
            </div>
            <h2 className="text-2xl font-bold text-primary mb-1">Admin Login</h2>
            <p className="text-sm text-secondary">Uniguard recruitment & vetting portal</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1.5">Email Address</label>
              <div className="relative">
                <User className="w-4 h-4 text-faint absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  placeholder="admin@uniguard.co.uk"
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-page"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1.5">Password</label>
              <div className="relative">
                <LockKeyhole className="w-4 h-4 text-faint absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="Password"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-page"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs font-medium text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 animate-pop-in">{error}</p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#AF7C28' }}
            >
              {busy ? 'Signing in…' : 'Enter Admin Dashboard'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-[11px] text-tertiary text-center mt-5">
            Access is restricted to authorised recruitment staff.
          </p>
        </div>

        <p className="text-center mt-6">
          <button onClick={() => setActivePage('landing')} className="text-xs text-faint hover:text-primary transition-colors">← Back to website</button>
        </p>
      </div>
    </div>
  );
};
