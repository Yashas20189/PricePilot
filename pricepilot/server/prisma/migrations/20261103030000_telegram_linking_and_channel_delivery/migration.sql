ALTER TABLE "User"
ADD COLUMN "telegramChatId" TEXT,
ADD COLUMN "telegramLinkToken" TEXT,
ADD COLUMN "telegramLinkExpiresAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "User_telegramChatId_key" ON "User"("telegramChatId");
CREATE UNIQUE INDEX "User_telegramLinkToken_key" ON "User"("telegramLinkToken");

ALTER TABLE "Notification"
ADD COLUMN "emailStatus" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN "telegramStatus" TEXT NOT NULL DEFAULT 'SKIPPED';
