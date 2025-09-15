/*
  Warnings:

  - You are about to drop the column `data` on the `UploadedFile` table. All the data in the column will be lost.
  - You are about to drop the column `hotelId` on the `UploadedFile` table. All the data in the column will be lost.
  - You are about to drop the column `roomId` on the `UploadedFile` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."UploadedFile" DROP CONSTRAINT "UploadedFile_hotelId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UploadedFile" DROP CONSTRAINT "UploadedFile_roomId_fkey";

-- AlterTable
ALTER TABLE "public"."UploadedFile" DROP COLUMN "data",
DROP COLUMN "hotelId",
DROP COLUMN "roomId";

-- CreateTable
CREATE TABLE "public"."PropertyImage" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT,
    "hotelId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "roomId" TEXT,

    CONSTRAINT "PropertyImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."PropertyImage" ADD CONSTRAINT "PropertyImage_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "public"."Hotel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PropertyImage" ADD CONSTRAINT "PropertyImage_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "public"."Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;
