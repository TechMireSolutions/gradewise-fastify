/**
 * PM2 process manager config for Gradewise AI.
 *
 * Prereqs (on the server, once):
 *   1. Node.js >= 24
 *   2. npm i -g pm2
 *   3. cp grade-wise-ai-backend-fastify/.env.example grade-wise-ai-backend-fastify/.env
 *      then edit JWT_SECRET and DATABASE_URL
 *   4. cd grade-wise-ai-backend-fastify && npm ci && npm run build
 *   5. cd ../grade-wise-ai-frontend-next && npm ci && npm run build
 *
 * Usage:
 *   pm2 start ecosystem.config.cjs
 *   pm2 save            # persist process list across reboots
 *   pm2 startup         # generate systemd / init script
 *   pm2 logs            # tail logs
 *   pm2 restart all
 *   pm2 stop all
 */
module.exports = {
  apps: [
    {
      name: "gradewise-api",
      cwd: "./grade-wise-ai-backend-fastify",
      script: "dist/index.js",
      interpreter: "node",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 5005,
        HOST: "0.0.0.0",
      },
      // Loads .env automatically via dotenv/config import in src/index.ts
      out_file: "./logs/api-out.log",
      error_file: "./logs/api-error.log",
      merge_logs: true,
    },
    {
      name: "gradewise-worker",
      cwd: "./grade-wise-ai-backend-fastify",
      script: "dist/worker.js",
      interpreter: "node",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        USE_ASYNC_JOBS: "true",
      },
      out_file: "./logs/worker-out.log",
      error_file: "./logs/worker-error.log",
      merge_logs: true,
    },
  ],
};
