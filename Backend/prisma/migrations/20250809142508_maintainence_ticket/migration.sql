-- CreateTable
CREATE TABLE "EnergyConsumption" (
    "id" SERIAL NOT NULL,
    "hotelId" TEXT NOT NULL,
    "month" TIMESTAMP(3) NOT NULL,
    "electricityKwh" DOUBLE PRECISION,
    "waterLiters" DOUBLE PRECISION,
    "gasUnits" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnergyConsumption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EnergyConsumption_month_hotelId_key" ON "EnergyConsumption"("month", "hotelId");

-- AddForeignKey
ALTER TABLE "EnergyConsumption" ADD CONSTRAINT "EnergyConsumption_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
