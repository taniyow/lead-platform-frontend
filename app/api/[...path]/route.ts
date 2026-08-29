import { NextRequest } from 'next/server';

const BACKEND_URL = process.env.BACKEND_INTERNAL_URL ?? 'http://127.0.0.1:4001';

// Explicit allow-list: never blanket-forward incoming headers to the backend.
const FORWARDED_REQUEST_HEADERS = ['cookie', 'content-type', 'accept'] as const;

type ProxyContext = { params: Promise<{ path: string[] }> };

async function proxyRequest(request: NextRequest, ctx: ProxyContext): Promise<Response> {
  const { path } = await ctx.params;
  const targetUrl = `${BACKEND_URL}/api/${path.join('/')}${request.nextUrl.search}`;

  const headers = new Headers();
  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value !== null) {
      headers.set(name, value);
    }
  }

  // x-client-ip is stamped from the TCP socket by server.js in production.
  // In dev (plain `next dev`) fall back to the first x-forwarded-for hop.
  const clientIp =
    request.headers.get('x-client-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  if (clientIp) {
    headers.set('x-client-ip', clientIp);
  }

  const body =
    request.method === 'GET' || request.method === 'HEAD'
      ? undefined
      : await request.arrayBuffer();

  // Returning the upstream Response directly preserves its headers, including Set-Cookie.
  return fetch(targetUrl, {
    method: request.method,
    headers,
    body,
    redirect: 'manual',
    cache: 'no-store',
  });
}

export {
  proxyRequest as GET,
  proxyRequest as POST,
  proxyRequest as PATCH,
  proxyRequest as PUT,
  proxyRequest as DELETE,
};
