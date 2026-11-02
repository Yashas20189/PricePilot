ALTER TABLE "Product"
ADD COLUMN "nextRetryAt" TIMESTAMP(3);

CREATE TABLE "ScraperLock" (
    "name" TEXT NOT NULL,
    "owner" TEXT,
    "lockedUntil" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ScraperLock_pkey" PRIMARY KEY ("name")
);

CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastError" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Notification_idempotencyKey_key" ON "Notification"("idempotencyKey");
CREATE INDEX "Notification_status_nextAttemptAt_idx" ON "Notification"("status", "nextAttemptAt");
CREATE INDEX "Notification_productId_type_idx" ON "Notification"("productId", "type");

ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Notification" ADD CONSTRAINT "Notification_productId_fkey"
FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
