import { cookies } from 'next/headers';
import type { ApiEnvelope } from '@/lib/api/client';

const BACKEND_URL = process.env.BACKEND_INTERNAL_URL ?? 'http://127.0.0.1:4001';

export class BackendError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'BackendError';
  }
}

// Server-side fetch to the internal backend, forwarding the caller's cookies.
export async function backendFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ');

  const response = await fetch(`${BACKEND_URL}${path}`, {
    ...init,
    headers: {
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    cache: 'no-store',
  });

  let body: ApiEnvelope<T>;
  try {
    body = (await response.json()) as ApiEnvelope<T>;
  } catch {
    throw new BackendError('Unexpected backend response', response.status);
  }

  if (!response.ok || body.error) {
    throw new BackendError(body.error?.message ?? 'Request failed', response.status);
  }

  return body.data as T;
}
