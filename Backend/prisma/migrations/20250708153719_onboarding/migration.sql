/*
  Warnings:

  - You are about to drop the column `type` on the `BankAccount` table. All the data in the column will be lost.
  - You are about to drop the column `managementEmail` on the `Hotel` table. All the data in the column will be lost.
  - You are about to drop the column `managementNumber` on the `Hotel` table. All the data in the column will be lost.
  - You are about to drop the column `reservationEmail` on the `Hotel` table. All the data in the column will be lost.
  - You are about to drop the column `reservationNumber` on the `Hotel` table. All the data in the column will be lost.
  - You are about to drop the column `count` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the column `images` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the column `numbers` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the `Reservation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RoomUnit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_RoomToReservation` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `accountType` to the `BankAccount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numOfRooms` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Reservation" DROP CONSTRAINT "Reservation_hotelId_fkey";

-- DropForeignKey
ALTER TABLE "Reservation" DROP CONSTRAINT "Reservation_roomUnitId_fkey";

-- DropForeignKey
ALTER TABLE "RoomUnit" DROP CONSTRAINT "RoomUnit_roomId_fkey";

-- DropForeignKey
ALTER TABLE "_RoomToReservation" DROP CONSTRAINT "_RoomToReservation_A_fkey";

-- DropForeignKey
ALTER TABLE "_RoomToReservation" DROP CONSTRAINT "_RoomToReservation_B_fkey";

-- AlterTable
ALTER TABLE "BankAccount" DROP COLUMN "type",
ADD COLUMN     "accountType" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Hotel" DROP COLUMN "managementEmail",
DROP COLUMN "managementNumber",
DROP COLUMN "reservationEmail",
DROP COLUMN "reservationNumber",
ALTER COLUMN "category" SET DEFAULT '3-Star';

-- AlterTable
ALTER TABLE "Room" DROP COLUMN "count",
DROP COLUMN "images",
DROP COLUMN "numbers",
ADD COLUMN     "numOfRooms" INTEGER NOT NULL,
ADD COLUMN     "roomImages" JSONB,
ADD COLUMN     "roomNumbers" TEXT[];

-- DropTable
DROP TABLE "Reservation";

-- DropTable
DROP TABLE "RoomUnit";

-- DropTable
DROP TABLE "_RoomToReservation";
