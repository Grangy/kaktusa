-- AlterTable
ALTER TABLE "PaymentSettings" ADD COLUMN "webhookToken" TEXT;
ALTER TABLE "PaymentSettings" ADD COLUMN "testOneRuble" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "TicketOrder" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "eventSlug" TEXT NOT NULL,
  "ticketId" TEXT,
  "ticketName" TEXT,
  "email" TEXT NOT NULL,
  "amountValue" TEXT NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'RUB',
  "method" TEXT,
  "paymentId" TEXT UNIQUE,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "ticketNumber" TEXT UNIQUE,
  "qrToken" TEXT UNIQUE,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

