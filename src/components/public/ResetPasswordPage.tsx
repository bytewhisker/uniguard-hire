import React, { useEffect, useState } from 'react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { supabase } from '../../lib/supabase';
import { Loader2, AlertTriangle, CheckCircle2, Eye, EyeOff, ArrowRight } from 'lucide-react';

type Status = 'verifying' | 'ready' | 'done' | 'error';

export const ResetPasswordPage: React.FC = () => {
  const { setActivePage, publicUser } = useRecruitment();
  const [status, setStatus] = useState<Status>('verifying');
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!supabase) {
      setStatus('error');
      setMessage('Backend is not configured — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const tokenHash = params.get('token_hash');
    const code = params.get('code');
    const type = params.get('type');

    let cancelled = false;
    const fail = (msg: string) => {
      if (cancelled) return;
      setStatus('error');
      setMessage(msg);
    };
    const succeed = () => {
      if (!cancelled) setStatus('ready');
    };

    // Format 1: token_hash links (classic email template)
    if (tokenHash && type) {
      supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as 'email' | 'recovery' | 'sms' | 'phone' | 'invite' | 'email_change' | 'email_signup' })
        .then(({ error }) => error ? fail(error.message) : succeed());
      return () => { cancelled = true; };
    }

    // Format 2: ?code= links (modern PKCE email links)
    if (code) {
      supabase.auth.exchangeCodeForSession(code)
        .then(({ error }) => error ? fail(error.message) : succeed());
      return () => { cancelled = true; };
    }

    // Format 3: #access_token=… in the URL hash — supabase-js auto-initialises
    // the recovery session on page load, so wait for it to appear.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) succeed();
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) succeed();
    });
    const timeout = window.setTimeout(() => {
      subscription.unsubscribe();
      fail('This reset link is invalid or has expired. Please request a new one.');
    }, 10000);
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!password) {
      setError('Please choose a new password.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!supabase) {
      setError('Backend is not configured — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
      return;
    }
    setBusy(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (updateError) {
      setError(updateError.message || 'We could not update your password. Please try again.');
      return;
    }
    setStatus('done');
  };

  const Nav = (
    <nav className="border-b border-line bg-panel/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <button onClick={() => setActivePage('landing')} className="flex items-center gap-3 cursor-pointer">
          <img src="/uniguardlogo.png" alt="Uniguard" className="h-10 w-auto object-contain" />
          <div className="text-left">
            <h1 className="font-bold text-lg text-primary leading-none">Uniguard</h1>
            <p className="text-[10px] text-secondary tracking-widest uppercase mt-0.5">Security Recruitment</p>
          </div>
        </button>
        <button
          onClick={() => setActivePage('login')}
          className="text-sm font-medium text-secondary hover:text-primary transition-colors"
        >
          Back to sign in
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-page flex flex-col">
      {Nav}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md text-center">
          {status === 'verifying' && (
            <>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(175,124,40,0.1)' }}>
                <Loader2 className="w-7 h-7 animate-spin" style={{ color: '#AF7C28' }} />
              </div>
              <h2 className="text-2xl font-bold text-primary mb-2">Verifying your link…</h2>
              <p className="text-secondary">Please wait a moment.</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(190,60,60,0.1)' }}>
                <AlertTriangle className="w-7 h-7" style={{ color: '#BE3C3C' }} />
              </div>
              <h2 className="text-2xl font-bold text-primary mb-2">Link Invalid or Expired</h2>
              <p className="text-secondary mb-8">{message}</p>
              <button
                onClick={() => setActivePage('forgot-password')}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-base font-bold text-white transition-all hover:shadow-lg active:scale-[0.98] mx-auto"
                style={{ backgroundColor: '#AF7C28' }}
              >
                Request a new link <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}

          {status === 'ready' && (
            <>
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(62,142,99,0.12)' }}>
                  <CheckCircle2 className="w-7 h-7" style={{ color: '#3E8E63' }} />
                </div>
                <h2 className="text-2xl font-bold text-primary mb-2">Choose a new password</h2>
                <p className="text-sm text-secondary">
                  {publicUser?.email ? `For ${publicUser.email}. ` : ''}Pick something strong you haven't used before.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 text-left">
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
                )}
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1.5">New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="w-full px-4 py-3 pr-10 rounded-lg border border-line text-primary placeholder:text-faint focus:outline-none focus:border-line-strong focus:ring-2 focus:ring-black/5 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-faint hover:text-secondary"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1.5">Confirm New Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your new password"
                    className="w-full px-4 py-3 rounded-lg border border-line text-primary placeholder:text-faint focus:outline-none focus:border-line-strong focus:ring-2 focus:ring-black/5 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-base font-bold text-white transition-all hover:shadow-lg active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#AF7C28' }}
                >
                  <span>{busy ? 'Updating…' : 'Update Password'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </>
          )}

          {status === 'done' && (
            <>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(62,142,99,0.12)' }}>
                <CheckCircle2 className="w-7 h-7" style={{ color: '#3E8E63' }} />
              </div>
              <h2 className="text-2xl font-bold text-primary mb-2">Password Updated</h2>
              <p className="text-secondary mb-8">Your password has been changed successfully. Sign in with your new password.</p>
              <button
                onClick={() => setActivePage('login')}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-base font-bold text-white transition-all hover:shadow-lg active:scale-[0.98] mx-auto"
                style={{ backgroundColor: '#AF7C28' }}
              >
                Back to sign in <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};