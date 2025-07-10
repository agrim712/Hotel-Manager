-- DropForeignKey
ALTER TABLE "RatePlan" DROP CONSTRAINT "RatePlan_roomTypeId_fkey";

-- AlterTable
ALTER TABLE "RatePlan" ALTER COLUMN "roomTypeId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "RoomDailyRate" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "roomNumber" TEXT NOT NULL,
    "basePrice" DOUBLE PRECISION NOT NULL,
    "minPrice" DOUBLE PRECISION NOT NULL,
    "maxPrice" DOUBLE PRECISION NOT NULL,
    "ratePlanId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoomDailyRate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RoomDailyRate_date_roomNumber_ratePlanId_key" ON "RoomDailyRate"("date", "roomNumber", "ratePlanId");

-- AddForeignKey
ALTER TABLE "RatePlan" ADD CONSTRAINT "RatePlan_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomDailyRate" ADD CONSTRAINT "RoomDailyRate_ratePlanId_fkey" FOREIGN KEY ("ratePlanId") REFERENCES "RatePlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
