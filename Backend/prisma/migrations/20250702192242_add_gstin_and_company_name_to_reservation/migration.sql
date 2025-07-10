/*
  Warnings:

  - Added the required column `gstin` to the `Reservation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `Reservation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "gstin" TEXT NOT NULL,
ADD COLUMN     "state" TEXT NOT NULL;
