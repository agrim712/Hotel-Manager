// src/cron/yearlyAvailability.js
import cron from "node-cron";
import { PrismaClient } from "@prisma/client";
import { eachDayOfInterval } from "date-fns";

const prisma = new PrismaClient();

/**
 * 📆 This cron job runs every 1st January at midnight.
 * It generates availability status for all RoomUnits from
 * 1st April (current year) to 31st March (next year).
 */
cron.schedule("0 0 1 1 *", async () => {
  console.log("🛠️ [CRON] Yearly availability generation started...");

  const currentYear = new Date().getFullYear();
  const startDate = new Date(`${currentYear}-04-01`);
  const endDate = new Date(`${currentYear + 1}-03-31`);

  try {
    const roomUnits = await prisma.roomUnit.findMany();

    for (const unit of roomUnits) {
      // ✅ Skip if already generated for this FY
      if (
        unit.availabilityStartDate &&
        new Date(unit.availabilityStartDate).getTime() === startDate.getTime()
      ) {
        console.log(`↪️ Skipping RoomUnit ${unit.roomNumber} (already initialized)`);
        continue;
      }

      // 🗓️ Generate array with correct days (leap year-safe)
      const days = eachDayOfInterval({ start: startDate, end: endDate });
      const dailyStatus = days.map(() => "AVAILABLE");

      await prisma.roomUnit.update({
        where: { id: unit.id },
        data: {
          availabilityStartDate: startDate,
          dailyStatus,
        },
      });

      console.log(`✅ RoomUnit ${unit.roomNumber} availability initialized.`);
    }

    console.log("🎉 [CRON] Yearly availability generation completed successfully!");
  } catch (err) {
    console.error("❌ [CRON] Yearly availability generation failed:", err);
  }
});
