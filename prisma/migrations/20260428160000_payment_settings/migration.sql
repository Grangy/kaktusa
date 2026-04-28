-- CreateTable
CREATE TABLE "PaymentSettings" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'payments',
  "enabled" INTEGER NOT NULL DEFAULT 0,
  "yookassaShopId" TEXT,
  "yookassaSecretKey" TEXT,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

