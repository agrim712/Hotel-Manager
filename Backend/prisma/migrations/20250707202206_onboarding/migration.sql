/*
  Warnings:

  - You are about to drop the column `accountType` on the `BankAccount` table. All the data in the column will be lost.
  - You are about to drop the column `gstCertificatePath` on the `Hotel` table. All the data in the column will be lost.
  - You are about to drop the column `hotelAmenities` on the `Hotel` table. All the data in the column will be lost.
  - You are about to drop the column `hotelCategory` on the `Hotel` table. All the data in the column will be lost.
  - You are about to drop the column `hotelLogoPath` on the `Hotel` table. All the data in the column will be lost.
  - You are about to drop the column `propertyImagesPaths` on the `Hotel` table. All the data in the column will be lost.
  - The `city` column on the `Hotel` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `country` column on the `Hotel` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `currency` column on the `Hotel` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `phoneCode` column on the `Hotel` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `products` column on the `Hotel` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `otas` column on the `Hotel` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `paymentModes` column on the `Hotel` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `preferredLanguage` column on the `Hotel` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `timeZone` column on the `Hotel` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `numOfRooms` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the column `roomImagesPaths` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the column `roomNumbers` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the column `smokingPolicy` on the `Room` table. All the data in the column will be lost.
  - The `rateType` column on the `Room` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `amenities` column on the `Room` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `type` to the `BankAccount` table without a default value. This is not possible if the table is not empty.
  - Made the column `contactPerson` on table `Hotel` required. This step will fail if there are existing NULL values in that column.
  - Made the column `email` on table `Hotel` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phoneNumber` on table `Hotel` required. This step will fail if there are existing NULL values in that column.
  - Made the column `totalRooms` on table `Hotel` required. This step will fail if there are existing NULL values in that column.
  - Made the column `cancellationPolicy` on table `Hotel` required. This step will fail if there are existing NULL values in that column.
  - Made the column `checkInTime` on table `Hotel` required. This step will fail if there are existing NULL values in that column.
  - Made the column `checkOutTime` on table `Hotel` required. This step will fail if there are existing NULL values in that column.
  - Made the column `panNumber` on table `Hotel` required. This step will fail if there are existing NULL values in that column.
  - Made the column `pinCode` on table `Hotel` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `count` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BankAccount" DROP COLUMN "accountType",
ADD COLUMN     "type" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Hotel" DROP COLUMN "gstCertificatePath",
DROP COLUMN "hotelAmenities",
DROP COLUMN "hotelCategory",
DROP COLUMN "hotelLogoPath",
DROP COLUMN "propertyImagesPaths",
ADD COLUMN     "amenities" JSONB,
ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'Standard',
ADD COLUMN     "gstCertPath" TEXT,
ADD COLUMN     "logoPath" TEXT,
ADD COLUMN     "propertyImages" JSONB,
DROP COLUMN "city",
ADD COLUMN     "city" JSONB,
ALTER COLUMN "contactPerson" SET NOT NULL,
DROP COLUMN "country",
ADD COLUMN     "country" JSONB,
DROP COLUMN "currency",
ADD COLUMN     "currency" JSONB,
ALTER COLUMN "email" SET NOT NULL,
DROP COLUMN "phoneCode",
ADD COLUMN     "phoneCode" JSONB,
ALTER COLUMN "phoneNumber" SET NOT NULL,
DROP COLUMN "products",
ADD COLUMN     "products" JSONB,
ALTER COLUMN "totalRooms" SET NOT NULL,
ALTER COLUMN "cancellationPolicy" SET NOT NULL,
ALTER COLUMN "checkInTime" SET NOT NULL,
ALTER COLUMN "checkOutTime" SET NOT NULL,
DROP COLUMN "otas",
ADD COLUMN     "otas" JSONB,
ALTER COLUMN "panNumber" SET NOT NULL,
DROP COLUMN "paymentModes",
ADD COLUMN     "paymentModes" JSONB,
ALTER COLUMN "pinCode" SET NOT NULL,
DROP COLUMN "preferredLanguage",
ADD COLUMN     "preferredLanguage" JSONB,
ALTER COLUMN "registeredAddress" DROP DEFAULT,
DROP COLUMN "timeZone",
ADD COLUMN     "timeZone" JSONB;

-- AlterTable
ALTER TABLE "Room" DROP COLUMN "numOfRooms",
DROP COLUMN "roomImagesPaths",
DROP COLUMN "roomNumbers",
DROP COLUMN "smokingPolicy",
ADD COLUMN     "count" INTEGER NOT NULL,
ADD COLUMN     "images" JSONB,
ADD COLUMN     "numbers" TEXT[],
ADD COLUMN     "smoking" TEXT NOT NULL DEFAULT 'non-smoking',
DROP COLUMN "rateType",
ADD COLUMN     "rateType" JSONB,
DROP COLUMN "amenities",
ADD COLUMN     "amenities" JSONB;
