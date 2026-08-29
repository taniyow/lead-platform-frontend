# Lead Distribution Platform — Frontend

Next.js (App Router) + TypeScript + Tailwind CSS frontend for the lead distribution platform.
Serves the admin area (login-protected) and the public lead form at `/{slug}`.

> Status: work in progress. Full setup, deployment, and testing documentation will be
> completed alongside the final submission.

## Architecture note

The browser only ever talks to this Next.js app. Requests to the backend API are proxied
server-side to `BACKEND_INTERNAL_URL`, so the Express backend stays on a private port and
is never exposed publicly.

## Quick start (development)

```bash
npm install
cp .env.example .env   # then adjust if needed
npm run dev
```

Runs on `http://localhost:3000` by default. The backend must be running separately
(see the backend repository).

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | Lint |
| `npm run typecheck` | Type-check without emitting |
