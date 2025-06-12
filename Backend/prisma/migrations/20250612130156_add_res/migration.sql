-- CreateTable
CREATE TABLE "R_Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "R_Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "R_Item" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "spiceLevel" TEXT NOT NULL DEFAULT 'Mild',
    "allergens" TEXT[],
    "vegetarian" BOOLEAN NOT NULL DEFAULT false,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "prepTime" INTEGER NOT NULL DEFAULT 15,
    "categoryId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "R_Item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "R_Category_name_key" ON "R_Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "R_Item_name_categoryId_key" ON "R_Item"("name", "categoryId");

-- AddForeignKey
ALTER TABLE "R_Item" ADD CONSTRAINT "R_Item_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "R_Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
