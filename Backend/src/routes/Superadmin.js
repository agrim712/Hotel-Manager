// routes/superadmin.js

import express from "express";
import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import { auth, authorizeRoles } from "../middleware/auth.js";

const prisma = new PrismaClient();
const router = express.Router();

// GET /api/superadmin/all (Hotels without HOTELADMIN)
router.get("/all", auth, authorizeRoles("SUPERADMIN"), async (req, res) => {
  try {
    const hotels = await prisma.hotel.findMany({
      where: {
        users: {
          none: {
            role: "SUPERADMIN", // ❌ BUG: This should probably be "HOTELADMIN"
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        users: true,
      },
    });

    res.status(200).json({ success: true, data: hotels });
  } catch (error) {
    console.error("Error fetching hotels:", error);
    res.status(500).json({ success: false, message: "Failed to fetch hotels" });
  }
});

export default router;
