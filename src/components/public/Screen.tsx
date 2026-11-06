import type { ReactNode } from 'react';
import Link from 'next/link';

export function Screen({
  children,
  kicker,
  headline,
  detail,
  showHome = true,
}: {
  children: ReactNode;
  kicker: string;
  headline: string;
  detail: string;
  showHome?: boolean;
}) {
  return (
    <div className="min-h-dvh bg-[#eef3fb] px-3 py-3 sm:px-5 sm:py-5">
      <div className="mx-auto grid min-h-[calc(100dvh-1.5rem)] max-w-6xl gap-3 sm:min-h-[calc(100dvh-2.5rem)] sm:gap-4 lg:grid-cols-2">
        <aside className="hidden flex-col justify-between rounded-[28px] bg-black px-10 py-10 text-white lg:flex">
          <p className="text-lg font-semibold">ChitFlow</p>
          <div>
            <p className="text-sm font-medium text-blue-300">{kicker}</p>
            <p className="mt-2 text-4xl font-semibold tracking-tight">{headline}</p>
            <p className="mt-3 max-w-sm text-base leading-relaxed text-white/75">{detail}</p>
          </div>
          {showHome ? (
            <Link href="/" className="text-sm font-medium text-white/70">
              Back to home
            </Link>
          ) : (
            <p className="text-sm text-white/45">Added by your agent</p>
          )}
        </aside>

        <div className="flex items-center justify-center">
          <div className="my-auto w-full max-w-md">
            {showHome && (
              <Link href="/" className="mb-3 inline-flex text-sm font-semibold text-blue-600 lg:hidden">
                Back to home
              </Link>
            )}
            <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-blue-100 sm:p-6">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const inputClass =
  'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none placeholder:text-sm placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10';
