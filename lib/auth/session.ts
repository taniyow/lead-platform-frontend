import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const BACKEND_URL = process.env.BACKEND_INTERNAL_URL ?? 'http://127.0.0.1:4001';
const AUTH_COOKIE = 'token';

export interface SessionUser {
  id: number;
  email: string;
}

// Server-side session check for admin pages. Verifies the JWT against the
// backend rather than trusting cookie presence alone.
export async function requireSession(): Promise<SessionUser> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE);
  if (!token) {
    redirect('/login');
  }

  const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
    headers: { cookie: `${AUTH_COOKIE}=${token.value}` },
    cache: 'no-store',
  });

  if (!response.ok) {
    redirect('/login');
  }

  const body = (await response.json()) as { data: { user: SessionUser } | null };
  if (!body.data?.user) {
    redirect('/login');
  }

  return body.data.user;
}
