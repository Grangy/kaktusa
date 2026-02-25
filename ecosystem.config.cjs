module.exports = {
  apps: [
    {
      name: "kaktusa",
      // Запуск из корня проекта: process.cwd() = /var/www/kaktusa, БД и пути корректны
      script: ".next/standalone/server.js",
      cwd: "/var/www/kaktusa",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "0.0.0.0",
        DATABASE_URL: "file:/var/www/kaktusa/prisma/dev.db",
        NEXT_SERVER_ACTIONS_ENCRYPTION_KEY: "<REMOVED>",
        AUTH_SECRET: "<REMOVED>",
        AUTH_TRUST_HOST: "true",
        AUTH_URL: "https://kaktusa.ru",
        ADMIN_PASSWORD: "22170313",
      },
    },
  ],
};
