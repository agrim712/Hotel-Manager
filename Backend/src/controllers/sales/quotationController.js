import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();


export const createQuotation = async (req, res) => {
  try {
    const hotelId = req.user.hotelId; // ✅ take from token
    const {
      leadId,
      guestName,
      contactEmail,
      contactPhone,
      source,
      rooms,
      inclusions,
      exclusions,
      discount,
      tax,
      paymentPolicy,
      terms,
      addons,
    } = req.body;

    // Ensure lead belongs to the same hotel
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead || lead.hotelId !== hotelId) {
      return res.status(403).json({ error: "Lead not found for this hotel" });
    }

    const quotation = await prisma.quotation.create({
      data: {
        leadId,
        hotelId, // ✅ from req.user
        guestName,
        contactEmail,
        contactPhone,
        source,
        rooms,
        inclusions,
        exclusions,
        discount,
        tax,
        paymentPolicy,
        terms,
        addons,
      },
    });

    res.status(201).json(quotation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create quotation" });
  }
};

export const getQuotations = async (req, res) => {
  try {
    const hotelId = req.user.hotelId; // ✅ from token

    const quotations = await prisma.quotation.findMany({
      where: { hotelId },
      include: { lead: true }, // optional: include lead info
      orderBy: { createdAt: "desc" },
    });

    res.json(quotations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch quotations" });
  }
};
