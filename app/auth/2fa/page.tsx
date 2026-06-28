'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
import { ShieldCheck, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';

export default function TwoFactorPage() {
  const { verifyOtp, requiresTwoFactor, isAuthenticated } = useAuth();
  const router = useRouter();
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    } else if (!requiresTwoFactor) {
      router.replace('/auth/login');
    } else {
      inputs.current[0]?.focus();
    }
  }, [requiresTwoFactor, isAuthenticated, router]);

  function handleChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const next = [...digits];
    next[index] = value.slice(-1);
    setDigits(next);
    if (value && index < 5) inputs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text.length === 6) {
      setDigits(text.split(''));
      inputs.current[5]?.focus();
    }
  }

  async function handleVerify() {
    const otp = digits.join('');
    if (otp.length < 6) { setError('Enter all 6 digits'); return; }
    setError('');
    setLoading(true);
    try {
      const ok = await verifyOtp(otp);
      if (ok) {
        router.replace('/dashboard');
      } else {
        setError('Invalid OTP. Try any 6-digit code for demo.');
        setDigits(['', '', '', '', '', '']);
        inputs.current[0]?.focus();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-brand-900 p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 border border-slate-200 dark:border-slate-700">
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center mb-3">
              <ShieldCheck className="w-6 h-6 text-brand-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Two-Factor Auth</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-1">
              Enter the 6-digit code from your authenticator app
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4 text-sm text-red-700 dark:text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={el => { inputs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                className="w-11 h-12 text-center text-lg font-bold border-2 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 transition-colors border-slate-200 dark:border-slate-700"
              />
            ))}
          </div>

          <button
            onClick={handleVerify}
            disabled={loading || digits.some(d => !d)}
            className="btn-primary w-full justify-center py-2.5"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</> : 'Verify Code'}
          </button>

          <button
            onClick={() => router.replace('/auth/login')}
            className="w-full flex items-center justify-center gap-2 mt-3 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to login
          </button>

          <p className="text-center text-xs text-slate-400 mt-4">
            Demo: any 6-digit code (e.g. 123456)
          </p>
        </div>
      </div>
    </div>
  );
}
