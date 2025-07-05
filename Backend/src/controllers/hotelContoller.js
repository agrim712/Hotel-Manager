import { PrismaClient } from '@prisma/client';
import { createHotelSchema, roomUnitSchema } from "../validators/hotelSchema.js";
import PDFDocument from "pdfkit";
const prisma = new PrismaClient();

const ALL_MODULES = [
  "PMS",
  "Channel Manager",
  "RMS",
  "Spa & Wellness Management",
  "Bar & Beverage Management",
  "Restaurant & Dining Management",
  "All in One"
];

// =================== Create or Update Hotel ===================
export const createHotel = async (req, res) => {
  try {
    const validated = createHotelSchema.parse(req.body);
    const trimmedAddress = validated.address.trim();

    const existingHotel = await prisma.hotel.findUnique({
      where: { address: trimmedAddress }
    });

    const hotelData = {
      name: validated.name,
      country: validated.country,
      city: validated.city,
      contactPerson: validated.contactPerson,
      phoneCode: validated.phoneCode,
      phoneNumber: validated.phoneNumber,
      whatsappNumber: validated.whatsappNumber,
      totalRooms: validated.totalRooms,
      email: validated.email,
      propertyType: validated.propertyType,
      currency: validated.currency,
      products: validated.products
    };

    let hotel;

    if (existingHotel) {
      // Update Hotel
      hotel = await prisma.hotel.update({
        where: { address: trimmedAddress },
        data: hotelData,
      });

      await prisma.room.deleteMany({ where: { hotelId: hotel.id } });

    } else {
      // Create Hotel
      hotel = await prisma.hotel.create({
        data: { ...hotelData, address: trimmedAddress },
      });
    }

    if (validated.rooms && validated.rooms.length > 0) {
      for (const room of validated.rooms) {
        const createdRoom = await prisma.room.create({
          data: {
            name: room.name,
            numOfRooms: room.numOfRooms,
            maxGuests: room.maxGuests,
            rateType: room.rateType,
            rate: room.rate,
            extraAdultRate: room.extraAdultRate,
            roomNumbers: room.roomNumbers,
            hotelId: hotel.id,
          }
        });

        const roomUnitData = room.roomNumbers.map(roomNumber => {
          return roomUnitSchema.parse({
            roomNumber,
            roomId: createdRoom.id
          });
        });

        await prisma.roomUnit.createMany({ data: roomUnitData });
      }
    }

    return res.status(existingHotel ? 200 : 201).json({
      message: existingHotel ? "Hotel updated successfully" : "Hotel created successfully",
      hotel
    });
  } catch (err) {
    console.error("Hotel create/update error:", err);
    return res.status(400).json({
      error: "Invalid data or server error",
      details: err?.errors || err.message
    });
  }
};

