/*
  Warnings:

  - The `extraAdultRate` column on the `Room` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[email]` on the table `Property` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `phoneCode` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `totalRooms` on the `Property` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `updatedAt` to the `Room` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `numOfRooms` on the `Room` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `maxGuests` on the `Room` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `rate` on the `Room` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "phoneCode" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "totalRooms",
ADD COLUMN     "totalRooms" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "numOfRooms",
ADD COLUMN     "numOfRooms" INTEGER NOT NULL,
DROP COLUMN "maxGuests",
ADD COLUMN     "maxGuests" INTEGER NOT NULL,
DROP COLUMN "rate",
ADD COLUMN     "rate" DOUBLE PRECISION NOT NULL,
DROP COLUMN "extraAdultRate",
ADD COLUMN     "extraAdultRate" DOUBLE PRECISION;

-- CreateIndex
CREATE UNIQUE INDEX "Property_email_key" ON "Property"("email");
