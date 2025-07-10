/*
  Warnings:

  - You are about to drop the column `cgst` on the `Hotel` table. All the data in the column will be lost.
  - You are about to drop the column `companyName` on the `Hotel` table. All the data in the column will be lost.
  - You are about to drop the column `gstin` on the `Hotel` table. All the data in the column will be lost.
  - You are about to drop the column `igst` on the `Hotel` table. All the data in the column will be lost.
  - You are about to drop the column `sgst` on the `Hotel` table. All the data in the column will be lost.
  - You are about to drop the column `cgst` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `companyName` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `gstin` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `guestType` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `igst` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `sgst` on the `Reservation` table. All the data in the column will be lost.
  - Added the required column `taxInclusive` to the `Reservation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Hotel" DROP COLUMN "cgst",
DROP COLUMN "companyName",
DROP COLUMN "gstin",
DROP COLUMN "igst",
DROP COLUMN "sgst";

-- AlterTable
ALTER TABLE "Reservation" DROP COLUMN "cgst",
DROP COLUMN "companyName",
DROP COLUMN "gstin",
DROP COLUMN "guestType",
DROP COLUMN "igst",
DROP COLUMN "sgst",
ADD COLUMN     "taxInclusive" BOOLEAN NOT NULL;
