/*
  Warnings:

  - You are about to drop the column `cancelledChequePath` on the `Hotel` table. All the data in the column will be lost.
  - You are about to drop the column `fireSafetyCertPath` on the `Hotel` table. All the data in the column will be lost.
  - You are about to drop the column `fssaiLicensePath` on the `Hotel` table. All the data in the column will be lost.
  - You are about to drop the column `gstCertPath` on the `Hotel` table. All the data in the column will be lost.
  - You are about to drop the column `idProofPath` on the `Hotel` table. All the data in the column will be lost.
  - You are about to drop the column `logoPath` on the `Hotel` table. All the data in the column will be lost.
  - You are about to drop the column `panCardPath` on the `Hotel` table. All the data in the column will be lost.
  - You are about to drop the column `tradeLicensePath` on the `Hotel` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Hotel" DROP COLUMN "cancelledChequePath",
DROP COLUMN "fireSafetyCertPath",
DROP COLUMN "fssaiLicensePath",
DROP COLUMN "gstCertPath",
DROP COLUMN "idProofPath",
DROP COLUMN "logoPath",
DROP COLUMN "panCardPath",
DROP COLUMN "tradeLicensePath";

-- AlterTable
ALTER TABLE "public"."PropertyFiles" ADD COLUMN     "fileType" TEXT NOT NULL DEFAULT 'general';
