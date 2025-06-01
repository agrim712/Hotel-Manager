/*
  Warnings:

  - You are about to drop the column `roomNumbers` on the `Room` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('confirmed', 'cancelled', 'checkedIn', 'checkedOut', 'noShow');

-- CreateEnum
CREATE TYPE "RatePlan" AS ENUM ('CP', 'EP', 'MAP', 'AP');

-- CreateEnum
CREATE TYPE "PaymentMode" AS ENUM ('cash', 'card', 'upi', 'bankTransfer');

-- AlterTable
ALTER TABLE "Room" DROP COLUMN "roomNumbers",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "RoomUnit" (
    "id" TEXT NOT NULL,
    "roomNumber" TEXT NOT NULL,
    "floor" INTEGER,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'available',
    "roomId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoomUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "checkIn" TIMESTAMP(3) NOT NULL,
    "checkOut" TIMESTAMP(3) NOT NULL,
    "nights" INTEGER NOT NULL,
    "numberOfGuests" INTEGER NOT NULL,
    "roomType" TEXT NOT NULL,
    "ratePlan" "RatePlan" NOT NULL,
    "rooms" INTEGER NOT NULL,
    "bookedBy" TEXT NOT NULL,
    "businessSegment" TEXT NOT NULL,
    "billTo" TEXT NOT NULL,
    "paymentMode" "PaymentMode" NOT NULL,
    "perDayRate" DOUBLE PRECISION NOT NULL,
    "perDayTax" DOUBLE PRECISION NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "bookingStatus" "BookingStatus" NOT NULL DEFAULT 'confirmed',
    "guestDetailsId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuestDetail" (
    "id" TEXT NOT NULL,
    "guestName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "gender" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "specialRequest" TEXT,
    "identityType" TEXT NOT NULL,
    "identityDetail" TEXT NOT NULL,
    "photoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuestDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BookingRooms" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BookingRooms_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "RoomUnit_roomNumber_key" ON "RoomUnit"("roomNumber");

-- CreateIndex
CREATE INDEX "Booking_checkIn_idx" ON "Booking"("checkIn");

-- CreateIndex
CREATE INDEX "Booking_checkOut_idx" ON "Booking"("checkOut");

-- CreateIndex
CREATE INDEX "Booking_guestDetailsId_idx" ON "Booking"("guestDetailsId");

-- CreateIndex
CREATE INDEX "_BookingRooms_B_index" ON "_BookingRooms"("B");

-- AddForeignKey
ALTER TABLE "RoomUnit" ADD CONSTRAINT "RoomUnit_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_guestDetailsId_fkey" FOREIGN KEY ("guestDetailsId") REFERENCES "GuestDetail"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BookingRooms" ADD CONSTRAINT "_BookingRooms_A_fkey" FOREIGN KEY ("A") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BookingRooms" ADD CONSTRAINT "_BookingRooms_B_fkey" FOREIGN KEY ("B") REFERENCES "RoomUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
