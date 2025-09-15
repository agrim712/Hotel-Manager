/*
  Warnings:

  - You are about to drop the column `uploadedFiles` on the `SavedForm` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."SavedForm" DROP COLUMN "uploadedFiles";
