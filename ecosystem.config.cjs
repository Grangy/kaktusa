module.exports = {
  apps: [
    {
      name: "kaktusa",
      script: "server.js",
      cwd: "/var/www/kaktusa/.next/standalone",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        // БД в корне проекта (приложение крутится из .next/standalone)
        DATABASE_URL: "file:/var/www/kaktusa/prisma/dev.db",
      },
    },
  ],
};
