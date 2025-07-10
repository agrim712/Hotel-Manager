/*
  Warnings:

  - You are about to alter the column `gstin` on the `Reservation` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(15)`.

*/
-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "companyName" TEXT,
ALTER COLUMN "gstin" DROP NOT NULL,
ALTER COLUMN "gstin" SET DATA TYPE VARCHAR(15);
