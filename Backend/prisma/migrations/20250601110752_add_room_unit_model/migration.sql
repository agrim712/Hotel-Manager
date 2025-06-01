-- CreateEnum
CREATE TYPE "RoomStatus" AS ENUM ('AVAILABLE', 'BOOKED', 'MAINTENANCE');

-- CreateTable
CREATE TABLE "RoomUnit" (
    "id" TEXT NOT NULL,
    "roomNumber" TEXT NOT NULL,
    "status" "RoomStatus" NOT NULL DEFAULT 'AVAILABLE',
    "notes" TEXT,
    "floor" INTEGER,
    "roomId" TEXT NOT NULL,

    CONSTRAINT "RoomUnit_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RoomUnit" ADD CONSTRAINT "RoomUnit_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
