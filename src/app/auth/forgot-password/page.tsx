'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Screen, inputClass } from '@/components/public/Screen';

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <Screen
      kicker="Agent"
      headline="Reset password."
      detail="Enter the email on your agent account. We will send reset instructions."
    >
      {!submitted ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}
        >
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Reset password</h1>
          <p className="mt-1 text-sm text-slate-600">Use the email on your agent account.</p>
          <label className="mt-4 block">
            <span className="text-sm font-semibold text-slate-800">Email</span>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              placeholder="you@email.com"
              className={`${inputClass} mt-1`}
            />
          </label>
          <button type="submit" className="mt-4 flex h-10 w-full items-center justify-center rounded-lg bg-blue-600 text-sm font-semibold text-white">
            Send reset link
          </button>
          <p className="mt-3 text-center text-sm text-slate-500">
            <Link href="/auth/admin/login" className="font-semibold text-slate-900">Back to sign in</Link>
          </p>
        </form>
      ) : (
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Check your email</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            If that address is on an agent account, reset instructions are on the way.
          </p>
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="mt-4 text-sm font-semibold text-blue-600"
          >
            Try a different email
          </button>
        </div>
      )}
    </Screen>
  );
}
