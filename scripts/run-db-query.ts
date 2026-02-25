/**
 * Один запрос через src/lib/db (для test-prisma: проверка «adapter + Accelerate»).
 * Запуск: npx tsx scripts/run-db-query.ts
 */
import { prisma } from "../src/lib/db";

async function main() {
  const r = await prisma.event.findMany({ take: 1 });
  console.log("OK", r.length);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
