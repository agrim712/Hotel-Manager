/*
  Warnings:

  - You are about to drop the column `state` on the `Reservation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Reservation" DROP COLUMN "state",
ADD COLUMN     "cgst" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "igst" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "sgst" DOUBLE PRECISION NOT NULL DEFAULT 0;
