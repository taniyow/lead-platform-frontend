# Lead Distribution Platform - Frontend

Next.js (App Router) + TypeScript + Tailwind CSS frontend for the lead distribution platform. Serves the login-protected admin area and the public lead form at `/{slug}`.

Backend repository: https://github.com/taniyow/lead-platform-backend

## Architecture

```
Browser -> server.js (custom production server, 0.0.0.0:PUBLIC_PORT)
             stamps x-client-ip from the TCP socket
           -> Next.js app
                admin pages (server components, session-verified)
                /api/* catch-all proxy -> Express backend (127.0.0.1:PRIVATE_PORT)
```

- The browser only ever talks to this app; the backend URL is a server-side environment variable (deliberately not `NEXT_PUBLIC_`), so the private API is never revealed to clients.
- The catch-all proxy (`app/api/[...path]/route.ts`) forwards an explicit allow-list of headers, passes `Set-Cookie` responses through untouched, and attaches the client IP header for the backend.
- `server.js` exists for one reason: trustworthy IP capture. Next.js fills `x-forwarded-for` only when the client did not send one, which makes that header spoofable at a public edge. The custom server overwrites `x-client-ip` from `req.socket.remoteAddress` on every request, so a forged header can never reach the backend.
- Route protection is layered: `proxy.ts` (Next middleware) redirects unauthenticated visitors, every admin page verifies the session server-side against the backend, and the backend's own JWT middleware remains the authority.
- Business logic lives entirely in the backend; this app renders, validates for UX (Zod schemas mirroring the server's), and proxies.

```
app/
  (admin)/                dashboard, brokers, form, distribution, leads (guarded)
  [slug]/                 the public lead form (no auth)
  api/[...path]/          server-side proxy to the backend
  login/
components/               auth, brokers, distributions, forms, layout, leads, ui (shadcn)
lib/                      api client + server fetch helpers, session helper, types
proxy.ts                  route guard (Next 16 middleware convention)
server.js                 custom production server (IP capture, env loading)
```

## Requirements

- Node.js 20.9+ (built and deployed on Node 22)
- The backend running and reachable (see the backend repository)

## Setup (local development)

```bash
git clone https://github.com/taniyow/lead-platform-frontend
cd lead-platform-frontend
npm install
cp .env.example .env    # adjust if the backend runs elsewhere
npm run dev             # http://localhost:3000
```

Production mode locally (exercises server.js and real IP capture):

```bash
npm run build
NODE_ENV=production npm start
```

## Environment variables

| Variable | Purpose | Notes |
| --- | --- | --- |
| `BACKEND_INTERNAL_URL` | where the proxy forwards API calls | server-side only, never `NEXT_PUBLIC_` |
| `HOST` | production bind address | `0.0.0.0` (the frontend is the public process). `HOST` is used instead of `HOSTNAME` because shells export `HOSTNAME` as the machine name |
| `PORT` | production bind port | the provided public port on the VPS |

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Next dev server with hot reload |
| `npm run build` | production build |
| `npm start` | run `server.js` (production; set `NODE_ENV=production`) |
| `npm run lint` | lint |
| `npm run typecheck` | type-check without emitting |

## Deployment (VPS, no sudo)

Node via nvm and PM2 as the process manager (see the backend README for the one-time toolchain setup).

```bash
cd ~/apps/lead-platform-frontend
# place .env: BACKEND_INTERNAL_URL=http://127.0.0.1:<private port>, HOST=0.0.0.0, PORT=<public port>
npm ci
npm run build
NODE_ENV=production pm2 start server.js --name lead-frontend
pm2 save
```

Operations:

```bash
pm2 ls
pm2 restart lead-frontend
pm2 logs lead-frontend --lines 100
```

## Notes

- The admin area handles loading, empty, success, and error states throughout; lead statuses (sent, unsent, duplicate, failed) are color-coded consistently.
- Field-level validation errors from the backend surface directly in forms; client-side schemas exist for immediate feedback, while the server remains the authority.
- The public form gives the same neutral confirmation regardless of routing outcome, so visitors cannot probe duplicate or assignment behavior.
- `AGENTS.md` and `CLAUDE.md` are generated automatically by the Next.js 16 dev server (`generate-agent-files.js`) and are committed as the framework recommends.
