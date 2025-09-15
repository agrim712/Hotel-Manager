/*
  Warnings:

  - You are about to drop the `PropertyImage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."PropertyImage" DROP CONSTRAINT "PropertyImage_hotelId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PropertyImage" DROP CONSTRAINT "PropertyImage_roomId_fkey";

-- DropTable
DROP TABLE "public"."PropertyImage";

-- CreateTable
CREATE TABLE "public"."PropertyFiles" (
    "id" SERIAL NOT NULL,
    "altText" TEXT,
    "hotelId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadedFileId" INTEGER NOT NULL,

    CONSTRAINT "PropertyFiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RoomImage" (
    "id" SERIAL NOT NULL,
    "altText" TEXT,
    "hotelId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "roomId" TEXT,
    "uploadedFileId" INTEGER NOT NULL,

    CONSTRAINT "RoomImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."PropertyFiles" ADD CONSTRAINT "PropertyFiles_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "public"."Hotel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PropertyFiles" ADD CONSTRAINT "PropertyFiles_uploadedFileId_fkey" FOREIGN KEY ("uploadedFileId") REFERENCES "public"."UploadedFile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RoomImage" ADD CONSTRAINT "RoomImage_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "public"."Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RoomImage" ADD CONSTRAINT "RoomImage_uploadedFileId_fkey" FOREIGN KEY ("uploadedFileId") REFERENCES "public"."UploadedFile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
