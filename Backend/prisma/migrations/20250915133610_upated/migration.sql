/*
  Warnings:

  - You are about to drop the `ItemImage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `R_Category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `R_Item` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."ItemImage" DROP CONSTRAINT "ItemImage_itemId_fkey";

-- DropForeignKey
ALTER TABLE "public"."OrderItem" DROP CONSTRAINT "OrderItem_itemId_fkey";

-- DropForeignKey
ALTER TABLE "public"."R_Item" DROP CONSTRAINT "R_Item_categoryId_fkey";

-- AlterTable
ALTER TABLE "public"."OrderItem" ALTER COLUMN "itemId" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "public"."ItemImage";

-- DropTable
DROP TABLE "public"."R_Category";

-- DropTable
DROP TABLE "public"."R_Item";

-- AddForeignKey
ALTER TABLE "public"."OrderItem" ADD CONSTRAINT "OrderItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."MenuItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
