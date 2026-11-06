'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { clearAllAuthSessions } from '@/lib/auth-client';
import { Screen, inputClass } from '@/components/public/Screen';

export default function MemberLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (localStorage.getItem('memberSession')) router.replace('/member/dashboard');
  }, [router]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!/^\d{10}$/.test(phone)) {
      setError('Enter the 10-digit mobile your agent saved.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/member/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'That number is not in a group yet.');
        return;
      }
      await clearAllAuthSessions();
      localStorage.setItem('memberSession', JSON.stringify({ phone, memberId: data.memberId, name: data.name }));
      toast.success(`Welcome back, ${data.name}`);
      router.push('/member/dashboard');
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Screen
      showHome={false}
      kicker="Member"
      headline="Your chit."
      detail="Sign in with the mobile number your agent saved."
    >
      <form onSubmit={handleLogin}>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Member sign in</h1>
        <p className="mt-1 text-sm text-slate-600">Use the mobile number on your chit.</p>

        <label className="mt-5 block">
          <span className="text-sm font-semibold text-slate-800">Mobile number</span>
          <input
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            maxLength={10}
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
              setError('');
            }}
            placeholder="9876543210"
            className={`${inputClass} mt-2`}
          />
        </label>
        {error && <p className="mt-2 text-sm font-medium text-rose-600">{error}</p>}

        <button type="submit" disabled={isLoading} className="mt-4 flex h-10 w-full items-center justify-center rounded-lg bg-blue-600 text-sm font-semibold text-white disabled:opacity-70">
          {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Continue'}
        </button>
      </form>
    </Screen>
  );
}
