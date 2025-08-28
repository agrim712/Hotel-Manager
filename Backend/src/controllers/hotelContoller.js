import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import PDFDocument from "pdfkit";

const prisma = new PrismaClient();
const ALL_MODULES = [
    { value: "Spa Management", label: "Spa Management" },
    { value: "PMS", label: "Property Management System (PMS)" },
    { value: "RMS", label: "Revenue Management System (RMS)" },
    { value: "Bar Management", label: "Bar Management" },
    { value: "Restaurant Management", label: "Restaurant Management" },
    { value: "Laundry Management", label: "Laundry Management" },
    { value: "Cab/Travel Management", label: "Cab/Travel Management" },
    { label: "All in One", value: "All in One"}
  ];


// Helper function to save files locally


export const createHotel = async (req, res) => {
  try {
    const { body } = req;
    // Find the existing default hotel entry
    const existingHotel = await prisma.hotel.findFirst({
      where: {
        email: body.email // Using email as the unique identifier
      }
    });

    if (!existingHotel) {
      return res.status(404).json({ error: "Default hotel entry not found" });
    }

    // Prepare update data - only update fields that are provided in the form
    const updateData = {
      // Basic Information
      name: body.name || existingHotel.name,
      brandAffiliation: body.brandAffiliation || existingHotel.brandAffiliation,
      category: body.category || existingHotel.category,
      registeredAddress: body.registeredAddress || existingHotel.registeredAddress,
      operationalAddress: body.operationalAddress || existingHotel.operationalAddress,
      
      // Location Information
      country: body.country || existingHotel.country,
      state: body.state || existingHotel.state,
      city: body.city || existingHotel.city,
      pinCode: body.pinCode || existingHotel.pinCode,
      timeZone: body.timeZone || existingHotel.timeZone,
      preferredLanguage: body.preferredLanguage || existingHotel.preferredLanguage,
      
      // Contact Information
      contactPerson: body.contactPerson || existingHotel.contactPerson,
      phoneCode: body.phoneCode || existingHotel.phoneCode,
      phoneNumber: body.phoneNumber || existingHotel.phoneNumber,
      whatsappNumber: body.whatsappNumber || existingHotel.whatsappNumber,
      email: body.email || existingHotel.email,
      website: body.website || existingHotel.website,
      googleMapsLink: body.googleMapsLink || existingHotel.googleMapsLink,

      // Property Details
      totalRooms: body.totalRooms ? Number(body.totalRooms) : existingHotel.totalRooms,
      propertyType: body.propertyType || existingHotel.propertyType,
      currency: body.currency || existingHotel.currency,

      // Government & Tax Details
      panNumber: body.panNumber || existingHotel.panNumber,
      gstin: body.gstin || existingHotel.gstin,
      fssaiLicense: body.fssaiLicense || existingHotel.fssaiLicense,
      fireSafetyCert: body.fireSafetyCert || existingHotel.fireSafetyCert,
      tradeLicense: body.tradeLicense || existingHotel.tradeLicense,
      alcoholLicense: body.alcoholLicense || existingHotel.alcoholLicense,
      tourismRegistration: body.tourismRegistration || existingHotel.tourismRegistration,
      companyRegistration: body.companyRegistration || existingHotel.companyRegistration,

      // Operations
      checkInTime: body.checkInTime || existingHotel.checkInTime,
      checkOutTime: body.checkOutTime || existingHotel.checkOutTime,
      earlyCheckInPolicy: body.earlyCheckInPolicy || existingHotel.earlyCheckInPolicy,
      lateCheckOutPolicy: body.lateCheckOutPolicy || existingHotel.lateCheckOutPolicy,
      cancellationPolicy: body.cancellationPolicy || existingHotel.cancellationPolicy,
      noShowPolicy: body.noShowPolicy || existingHotel.noShowPolicy,

      // Accounting
      invoiceFormat: body.invoiceFormat || existingHotel.invoiceFormat,
      paymentModes: body.paymentModes || existingHotel.paymentModes,

      // OTA
      otas: body.otas || existingHotel.otas,
      channelManager: body.channelManager || existingHotel.channelManager,
      bookingEngine: body.bookingEngine || existingHotel.bookingEngine,

      // Products
      products: body.products || existingHotel.products,

      // Documents
      logoPath: body.logoPath || existingHotel.logoPath,
      panCardPath: body.panCardPath || existingHotel.panCardPath,
      gstCertPath: body.gstCertPath || existingHotel.gstCertPath,
      tradeLicensePath: body.tradeLicensePath || existingHotel.tradeLicensePath,
      fireSafetyCertPath: body.fireSafetyCertPath || existingHotel.fireSafetyCertPath,
      fssaiLicensePath: body.fssaiLicensePath || existingHotel.fssaiLicensePath,
      cancelledChequePath: body.cancelledChequePath || existingHotel.cancelledChequePath,
      idProofPath: body.idProofPath || existingHotel.idProofPath,
      propertyImages: body.propertyImages || existingHotel.propertyImages,
      
      // Mark as completed
      isPaymentDone: true // Assuming payment is done when form is submitted
    };

    // Use transaction for atomic operations
    const result = await prisma.$transaction(async (tx) => {
      // Update the hotel
      const updatedHotel = await tx.hotel.update({
        where: { id: existingHotel.id },
        data: updateData,
      });

      // Delete existing bank accounts and rooms if they exist
      await tx.bankAccount.deleteMany({ where: { hotelId: existingHotel.id } });
      await tx.room.deleteMany({ where: { hotelId: existingHotel.id } });

      // Create new bank accounts if provided
      if (body.bankAccounts && Array.isArray(body.bankAccounts)) {
        await tx.bankAccount.createMany({
          data: body.bankAccounts.map(account => ({
            accountHolderName: account.accountHolderName || '',
            bankName: account.bankName || '',
            accountNumber: account.accountNumber || '',
            ifscCode: account.ifscCode || '',
            accountType: account.accountType || 'Savings',
            branch: account.branch || '',
            hotelId: existingHotel.id
          }))
        });
      }

      // Create new rooms if provided
      if (body.rooms && Array.isArray(body.rooms)) {
        for (const room of body.rooms) {
          const createdRoom = await tx.room.create({
            data: {
              name: room.name || '',
              numOfRooms: Number(room.numOfRooms) || 0,
              maxGuests: Number(room.maxGuests) || 0,
              rateType: room.rateType || null,
              rate: Number(room.rate) || 0,
              extraAdultRate: Number(room.extraAdultRate) || 0,
              roomNumbers: Array.isArray(room.roomNumbers) ? room.roomNumbers : [],
              amenities: room.amenities || null,
              smoking: room.smoking || "non-smoking",
              extraBedPolicy: room.extraBedPolicy || null,
              childPolicy: room.childPolicy || null,
              roomImages: Array.isArray(room.roomImages) ? room.roomImages : [],
              hotelId: existingHotel.id
            }
          });
          // Create RoomUnit entries for each room number
if (Array.isArray(room.roomNumbers)) {
  for (const rn of room.roomNumbers) {
    const [floor, number] = rn.split("-"); // assuming format "floor-roomNumber"
    await tx.roomUnit.create({
      data: {
        roomId: createdRoom.id,
        floor: floor || null,
        roomNumber: number || rn, // fallback to full string if splitting fails
        hotelId: existingHotel.id
      }
    });
  }
}
        }
      }

      return updatedHotel;
    });

    return res.status(200).json({
      message: "Hotel updated successfully",
      hotel: result
    });

  } catch (err) {
    console.error("Hotel update error:", err);
    return res.status(500).json({
      error: "Server error",
      details: err.message
    });
  }
};

