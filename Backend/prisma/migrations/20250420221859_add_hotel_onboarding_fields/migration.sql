-- AlterTable
ALTER TABLE "Hotel" ADD COLUMN     "city" TEXT,
ADD COLUMN     "contactPerson" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "currency" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "phoneCode" TEXT,
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "products" TEXT[],
ADD COLUMN     "propertyType" TEXT,
ADD COLUMN     "totalRooms" INTEGER,
ADD COLUMN     "whatsappNumber" TEXT;

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "numOfRooms" INTEGER NOT NULL,
    "maxGuests" INTEGER NOT NULL,
    "rateType" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "extraAdultRate" DOUBLE PRECISION,
    "roomNumbers" TEXT[],
    "hotelId" TEXT NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
