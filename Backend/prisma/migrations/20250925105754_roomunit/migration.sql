/*
  Warnings:

  - Added the required column `startDate` to the `RoomUnit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."RoomUnit" ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL;
