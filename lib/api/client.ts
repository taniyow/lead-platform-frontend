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
    // Prefer field-level validation messages over the generic envelope message
    // so forms can show the actual reason (e.g. "This slug is reserved").
    const details = body.error?.details;
    const detailMessages = Array.isArray(details)
      ? details
          .map((d) =>
            d && typeof d === 'object' && 'message' in d ? String((d as { message: unknown }).message) : null,
          )
          .filter((m): m is string => m !== null && m.length > 0)
      : [];
    throw new ApiClientError(
      detailMessages.length > 0
        ? detailMessages.join('; ')
        : (body.error?.message ?? 'Request failed'),
      response.status,
      details,
    );
  }

  return body.data as T;
}