// =================== Get Logged In Hotel Info ===================
export const getHotelMe = async (req, res) => {
  try {
    const user = req.user;

    const hotelId = user?.hotelId;

    if (!hotelId) {
      return res.status(401).json({ message: "User not associated with any hotel" });
    }

    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
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

// =================== All Room Units ===================


export const getAllRooms = async (req, res) => {
  try {
    const { hotelId } = req.query;
    
    const roomUnits = await prisma.roomUnit.findMany({
      where: hotelId ? { hotelId } : undefined,
      include: {
        room: {
          select: {
            name: true,
            rateType: true,
            rate: true,
            hotelId: true,
          }
        },
        hotel: {
          select: {
            name: true,
            city: true,
            timeZone: true,
          }
        },
        reservations: true,
      }
    });
    
    res.status(200).json({ success: true, data: roomUnits });
  } catch (error) {
    console.error("Error fetching room units:", error);
    res.status(500).json({ success: false, message: "Failed to fetch room units." });
  }
};

// =================== Room TABLE ===================
export const getRoomDetails = async (req, res) => {
  try {
    const { hotelId } = req.query;


    const room = await prisma.room.findUnique({
      where: {
        hotelId: hotelId
      },
      include: {
        RoomUnit: {
          include: {
            reservations: true
          }
        },
        hotel: {
          select: {
            name: true,
            city: true,
            checkInTime: true,
            checkOutTime: true,
            cancellationPolicy: true,
            noShowPolicy: true
          }
        }
      }
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Room not found'
      });
    }

    res.json({
      success: true,
      data: room
    });

  } catch (error) {
    console.error('Error fetching room details:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// ===================== Get Products ===========================

export const getProductsByHotelId = async (req, res) => {
  try {
    const { hotelId } = req.query;

    if (!hotelId) {
      return res.status(400).json({ error: "Hotel ID is required" });
    }

    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
      select: { products: true }, // Only fetch the products field
    });

    if (!hotel) {
      return res.status(404).json({ error: "Hotel not found" });
    }

    // products is stored as JSON array in hotel record
    return res.status(200).json({ products: hotel.products || [] });
  } catch (error) {
    console.error("Error fetching hotel products:", error);
    return res.status(500).json({ error: "Internal server error" });
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

    // Compare by label instead of value
    const existingLabels = (hotel.products || []).map(p => p.label);

    const upgrades = ALL_MODULES.filter(
      module => !existingLabels.includes(module.label)
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


