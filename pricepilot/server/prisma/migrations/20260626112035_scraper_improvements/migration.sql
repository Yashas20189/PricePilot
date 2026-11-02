-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "availability" TEXT,
ADD COLUMN     "currency" TEXT DEFAULT 'INR',
ADD COLUMN     "errorReason" TEXT,
ADD COLUMN     "image" TEXT,
ADD COLUMN     "lastChecked" TIMESTAMP(3),
ADD COLUMN     "platform" TEXT,
ADD COLUMN     "retryCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "status" TEXT;
