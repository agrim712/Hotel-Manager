-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."Role" ADD VALUE 'FRONTOFFICE';
ALTER TYPE "public"."Role" ADD VALUE 'MARKETING';
ALTER TYPE "public"."Role" ADD VALUE 'SALES';
ALTER TYPE "public"."Role" ADD VALUE 'CHIEF';
ALTER TYPE "public"."Role" ADD VALUE 'WAITER';
ALTER TYPE "public"."Role" ADD VALUE 'RESTAURANTMANAGER';
