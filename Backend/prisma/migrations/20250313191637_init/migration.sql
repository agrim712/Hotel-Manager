-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "propertyName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "yourName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "whatsappNumber" TEXT,
    "email" TEXT NOT NULL,
    "propertyType" TEXT NOT NULL,
    "totalRooms" TEXT NOT NULL,
    "products" TEXT NOT NULL,
    "currency" TEXT NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "roomName" TEXT NOT NULL,
    "numOfRooms" TEXT NOT NULL,
    "maxGuests" TEXT NOT NULL,
    "rateType" TEXT NOT NULL,
    "rate" TEXT NOT NULL,
    "extraAdultRate" TEXT,
    "roomNumbers" TEXT,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
