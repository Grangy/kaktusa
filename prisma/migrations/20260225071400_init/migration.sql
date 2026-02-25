-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "dateDisplay" TEXT NOT NULL,
    "time" TEXT,
    "location" TEXT NOT NULL,
    "locationShort" TEXT,
    "price" TEXT,
    "priceNote" TEXT,
    "heroImage" TEXT NOT NULL,
    "tag" TEXT,
    "tagStyle" TEXT,
    "metaTitle" TEXT NOT NULL,
    "metaDescription" TEXT NOT NULL,
    "artists" TEXT NOT NULL,
    "tickets" TEXT NOT NULL,
    "aboutParagraphs" TEXT NOT NULL,
    "venueTitle" TEXT NOT NULL,
    "venueAddress" TEXT NOT NULL,
    "venueCity" TEXT NOT NULL,
    "buyTicketUrl" TEXT,
    "age" TEXT,
    "dressCode" TEXT,
    "rules" TEXT,
    "subtitle" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Main" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'main',
    "hero" TEXT NOT NULL,
    "about" TEXT NOT NULL,
    "gallery" TEXT NOT NULL,
    "reviews" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Meta" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'meta',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "canonical" TEXT,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");
