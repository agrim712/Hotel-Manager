-- AlterTable
ALTER TABLE "public"."Table" ADD COLUMN     "waiterId" TEXT;

-- CreateTable
CREATE TABLE "public"."Waiter" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "employeeId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "hotelId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Waiter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Waiter_email_key" ON "public"."Waiter"("email");

-- AddForeignKey
ALTER TABLE "public"."Waiter" ADD CONSTRAINT "Waiter_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "public"."Hotel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Table" ADD CONSTRAINT "Table_waiterId_fkey" FOREIGN KEY ("waiterId") REFERENCES "public"."Waiter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
