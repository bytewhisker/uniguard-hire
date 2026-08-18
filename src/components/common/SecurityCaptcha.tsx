import React, { useState, useRef } from 'react';
import { Shield, ShieldCheck, Loader2 } from 'lucide-react';

interface SecurityCaptchaProps {
  onVerify: (token: string | null) => void;
}

export const SecurityCaptcha: React.FC<SecurityCaptchaProps> = ({ onVerify }) => {
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'failed'>('idle');
  const mountTime = useRef<number>(Date.now());

  // Check for common headless bot signatures
  const isBotDetected = (): boolean => {
    if (typeof window === 'undefined') return true;
    const nav = window.navigator as any;
    if (nav.webdriver) return true;
    if ((window as any).PhantomJS || (window as any)._phantom || (window as any).callPhantom) return true;
    if ((window as any).__nightmare) return true;
    return false;
  };

  const handleCheck = () => {
    if (status === 'success' || status === 'verifying') return;

    // Detect instant bot click (<300ms from render)
    const duration = Date.now() - mountTime.current;
    if (duration < 250 || isBotDetected()) {
      setStatus('failed');
      onVerify(null);
      return;
    }

    setStatus('verifying');

    // Simulate cryptographic verification delay (750ms)
    setTimeout(() => {
      const cryptoToken = `ug_shield_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      setStatus('success');
      onVerify(cryptoToken);
    }, 750);
  };

  return (
    <div className="w-full my-4 p-3.5 rounded-xl border border-line bg-panel-2 shadow-sm transition-all select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Checkbox Box */}
          <button
            type="button"
            onClick={handleCheck}
            disabled={status === 'verifying' || status === 'success'}
            className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all ${
              status === 'success'
                ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                : status === 'verifying'
                ? 'bg-amber-500/10 border-amber-500/50'
                : status === 'failed'
                ? 'bg-rose-500/10 border-rose-500/50 cursor-not-allowed'
                : 'bg-page border-line-strong hover:border-[#AF7C28] cursor-pointer'
            }`}
          >
            {status === 'verifying' && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#AF7C28]" />}
            {status === 'success' && <ShieldCheck className="w-4 h-4 text-white" />}
          </button>

          {/* Label */}
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold text-primary">
              {status === 'idle' && 'Verify you are human'}
              {status === 'verifying' && 'Verifying security signature...'}
              {status === 'success' && 'Success! Human verified'}
              {status === 'failed' && 'Security check failed. Refresh page.'}
            </span>
            <span className="text-[10px] text-tertiary">
              {status === 'success' ? 'Encrypted token active' : 'Click to pass Uniguard bot protection'}
            </span>
          </div>
        </div>

        {/* Brand Shield Logo */}
        <div className="flex items-center gap-1.5 text-tertiary">
          <Shield className={`w-4 h-4 ${status === 'success' ? 'text-emerald-500' : 'text-[#AF7C28]'}`} />
          <span className="text-[10px] font-bold tracking-wider uppercase">Uniguard Shield</span>
        </div>
      </div>
    </div>
  );
};
