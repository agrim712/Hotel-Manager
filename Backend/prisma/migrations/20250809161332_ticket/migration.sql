/*
  Warnings:

  - You are about to drop the column `locationDescription` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `roomId` on the `Ticket` table. All the data in the column will be lost.
  - The `status` column on the `Ticket` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `issueType` on the `Ticket` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `priority` on the `Ticket` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_roomId_fkey";

-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "locationDescription",
DROP COLUMN "roomId",
ADD COLUMN     "room" TEXT,
ALTER COLUMN "description" DROP NOT NULL,
DROP COLUMN "issueType",
ADD COLUMN     "issueType" TEXT NOT NULL,
DROP COLUMN "priority",
ADD COLUMN     "priority" TEXT NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'open';
