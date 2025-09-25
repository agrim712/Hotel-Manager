-- CreateEnum
CREATE TYPE "public"."SupplierCategory" AS ENUM ('MAIN', 'SECONDARY', 'EMERGENCY');

-- AlterTable
ALTER TABLE "public"."Supplier" ADD COLUMN     "category" "public"."SupplierCategory" NOT NULL DEFAULT 'MAIN';

-- CreateTable
CREATE TABLE "public"."Recipe" (
    "id" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "steps" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RecipeItem" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "inventoryItemId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT,

    CONSTRAINT "RecipeItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Recipe_menuItemId_key" ON "public"."Recipe"("menuItemId");

-- AddForeignKey
ALTER TABLE "public"."Recipe" ADD CONSTRAINT "Recipe_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "public"."MenuItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Recipe" ADD CONSTRAINT "Recipe_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "public"."Hotel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RecipeItem" ADD CONSTRAINT "RecipeItem_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "public"."Recipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RecipeItem" ADD CONSTRAINT "RecipeItem_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "public"."InventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
