/*
  Warnings:

  - You are about to drop the column `address` on the `Hotel` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Room` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `RoomUnit` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Hotel_address_key";

-- AlterTable
ALTER TABLE "Hotel" DROP COLUMN "address",
ADD COLUMN     "alcoholLicense" TEXT,
ADD COLUMN     "bookingEngine" TEXT,
ADD COLUMN     "brandAffiliation" TEXT,
ADD COLUMN     "cancellationPolicy" TEXT,
ADD COLUMN     "cancelledChequePath" TEXT,
ADD COLUMN     "channelManager" TEXT,
ADD COLUMN     "checkInTime" TEXT,
ADD COLUMN     "checkOutTime" TEXT,
ADD COLUMN     "companyRegistration" TEXT,
ADD COLUMN     "earlyCheckInPolicy" TEXT,
ADD COLUMN     "fireSafetyCert" TEXT,
ADD COLUMN     "fireSafetyCertPath" TEXT,
ADD COLUMN     "fssaiLicense" TEXT,
ADD COLUMN     "fssaiLicensePath" TEXT,
ADD COLUMN     "googleMapsLink" TEXT,
ADD COLUMN     "gstCertificatePath" TEXT,
ADD COLUMN     "gstin" TEXT,
ADD COLUMN     "hotelAmenities" TEXT[],
ADD COLUMN     "hotelCategory" TEXT NOT NULL DEFAULT 'Standard',
ADD COLUMN     "hotelLogoPath" TEXT,
ADD COLUMN     "idProofPath" TEXT,
ADD COLUMN     "invoiceFormat" TEXT,
ADD COLUMN     "lateCheckOutPolicy" TEXT,
ADD COLUMN     "managementEmail" TEXT,
ADD COLUMN     "managementNumber" TEXT,
ADD COLUMN     "noShowPolicy" TEXT,
ADD COLUMN     "operationalAddress" TEXT,
ADD COLUMN     "otas" TEXT[],
ADD COLUMN     "panCardPath" TEXT,
ADD COLUMN     "panNumber" TEXT,
ADD COLUMN     "paymentModes" TEXT[],
ADD COLUMN     "pinCode" TEXT,
ADD COLUMN     "preferredLanguage" TEXT,
ADD COLUMN     "propertyImagesPaths" TEXT[],
ADD COLUMN     "registeredAddress" TEXT NOT NULL DEFAULT 'Address not provided',
ADD COLUMN     "reservationEmail" TEXT,
ADD COLUMN     "reservationNumber" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "timeZone" TEXT,
ADD COLUMN     "tourismRegistration" TEXT,
ADD COLUMN     "tradeLicense" TEXT,
ADD COLUMN     "tradeLicensePath" TEXT,
ADD COLUMN     "website" TEXT;

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "amenities" TEXT[],
ADD COLUMN     "childPolicy" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "extraBedPolicy" TEXT,
ADD COLUMN     "roomImagesPaths" TEXT[],
ADD COLUMN     "smokingPolicy" TEXT NOT NULL DEFAULT 'non-smoking',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "RoomUnit" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "BankAccount" (
    "id" TEXT NOT NULL,
    "accountHolderName" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "ifscCode" TEXT NOT NULL,
    "accountType" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedForm" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "formData" JSONB NOT NULL,
    "currentSection" TEXT NOT NULL,
    "uploadedFiles" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedForm_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SavedForm_userId_key" ON "SavedForm"("userId");

-- AddForeignKey
ALTER TABLE "BankAccount" ADD CONSTRAINT "BankAccount_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedForm" ADD CONSTRAINT "SavedForm_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
