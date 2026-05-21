import { signOut } from 'next-auth/react';

/** Clears NextAuth session and all client-side role/member storage. */
export async function clearAllAuthSessions() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('userRole');
    localStorage.removeItem('memberSession');
  }
  await signOut({ redirect: false });
}
