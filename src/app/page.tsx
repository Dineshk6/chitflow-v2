'use client';

import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="min-h-dvh bg-[#eef3fb] px-3 py-3 sm:px-5 sm:py-5">
      <div className="mx-auto flex min-h-[calc(100dvh-1.5rem)] max-w-6xl flex-col gap-3 sm:min-h-[calc(100dvh-2.5rem)] sm:gap-4 lg:grid lg:grid-cols-2">
        <section className="flex flex-1 flex-col justify-between rounded-[28px] bg-black px-6 py-7 text-white sm:px-8 lg:px-12 lg:py-10">
          <p className="text-lg font-semibold">ChitFlow</p>
          <div>
            <p className="text-sm font-medium text-blue-300">I run the group</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">Agent</h1>
            <p className="mt-3 max-w-sm text-base leading-relaxed text-white/75">
              Groups, members, payments, and the schedule.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/auth/admin/login"
                className="flex h-12 items-center justify-center rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white"
              >
                Sign in
              </Link>
              <Link
                href="/auth/admin/register"
                className="flex h-12 items-center justify-center rounded-xl border border-white/25 px-6 text-sm font-semibold text-white"
              >
                Create account
              </Link>
            </div>
          </div>
          <p className="text-sm text-white/45">For the organizer</p>
        </section>

        <section className="flex flex-1 flex-col justify-between rounded-[28px] bg-white px-6 py-7 text-black shadow-sm ring-1 ring-blue-100 sm:px-8 lg:px-12 lg:py-10">
          <p className="text-lg font-semibold text-blue-600">Member</p>
          <div>
            <p className="text-sm font-medium text-slate-500">I am in a group</p>
            <h2 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">Your chit</h2>
            <p className="mt-3 max-w-sm text-base leading-relaxed text-slate-600">
              Dues, receipts, and the schedule, using the mobile number your agent saved.
            </p>
            <Link
              href="/auth/member/login"
              className="mt-6 flex h-12 items-center justify-center rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white sm:w-fit"
            >
              Member sign in
            </Link>
          </div>
          <p className="text-sm text-slate-400">Added by your agent</p>
        </section>
      </div>
    </main>
  );
}
