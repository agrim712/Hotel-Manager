-- AlterTable
ALTER TABLE "Hotel" ADD COLUMN     "gstin" TEXT;

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "isMaintenance" BOOLEAN NOT NULL DEFAULT false;
