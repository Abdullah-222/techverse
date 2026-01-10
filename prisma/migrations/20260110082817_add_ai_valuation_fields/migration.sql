-- CreateEnum
CREATE TYPE "ExchangeStatus" AS ENUM ('REQUESTED', 'APPROVED', 'COMPLETED', 'REJECTED', 'DISPUTED');

-- AlterTable
ALTER TABLE "books" ADD COLUMN     "computedPoints" INTEGER,
ADD COLUMN     "pointsLastCalculatedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "exchanges" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "pointsUsed" INTEGER NOT NULL,
    "status" "ExchangeStatus" NOT NULL DEFAULT 'REQUESTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "exchanges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "book_history_entries" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "readingDuration" TEXT,
    "notes" TEXT,
    "displayName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "book_history_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "exchanges_bookId_idx" ON "exchanges"("bookId");

-- CreateIndex
CREATE INDEX "exchanges_fromUserId_idx" ON "exchanges"("fromUserId");

-- CreateIndex
CREATE INDEX "exchanges_toUserId_idx" ON "exchanges"("toUserId");

-- CreateIndex
CREATE INDEX "exchanges_status_idx" ON "exchanges"("status");

-- CreateIndex
CREATE INDEX "exchanges_fromUserId_toUserId_createdAt_idx" ON "exchanges"("fromUserId", "toUserId", "createdAt");

-- CreateIndex
CREATE INDEX "book_history_entries_bookId_idx" ON "book_history_entries"("bookId");

-- CreateIndex
CREATE INDEX "book_history_entries_createdAt_idx" ON "book_history_entries"("createdAt");

-- AddForeignKey
ALTER TABLE "exchanges" ADD CONSTRAINT "exchanges_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exchanges" ADD CONSTRAINT "exchanges_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exchanges" ADD CONSTRAINT "exchanges_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_history_entries" ADD CONSTRAINT "book_history_entries_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE;
