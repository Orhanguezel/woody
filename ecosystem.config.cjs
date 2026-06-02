// Root PM2 ecosystem — markadan bagimsiz sablon.
// Slug ve portlar proje.json'dan okunur; hicbir proje adi hard-code edilmez.
// Production deploy: deploy/deploy.sh repoyu VPS'e gonderir ve
//   pm2 start ecosystem.config.cjs --only <slug>-backend  (vb.) calistirir.
//
// Override (opsiyonel): BACKEND_PORT / ADMIN_PORT / FRONTEND_PORT / BUN_BIN env.
const fs = require('node:fs');
const path = require('node:path');

const proje = JSON.parse(fs.readFileSync(path.join(__dirname, 'proje.json'), 'utf8'));
const slug = (proje.name || 'app').toString();
const ports = proje.ports || {};

const BACKEND_PORT = String(process.env.BACKEND_PORT || ports.backend || 8086);
const ADMIN_PORT = String(process.env.ADMIN_PORT || ports.admin || 3096);
const FRONTEND_PORT = String(process.env.FRONTEND_PORT || ports.frontend || 3077);

// VPS'te bun genelde /usr/local/bin/bun; lokal/farkli kurulumda BUN_BIN ile gecilir.
const BUN = process.env.BUN_BIN || '/usr/local/bin/bun';
const HOME = process.env.HOME || '/root';
const logDir = path.join(HOME, '.pm2', 'logs');

const common = {
  exec_mode: 'fork',
  instances: 1,
  watch: false,
  autorestart: true,
  max_memory_restart: '450M',
  min_uptime: '30s',
  max_restarts: 10,
  restart_delay: 5000,
  kill_timeout: 8000,
  listen_timeout: 10000,
  combine_logs: true,
  time: true,
};

const nextApp = (suffix, dir, port) => ({
  ...common,
  name: `${slug}-${suffix}`,
  cwd: path.join(__dirname, dir),
  interpreter: BUN,
  script: 'node_modules/next/dist/bin/next',
  args: `start -p ${port} -H 127.0.0.1`,
  env: {
    NODE_ENV: 'production',
    PORT: port,
    HOSTNAME: '127.0.0.1',
    NEXT_TELEMETRY_DISABLED: '1',
  },
  out_file: path.join(logDir, `${slug}-${suffix}.out.log`),
  error_file: path.join(logDir, `${slug}-${suffix}.err.log`),
});

module.exports = {
  apps: [
    {
      ...common,
      name: `${slug}-backend`,
      cwd: path.join(__dirname, 'backend'),
      interpreter: BUN,
      script: 'dist/index.js',
      env: {
        NODE_ENV: 'production',
        PORT: BACKEND_PORT,
      },
      out_file: path.join(logDir, `${slug}-backend.out.log`),
      error_file: path.join(logDir, `${slug}-backend.err.log`),
    },
    nextApp('admin', 'admin_panel', ADMIN_PORT),
    nextApp('frontend', 'frontend', FRONTEND_PORT),
  ],
};
