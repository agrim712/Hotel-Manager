-- AlterTable
ALTER TABLE "public"."Hotel" ADD COLUMN     "cancelledChequePath" TEXT,
ADD COLUMN     "fireSafetyCertPath" TEXT,
ADD COLUMN     "fssaiLicensePath" TEXT,
ADD COLUMN     "gstCertPath" TEXT,
ADD COLUMN     "idProofPath" TEXT,
ADD COLUMN     "logoPath" TEXT,
ADD COLUMN     "panCardPath" TEXT,
ADD COLUMN     "tradeLicensePath" TEXT;

-- AlterTable
ALTER TABLE "public"."PropertyFiles" ALTER COLUMN "fileType" DROP DEFAULT;
