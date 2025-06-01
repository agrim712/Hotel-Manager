/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the `Booking` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GuestDetail` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RoomUnit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_BookingRooms` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_guestDetailsId_fkey";

-- DropForeignKey
ALTER TABLE "RoomUnit" DROP CONSTRAINT "RoomUnit_roomId_fkey";

-- DropForeignKey
ALTER TABLE "_BookingRooms" DROP CONSTRAINT "_BookingRooms_A_fkey";

-- DropForeignKey
ALTER TABLE "_BookingRooms" DROP CONSTRAINT "_BookingRooms_B_fkey";

-- AlterTable
ALTER TABLE "Room" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "roomNumbers" TEXT[];

-- DropTable
DROP TABLE "Booking";

-- DropTable
DROP TABLE "GuestDetail";

-- DropTable
DROP TABLE "RoomUnit";

-- DropTable
DROP TABLE "_BookingRooms";

-- DropEnum
DROP TYPE "BookingStatus";

-- DropEnum
DROP TYPE "PaymentMode";

-- DropEnum
DROP TYPE "RatePlan";
