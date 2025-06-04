-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL,
    "checkIn" TIMESTAMP(3) NOT NULL,
    "checkOut" TIMESTAMP(3) NOT NULL,
    "nights" INTEGER NOT NULL,
    "roomType" TEXT NOT NULL,
    "ratePlan" TEXT NOT NULL,
    "guests" INTEGER NOT NULL,
    "rooms" INTEGER NOT NULL,
    "bookedBy" TEXT NOT NULL,
    "businessSegment" TEXT NOT NULL,
    "billTo" TEXT NOT NULL,
    "paymentMode" TEXT NOT NULL,
    "perDayRate" DOUBLE PRECISION NOT NULL,
    "perDayTax" DOUBLE PRECISION NOT NULL,
    "taxInclusive" BOOLEAN NOT NULL,
    "roomNo" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "guestName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "dob" TIMESTAMP(3),
    "gender" TEXT NOT NULL,
    "specialRequest" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "identity" TEXT NOT NULL,
    "idDetail" TEXT NOT NULL,
    "idProof" TEXT,
    "photoIdPath" TEXT,
    "hotelId" TEXT NOT NULL,
    "roomUnitId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_roomUnitId_fkey" FOREIGN KEY ("roomUnitId") REFERENCES "RoomUnit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
