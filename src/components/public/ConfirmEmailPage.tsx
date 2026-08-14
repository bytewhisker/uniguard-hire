import React, { useEffect, useState } from 'react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { supabase } from '../../lib/supabase';
import { Shield, MailCheck, Loader2, AlertTriangle, ArrowRight } from 'lucide-react';

type Status = 'verifying' | 'success' | 'error';

export const ConfirmEmailPage: React.FC = () => {
  const { setActivePage } = useRecruitment();
  const [status, setStatus] = useState<Status>('verifying');
  const [message, setMessage] = useState('');

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
      if (!cancelled) setStatus('success');
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
    // the session on page load, so wait for it to appear.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) succeed();
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) succeed();
    });
    const timeout = window.setTimeout(() => {
      subscription.unsubscribe();
      fail('This confirmation link is invalid or has expired. Please request a new one.');
    }, 10000);
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen bg-page flex flex-col">
      <nav className="border-b border-line bg-panel/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button onClick={() => setActivePage('landing')} className="flex items-center gap-3 cursor-pointer">
            <img src="/uniguardlogo.png" alt="Uniguard" className="h-10 w-auto object-contain" />
            <div className="text-left">
              <h1 className="font-bold text-lg text-primary leading-none">Uniguard</h1>
              <p className="text-[10px] text-secondary tracking-widest uppercase mt-0.5">Security Recruitment</p>
            </div>
          </button>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: status === 'success' ? 'rgba(62,142,99,0.12)' : status === 'error' ? 'rgba(190,60,60,0.1)' : 'rgba(175,124,40,0.1)' }}>
            {status === 'verifying' && <Loader2 className="w-7 h-7 animate-spin" style={{ color: '#AF7C28' }} />}
            {status === 'success' && <MailCheck className="w-7 h-7" style={{ color: '#3E8E63' }} />}
            {status === 'error' && <AlertTriangle className="w-7 h-7" style={{ color: '#BE3C3C' }} />}
          </div>

          <h2 className="text-2xl font-bold text-primary mb-2">
            {status === 'verifying' && 'Confirming your email…'}
            {status === 'success' && 'Email Confirmed'}
            {status === 'error' && 'Confirmation Failed'}
          </h2>

          <p className="text-secondary mb-8">
            {status === 'verifying' && 'Please wait while we verify your email address.'}
            {status === 'success' && 'Your email address has been verified. You can now sign in to your account.'}
            {status === 'error' && message}
          </p>

          {status === 'success' && (
            <button
              onClick={() => setActivePage('user-dashboard')}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-base font-bold text-white transition-all hover:shadow-lg active:scale-[0.98] mx-auto"
              style={{ backgroundColor: '#AF7C28' }}
            >
              Go to my dashboard <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {status === 'error' && (
            <button
              onClick={() => setActivePage('login')}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-base font-bold text-white transition-all hover:shadow-lg active:scale-[0.98] mx-auto"
              style={{ backgroundColor: '#AF7C28' }}
            >
              Back to sign in <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <p className="text-xs text-faint mt-6">
            <button onClick={() => setActivePage('landing')} className="hover:text-primary transition-colors">
              <Shield className="w-3.5 h-3.5 inline -mt-0.5 mr-1" /> Uniguard Security Recruitment
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};