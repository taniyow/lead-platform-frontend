export interface ApiEnvelope<T> {
  data: T | null;
  error: { message: string; details?: unknown } | null;
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });

  let body: ApiEnvelope<T>;
  try {
    body = (await response.json()) as ApiEnvelope<T>;
  } catch {
    throw new ApiClientError('Unexpected server response', response.status);
  }

  if (!response.ok || body.error) {
    throw new ApiClientError(
      body.error?.message ?? 'Request failed',
      response.status,
      body.error?.details,
    );
  }

  return body.data as T;
}
