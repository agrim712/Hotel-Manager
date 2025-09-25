/*
  Warnings:

  - A unique constraint covering the columns `[name,hotelId,outletId]` on the table `MenuCategory` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."MenuCategory_name_hotelId_key";

-- AlterTable
ALTER TABLE "public"."Area" ADD COLUMN     "outletId" TEXT;

-- AlterTable
ALTER TABLE "public"."ComboItem" ADD COLUMN     "outletId" TEXT;

-- AlterTable
ALTER TABLE "public"."Coupon" ADD COLUMN     "outletId" TEXT;

-- AlterTable
ALTER TABLE "public"."InventoryItem" ADD COLUMN     "outletId" TEXT;

-- AlterTable
ALTER TABLE "public"."KitchenDisplay" ADD COLUMN     "outletId" TEXT;

-- AlterTable
ALTER TABLE "public"."KitchenOrder" ADD COLUMN     "outletId" TEXT;

-- AlterTable
ALTER TABLE "public"."MenuCategory" ADD COLUMN     "outletId" TEXT;

-- AlterTable
ALTER TABLE "public"."MenuItem" ADD COLUMN     "outletId" TEXT;

-- AlterTable
ALTER TABLE "public"."MenuModifier" ADD COLUMN     "outletId" TEXT;

-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "outletId" TEXT;

-- AlterTable
ALTER TABLE "public"."QueueEntry" ADD COLUMN     "outletId" TEXT;

-- AlterTable
ALTER TABLE "public"."Supplier" ADD COLUMN     "outletId" TEXT;

-- AlterTable
ALTER TABLE "public"."Table" ADD COLUMN     "outletId" TEXT;

-- AlterTable
ALTER TABLE "public"."ThirdPartyOrder" ADD COLUMN     "outletId" TEXT;

-- AlterTable
ALTER TABLE "public"."Waiter" ADD COLUMN     "outletId" TEXT;

-- CreateTable
CREATE TABLE "public"."Outlet" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "operatingHours" JSONB,
    "outletType" TEXT NOT NULL DEFAULT 'RESTAURANT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "hotelId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Outlet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Outlet_name_hotelId_key" ON "public"."Outlet"("name", "hotelId");

-- CreateIndex
CREATE UNIQUE INDEX "MenuCategory_name_hotelId_outletId_key" ON "public"."MenuCategory"("name", "hotelId", "outletId");

-- AddForeignKey
ALTER TABLE "public"."Waiter" ADD CONSTRAINT "Waiter_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "public"."Outlet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Table" ADD CONSTRAINT "Table_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "public"."Outlet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Area" ADD CONSTRAINT "Area_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "public"."Outlet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "public"."Outlet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InventoryItem" ADD CONSTRAINT "InventoryItem_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "public"."Outlet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Supplier" ADD CONSTRAINT "Supplier_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "public"."Outlet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Outlet" ADD CONSTRAINT "Outlet_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "public"."Hotel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MenuCategory" ADD CONSTRAINT "MenuCategory_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "public"."Outlet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MenuItem" ADD CONSTRAINT "MenuItem_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "public"."Outlet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MenuModifier" ADD CONSTRAINT "MenuModifier_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "public"."Outlet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ComboItem" ADD CONSTRAINT "ComboItem_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "public"."Outlet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."KitchenOrder" ADD CONSTRAINT "KitchenOrder_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "public"."Outlet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Coupon" ADD CONSTRAINT "Coupon_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "public"."Outlet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."KitchenDisplay" ADD CONSTRAINT "KitchenDisplay_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "public"."Outlet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QueueEntry" ADD CONSTRAINT "QueueEntry_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "public"."Outlet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ThirdPartyOrder" ADD CONSTRAINT "ThirdPartyOrder_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "public"."Outlet"("id") ON DELETE SET NULL ON UPDATE CASCADE;
