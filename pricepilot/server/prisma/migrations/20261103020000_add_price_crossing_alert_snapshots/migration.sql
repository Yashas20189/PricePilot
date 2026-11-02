-- Store the price and target that caused each alert.
-- Nullable to preserve existing notification rows.
ALTER TABLE "Notification"
ADD COLUMN "priceAtTrigger" DOUBLE PRECISION,
ADD COLUMN "targetPriceAtTrigger" DOUBLE PRECISION;
