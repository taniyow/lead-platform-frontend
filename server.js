/**
 * Minimal custom server whose only job is trustworthy client-IP capture.
 *
 * Next.js only fills x-forwarded-for when the client did not send one, so at
 * an internet-facing edge that header is client-controllable. This server
 * unconditionally stamps x-client-ip from the TCP socket before Next handles
 * the request, which the API proxy then forwards to the backend.
 */
const { createServer } = require('http');
const next = require('next');
const { loadEnvConfig } = require('@next/env');

// Next only loads .env files during app.prepare(), which is too late for the
// bind constants below - load them explicitly first. Existing process env
// (e.g. from PM2) still takes precedence over .env values.
loadEnvConfig(__dirname, process.env.NODE_ENV !== 'production');

// HOST, not HOSTNAME: shells (Git Bash, some Linux setups) export HOSTNAME as
// the machine name, which would silently become the bind address.
const port = Number(process.env.PORT ?? 3000);
// 0.0.0.0 binds every interface: required so the VPS public port and LAN
// devices can reach the app. It is a bind address, not a browsable URL.
const hostname = process.env.HOST ?? '0.0.0.0';
const dev = process.env.NODE_ENV !== 'production';

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    req.headers['x-client-ip'] = req.socket.remoteAddress ?? '';
    handle(req, res);
  }).listen(port, hostname, () => {
    const openHost = hostname === '0.0.0.0' || hostname === '::' ? 'localhost' : hostname;
    console.log(`Frontend bound to ${hostname}:${port} - open http://${openHost}:${port}`);
  });
});
