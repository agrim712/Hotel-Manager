/*
  Warnings:

  - You are about to drop the column `propertyImages` on the `Hotel` table. All the data in the column will be lost.
  - You are about to drop the column `roomImages` on the `Room` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Hotel" DROP COLUMN "propertyImages";

-- AlterTable
ALTER TABLE "public"."Room" DROP COLUMN "roomImages";

-- CreateTable
CREATE TABLE "public"."UploadedFile" (
    "id" SERIAL NOT NULL,
    "filename" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "data" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "roomId" TEXT,
    "hotelId" TEXT,

    CONSTRAINT "UploadedFile_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."UploadedFile" ADD CONSTRAINT "UploadedFile_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "public"."Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UploadedFile" ADD CONSTRAINT "UploadedFile_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "public"."Hotel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
