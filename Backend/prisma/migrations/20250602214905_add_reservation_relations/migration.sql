/*
  Warnings:

  - You are about to drop the column `name` on the `Reservation` table. All the data in the column will be lost.
  - Added the required column `rateType` to the `Reservation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Reservation" DROP COLUMN "name",
ADD COLUMN     "rateType" TEXT NOT NULL,
ADD COLUMN     "totalAmount" DOUBLE PRECISION;