// =================== Get Logged In Hotel Info ===================
export const getHotelMe = async (req, res) => {
  try {
    const user = req.user;

    if (!user || !user.hotelId) {
      return res.status(401).json({ message: "User not associated with any hotel" });
    }

    const hotel = await prisma.hotel.findUnique({
      where: { id: user.hotelId },
    });

    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    return res.json({ hotel });
  } catch (err) {
    console.error("Error fetching hotel info:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// =================== Get Available Upgrades ===================
export const getAvailableUpgrades = async (req, res) => {
  try {
    const hotelId = req.user.hotelId;

    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
      select: { products: true },
    });

    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    const upgrades = ALL_MODULES.filter(module =>
      !(hotel.products || []).includes(module)
    );

    return res.json({ upgrades });
  } catch (err) {
    console.error("Error fetching upgrades:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const downloadHotelPolicy = async (req, res) => {
  try {
    const user = req.user;
    const hotel = await prisma.hotel.findUnique({
      where: { id: user.hotelId },
    });

    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    const doc = new PDFDocument({ margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="HotelPolicy-${hotel.name.replace(/\s+/g, "_")}.pdf"`
    );

    doc.pipe(res);

    // Heading
    doc.fontSize(18).text("Hotel Policy Document", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Hotel Name: ${hotel.name}`);
    doc.text(`Location: ${hotel.city || ""}, ${hotel.state || ""}, ${hotel.country || ""}`);
    doc.text(`Document Type: Standard Hotel Policies and Guest Guidelines`);
    doc.text(`Effective Date: ${new Date().toLocaleDateString("en-IN")}`);
    doc.moveDown();

    // Full Policy Content
    const policyContent = `
1. Check-In / Check-Out Policy
• Check-In Time: 2:00 PM
• Check-Out Time: 12:00 Noon
• Early Check-In / Late Check-Out: Subject to availability. Additional charges may apply.
• ID Requirement: Valid government-issued ID is mandatory for all guests.

2. Reservation & Cancellation Policy
• Reservation Guarantee: Credit card or advance payment required to confirm bookings.
• Cancellation Timeline:
  - Free Cancellation: Up to 48 hours before check-in.
  - Late Cancellation/No-Show: 1 night retention charge.
• Group Bookings: Customized cancellation and payment terms apply.

3. Children & Extra Bed Policy
• Children Below 6 Years: Stay free when using existing bedding.
• Extra Bed Charges: ₹[Amount] per night.
• Cribs: Provided on request, subject to availability.

4. Payment Policy
• Accepted Payment Methods: Cash, Credit/Debit Cards, UPI, Net Banking.
• Taxes: As applicable under Indian GST rules.
• Billing Currency: Indian Rupee (INR).

5. Smoking Policy
• Non-Smoking Rooms: Smoking is prohibited inside rooms.
• Smoking Zones: Designated smoking areas available.
• Fine for Smoking in Rooms: ₹[Amount] cleaning charge.

6. Pet Policy
• Pets: Not allowed inside guest rooms.
• Service Animals: Allowed with prior information.

7. Guest Conduct Policy
• Noise Levels: Please maintain silence between 10:00 PM and 7:00 AM.
• Misconduct: The hotel reserves the right to evict guests involved in illegal or disruptive behavior.

8. Visitors Policy
• Visitor Hours: 9:00 AM to 9:00 PM.
• Room Entry: Only registered guests are allowed after visitor hours.

9. Security & Safety Policy
• Surveillance: CCTV in public areas.
• Valuables: Use the in-room safe. The hotel is not responsible for lost/stolen items.
• Emergency Exits: Clearly marked on floor maps.

10. Lost and Found Policy
• Items left behind are held for 30 days.
• Guests must contact the front desk to claim items.
• Shipping charges for return of items are to be borne by the guest.

11. Damage Policy
• Guests will be charged for any intentional damage to hotel property.
• Charges will be based on the repair/replacement cost.

12. Food & Beverage Policy
• Outside Food: Not allowed without prior approval.
• Alcohol: Permitted only in licensed areas.
• In-Room Dining: Available from [Time] to [Time].

13. Internet & Technology Policy
• Wi-Fi: Complimentary across hotel premises.
• Abuse of Network: Illegal or inappropriate use of internet is prohibited.

14. Banquet & Event Policy (If applicable)
• Advance booking and security deposit required.
• Use of own decorators or caterers needs prior approval.
• Noise/music allowed only till permitted hours per local laws.

15. Spa/Pool/Gym Policy (If applicable)
• Use during operational hours only.
• Guests must follow hygiene and dress codes.
• No lifeguard on duty at pool; use at own risk.

16. Sustainability & Environmental Policy
• Towels/linen changed on request to conserve water.
• Energy-saving devices in use.
• Guests are encouraged to support green practices.

17. Data Privacy & Confidentiality Policy
• Guest data is stored securely and not shared with third parties except as per legal requirement.
• CCTV data is used only for security monitoring.

18. Force Majeure
• The hotel shall not be liable for failure to perform its obligations if such failure results from acts beyond its control (natural disasters, strikes, pandemics, etc.).

19. Dispute Resolution
• In case of disputes, the jurisdiction will be the local courts of ${hotel.city || "your city"}.
`;

    doc.fontSize(10).text(policyContent, {
      align: "left",
      lineGap: 2,
    });

    doc.end();
  } catch (error) {
    console.error("Error generating hotel policy PDF:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate hotel policy PDF",
    });
  }
};


