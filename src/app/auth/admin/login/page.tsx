'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Screen, inputClass } from '@/components/public/Screen';

export default function AgentLoginPage() {
  const router = useRouter();
  const { status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ identifier?: string; password?: string; general?: string }>({});

  useEffect(() => {
    if (status === 'authenticated') router.replace('/admin/dashboard');
  }, [status, router]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    const next: { identifier?: string; password?: string } = {};
    if (!identifier) next.identifier = 'Email or mobile is required';
    else if (!identifier.includes('@') && !/^\d{10}$/.test(identifier)) {
      next.identifier = 'Use a valid email or 10-digit mobile';
    }
    if (!password) next.password = 'Password is required';
    if (Object.keys(next).length) {
      setErrors(next);
      setIsLoading(false);
      return;
    }

    try {
      const result = await signIn('credentials', {
        identifier,
        password,
        expectedRole: 'ADMIN',
        redirect: false,
      });
      if (result?.error) {
        setErrors({ general: result.error === 'CredentialsSignin' ? 'Those details did not match.' : result.error });
        toast.error('Could not sign in');
      } else {
        localStorage.removeItem('memberSession');
        localStorage.setItem('userRole', 'admin');
        toast.success('Welcome back');
        router.push('/admin/dashboard');
      }
    } catch {
      setErrors({ general: 'Something went wrong.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Screen
      kicker="Agent"
      headline="Run the group."
      detail="Sign in with your email or mobile number."
    >
      <form onSubmit={handleLogin}>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Agent sign in</h1>
        <p className="mt-1 text-sm text-slate-600">Email or mobile, then your password.</p>

        {errors.general && (
          <p className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{errors.general}</p>
        )}

        <label className="mt-4 block">
          <span className="text-sm font-semibold text-slate-800">Email or mobile</span>
          <input
            type="text"
            inputMode="email"
            autoComplete="username"
            value={identifier}
            onChange={(e) => {
              setIdentifier(e.target.value);
              if (errors.identifier) setErrors({ ...errors, identifier: '' });
            }}
            placeholder="you@email.com"
            className={`${inputClass} mt-2`}
          />
          {errors.identifier && <span className="mt-2 block text-sm font-medium text-rose-600">{errors.identifier}</span>}
        </label>

        <label className="mt-4 block">
          <span className="text-sm font-semibold text-slate-800">Password</span>
          <span className="relative mt-2 block">
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: '' });
              }}
              placeholder="Password"
              className={`${inputClass} pr-10`}
            />
            <button
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-0.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center text-slate-500"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </span>
          {errors.password && <span className="mt-2 block text-sm font-medium text-rose-600">{errors.password}</span>}
        </label>

        <div className="mt-5 space-y-3">
          <button type="submit" disabled={isLoading} className="flex h-10 w-full items-center justify-center rounded-lg bg-blue-600 text-sm font-semibold text-white disabled:opacity-70">
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Continue'}
          </button>
          <p className="text-center text-sm text-slate-500">
            <Link href="/auth/admin/register" className="font-semibold text-slate-900">Create an account</Link>
            <span className="mx-2">·</span>
            <Link href="/auth/member/login" className="font-semibold text-slate-900">Member sign in</Link>
          </p>
        </div>
      </form>
    </Screen>
  );
}
