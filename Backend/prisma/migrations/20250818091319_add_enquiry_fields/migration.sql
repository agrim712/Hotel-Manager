/*
  Warnings:

  - A unique constraint covering the columns `[enquiryId]` on the table `Lead` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `enquiryId` to the `Lead` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "enquiryId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Lead_enquiryId_key" ON "Lead"("enquiryId");
