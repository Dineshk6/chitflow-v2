'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Screen, inputClass } from '@/components/public/Screen';

export default function AgentRegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    businessName: '',
    email: '',
    phone: '',
    password: '',
    inviteCode: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: string, val: string) => {
    setFormData((p) => ({ ...p, [key]: val }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: '' }));
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    const err: Record<string, string> = {};
    if (!formData.firstName) err.firstName = 'First name is required';
    if (!formData.lastName) err.lastName = 'Last name is required';
    if (!formData.businessName) err.businessName = 'Business name is required';
    if (!formData.email) err.email = 'Email is required';
    else if (!formData.email.includes('@')) err.email = 'Enter a valid email';
    if (!formData.phone) err.phone = 'Mobile number is required';
    else if (!/^\d{10}$/.test(formData.phone)) err.phone = 'Enter a 10-digit number';
    if (!formData.password) err.password = 'Password is required';
    if (!formData.inviteCode) err.inviteCode = 'Access code is required';
    if (Object.keys(err).length > 0) {
      setErrors(err);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: 'ADMIN',
          inviteCode: formData.inviteCode,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors({ general: data.error || 'Something went wrong' });
        toast.error(data.error || 'Something went wrong');
      } else {
        localStorage.setItem('userRole', 'admin');
        toast.success('Account created successfully!');
        const result = await signIn('credentials', {
          identifier: formData.email,
          password: formData.password,
          redirect: false,
        });
        router.push(result?.ok ? '/admin/dashboard' : '/auth/admin/login');
      }
    } catch {
      setErrors({ general: 'Something went wrong' });
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const Field = ({
    id,
    label,
    children,
  }: {
    id: string;
    label: string;
    children: ReactNode;
  }) => (
    <label className="block">
      <span className="text-sm font-semibold text-slate-800">{label}</span>
      <div className="mt-1">{children}</div>
      {errors[id] && <span className="mt-1.5 block text-sm font-medium text-rose-600">{errors[id]}</span>}
    </label>
  );

  return (
    <Screen
      kicker="New agent"
      headline="Create your account."
      detail="You will need the access code from the person who set ChitFlow up."
    >
      <form onSubmit={handleRegister}>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Create an account</h1>
        <p className="mt-1 text-sm text-slate-600">For the person who runs the chit group.</p>

        {errors.general && (
          <p className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{errors.general}</p>
        )}

        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field id="firstName" label="First name">
              <input
                type="text"
                autoComplete="given-name"
                value={formData.firstName}
                onChange={(e) => set('firstName', e.target.value)}
                placeholder="Rajesh"
                className={inputClass}
              />
            </Field>
            <Field id="lastName" label="Last name">
              <input
                type="text"
                autoComplete="family-name"
                value={formData.lastName}
                onChange={(e) => set('lastName', e.target.value)}
                placeholder="Kumar"
                className={inputClass}
              />
            </Field>
          </div>

          <Field id="businessName" label="Business name">
            <input
              type="text"
              autoComplete="organization"
              value={formData.businessName}
              onChange={(e) => set('businessName', e.target.value)}
              placeholder="Kumar Chit Funds"
              className={inputClass}
            />
          </Field>

          <Field id="email" label="Email">
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              value={formData.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="you@email.com"
              className={inputClass}
            />
          </Field>

          <Field id="phone" label="Mobile number">
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              maxLength={10}
              value={formData.phone}
              onChange={(e) => set('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="9876543210"
              className={inputClass}
            />
          </Field>

          <Field id="password" label="Password">
            <span className="relative block">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={formData.password}
                onChange={(e) => set('password', e.target.value)}
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
          </Field>

          <Field id="inviteCode" label="Access code">
            <input
              type="text"
              autoComplete="off"
              value={formData.inviteCode}
              onChange={(e) => set('inviteCode', e.target.value)}
              placeholder="From the person who set this up"
              className={inputClass}
            />
          </Field>
        </div>

        <div className="mt-4 space-y-3">
          <button
            type="submit"
            disabled={isLoading}
            className="flex h-10 w-full items-center justify-center rounded-lg bg-blue-600 text-sm font-semibold text-white disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Create account'}
          </button>
          <p className="pb-2 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link href="/auth/admin/login" className="font-semibold text-slate-900">Sign in</Link>
          </p>
        </div>
      </form>
    </Screen>
  );
}
