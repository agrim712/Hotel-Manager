/*
  Warnings:

  - You are about to drop the column `roomUnitId` on the `Reservation` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Reservation" DROP CONSTRAINT "Reservation_roomUnitId_fkey";

-- AlterTable
ALTER TABLE "Reservation" DROP COLUMN "roomUnitId";

-- CreateTable
CREATE TABLE "_RoomToReservation" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_RoomToReservation_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_RoomToReservation_B_index" ON "_RoomToReservation"("B");

-- AddForeignKey
ALTER TABLE "_RoomToReservation" ADD CONSTRAINT "_RoomToReservation_A_fkey" FOREIGN KEY ("A") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoomToReservation" ADD CONSTRAINT "_RoomToReservation_B_fkey" FOREIGN KEY ("B") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
