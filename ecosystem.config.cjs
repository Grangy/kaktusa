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
        HOSTNAME: "0.0.0.0", // слушать на всех интерфейсах, не только localhost
        DATABASE_URL: "file:/var/www/kaktusa/prisma/dev.db",
        // Фиксированный ключ — ID Server Actions не меняются после деплоя (нет "Failed to find Server Action")
        NEXT_SERVER_ACTIONS_ENCRYPTION_KEY: "<REMOVED>",
      },
    },
  ],
};
