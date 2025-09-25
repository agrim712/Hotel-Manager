-- AlterTable
ALTER TABLE "public"."Outlet" ADD COLUMN     "managerId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."Outlet" ADD CONSTRAINT "Outlet_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "public"."StaffUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
