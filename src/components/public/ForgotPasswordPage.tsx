import React, { useState } from 'react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { Shield, MailCheck, ArrowRight } from 'lucide-react';
import { SecurityCaptcha } from '../common/SecurityCaptcha';

export const ForgotPasswordPage: React.FC = () => {
  const { requestPasswordReset, setActivePage } = useRecruitment();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setBusy(true);
    const ok = await requestPasswordReset(email);
    setBusy(false);
    if (ok) {
      setSent(true);
    } else {
      setError('We could not send a reset link. Please try again.');
    }
  };

  if (sent) {
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
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(62,142,99,0.12)' }}>
              <MailCheck className="w-7 h-7" style={{ color: '#3E8E63' }} />
            </div>
            <h2 className="text-2xl font-bold text-primary mb-2">Check your inbox</h2>
            <p className="text-secondary mb-8">
              If an account exists for <span className="font-semibold text-primary">{email}</span>, we've sent a password
              reset link. It expires in 1 hour — open it to choose a new password.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setActivePage('login')}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-base font-bold text-white transition-all hover:shadow-lg active:scale-[0.98]"
                style={{ backgroundColor: '#AF7C28' }}
              >
                Back to sign in <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => { setSent(false); setEmail(''); }}
                className="px-6 py-3 rounded-lg text-sm font-semibold text-secondary border border-line hover:border-line-strong hover:text-primary transition-colors"
              >
                Didn't get an email? Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page flex flex-col">
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

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(175,124,40,0.1)' }}>
              <Shield className="w-7 h-7" style={{ color: '#AF7C28' }} />
            </div>
            <h2 className="text-2xl font-bold text-primary mb-2">Forgot your password?</h2>
            <p className="text-sm text-secondary">Enter the email you signed up with and we'll send you a reset link.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
            )}
            <div>
              <label className="block text-sm font-medium text-secondary mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="alex.morgan@example.co.uk"
                className="w-full px-4 py-3 rounded-lg border border-line text-primary placeholder:text-faint focus:outline-none focus:border-line-strong focus:ring-2 focus:ring-black/5 transition-all"
              />
            </div>

            <SecurityCaptcha onVerify={token => setCaptchaToken(token)} />

            <button
              type="submit"
              disabled={busy || !captchaToken}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-base font-bold text-white transition-all hover:shadow-lg active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#AF7C28' }}
            >
              <span>{busy ? 'Sending…' : 'Send Reset Link'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};