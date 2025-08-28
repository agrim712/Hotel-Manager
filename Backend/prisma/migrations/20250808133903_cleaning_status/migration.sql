-- CreateEnum
CREATE TYPE "CleaningStatus" AS ENUM ('CLEANED', 'CLEANING', 'EMERGENCY_CLEANING', 'MAINTENANCE');

-- AlterTable
ALTER TABLE "RoomUnit" ADD COLUMN     "cleaningStatus" "CleaningStatus" NOT NULL DEFAULT 'CLEANED';
