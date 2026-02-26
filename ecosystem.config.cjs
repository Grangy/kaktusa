/**
 * PM2 конфиг. Секреты загружаются из .env (cwd = /var/www/kaktusa).
 * На сервере создайте .env с: NEXT_SERVER_ACTIONS_ENCRYPTION_KEY, AUTH_SECRET, ADMIN_PASSWORD.
 */
module.exports = {
  apps: [
    {
      name: "kaktusa",
      script: ".next/standalone/server.js",
      cwd: "/var/www/kaktusa",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      node_args: "-r dotenv/config",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "0.0.0.0",
        DATABASE_URL: "file:/var/www/kaktusa/prisma/dev.db",
        AUTH_TRUST_HOST: "true",
        AUTH_URL: "https://kaktusa.ru",
      },
    },
  ],
};
