import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import path from 'path';
import fs from 'fs';
import PDFDocument from "pdfkit";
import jwt from 'jsonwebtoken';



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
  export const createHotel = async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized: User not found." });
      }
  
      // 1. Parse JSON fields if needed
      const parsedBody = { ...req.body };
      const fieldsToParse = ['bankAccounts', 'rooms', 'products', 'amenities', 'paymentModes', 'otas'];
      fieldsToParse.forEach(field => {
        if (req.body[field] && typeof req.body[field] === 'string') {
          try {
            parsedBody[field] = JSON.parse(req.body[field]);
          } catch (e) {
            console.error(`Failed to parse JSON for field ${field}:`, e);
            parsedBody[field] = [];
          }
        }
      });
  
      const hotelResult = await prisma.$transaction(async (tx) => {
        // Step A: Create main hotel
        const hotel = await tx.hotel.create({
          data: {
            name: parsedBody.name,
            brandAffiliation: parsedBody.brandAffiliation,
            category: parsedBody.category,
            registeredAddress: parsedBody.registeredAddress,
            operationalAddress: parsedBody.operationalAddress,
            country: parsedBody.country,
            state: parsedBody.state,
            city: parsedBody.city,
            pinCode: parsedBody.pinCode,
            timeZone: parsedBody.timeZone,
            preferredLanguage: parsedBody.preferredLanguage,
            contactPerson: parsedBody.contactPerson,
            phoneCode: parsedBody.phoneCode,
            phoneNumber: parsedBody.phoneNumber,
            whatsappNumber: parsedBody.whatsappNumber,
            email: parsedBody.email,
            website: parsedBody.website,
            googleMapsLink: parsedBody.googleMapsLink,
            totalRooms: parsedBody.totalRooms ? Number(parsedBody.totalRooms) : 0,
            propertyType: parsedBody.propertyType,
            currency: parsedBody.currency,
            panNumber: parsedBody.panNumber,
            gstin: parsedBody.gstin,
            tourismRegistration: parsedBody.tourismRegistration,
            companyRegistration: parsedBody.companyRegistration,
            checkInTime: parsedBody.checkInTime,
            checkOutTime: parsedBody.checkOutTime,
            earlyCheckInPolicy: parsedBody.earlyCheckInPolicy,
            lateCheckOutPolicy: parsedBody.lateCheckOutPolicy,
            cancellationPolicy: parsedBody.cancellationPolicy,
            noShowPolicy: parsedBody.noShowPolicy,
            invoiceFormat: parsedBody.invoiceFormat,
            paymentModes: parsedBody.paymentModes,
            otas: parsedBody.otas,
            channelManager: parsedBody.channelManager,
            bookingEngine: parsedBody.bookingEngine,
            products: Array.isArray(parsedBody.products) ? parsedBody.products : [],
            isPaymentDone: false,
          },
        });
  
        // Step B: Rooms
        const createdRooms = [];
        if (Array.isArray(parsedBody.rooms)) {
          for (const room of parsedBody.rooms) {
            const createdRoom = await tx.room.create({
              data: {
                name: room.name,
                numOfRooms: Number(room.numOfRooms) || 0,
                maxGuests: Number(room.maxGuests) || 0,
                rateType: room.rateType || "standard",
                rate: Number(room.rate) || 0,
                extraAdultRate: room.extraAdultRate ? Number(room.extraAdultRate) : null,
                roomNumbers: Array.isArray(room.roomNumbers) ? room.roomNumbers : [],
                amenities: room.amenities || [],
                smoking: room.smoking || "non-smoking",
                extraBedPolicy: room.extraBedPolicy || null,
                childPolicy: room.childPolicy || null,
                petPolicy: room.petPolicy || "Not Allowed",
                hotelId: hotel.id,
              },
            });
            createdRooms.push(createdRoom);
          }
        }
  
        // Step C: Files
        if (req.files) {
          const allFiles = Object.values(req.files).flat();
          const filePaths = {};
  
          for (const file of allFiles) {
            const timestamp = Date.now();
            const uniqueFilename = `${timestamp}-${file.originalname}`;
            const fileUrl = `${req.protocol}://${req.get("host")}/api/hotel/files/${uniqueFilename}`;
  
            if (req.files) {
              for (const [field, files] of Object.entries(req.files)) {
                const labelPrefix = fileNameMap[field] || field;
            
                for (const file of files) {
                  const timestamp = Date.now();
                  const extension = file.originalname.split(".").pop();
                  const uniqueFilename = `${labelPrefix}-${timestamp}.${extension}`;
                  const fileUrl = `${req.protocol}://${req.get("host")}/api/hotel/files/${uniqueFilename}`;
                  const fileType = file.mimetype || extension;
                
                  await tx.propertyFiles.create({
                    data: {
                      altText: file.originalname, // keep original for reference
                      hotelId: hotel.id,
                      fileType,
                      url:fileUrl
                    },
                  });
                }
              }
            }
          }
  
          // Update hotel doc paths if needed
          if (Object.keys(filePaths).length > 0) {
            await tx.hotel.update({
              where: { id: hotel.id },
              data: filePaths,
            });
          }
        }
  
        // Step D: Bank Accounts
        if (Array.isArray(parsedBody.bankAccounts)) {
          await tx.bankAccount.createMany({
            data: parsedBody.bankAccounts.map((acc) => ({
              accountHolderName: acc.accountHolderName,
              bankName: acc.bankName,
              accountNumber: acc.accountNumber,
              ifscCode: acc.ifscCode,
              accountType: acc.accountType,
              branch: acc.branch,
              isPrimary: acc.isPrimary,
              hotelId: hotel.id,
            })),
          });
        }
  
        return tx.hotel.findUnique({
          where: { id: hotel.id },
          include: { propertyFiles: true, rooms: true, bankAccounts: true },
        });
      });
  
      // Link hotel to user
      await prisma.user.update({
        where: { id: userId },
        data: { hotelId: hotelResult.id },
      });
  
      const newToken = jwt.sign(
        { userId, role: req.user.role, hotelId: hotelResult.id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );
  
      return res.status(201).json({
        message: "Hotel onboarded successfully!",
        hotel: hotelResult,
        token: newToken,
      });
    } catch (err) {
      console.error("Hotel onboard error:", err);
      return res.status(500).json({ error: "Server error", details: err.message });
    }
  };
  
  // controllers/hotelController.js
export const getPropertyFilesByHotelId = async (req, res) => {
  try {
    const { hotelId } = req.params;

    if (!hotelId) {
      return res.status(400).json({
        success: false,
        message: "hotelId is required.",
      });
    }
  
    const propertyFiles = await prisma.propertyFiles.findMany({
      where: { hotelId },
      include: {
      },
      orderBy: { createdAt: "desc" },
    });

    // Enrich each record with uploaded file details (if relation exists) and a derived prefix
    const withFiles = await Promise.all(
      propertyFiles.map(async (pf) => {
        // Try to load uploadedFile if not already included
        let uploadedFile = null;
        try {
          uploadedFile = await prisma.uploadedFile.findUnique({ where: { id: pf.uploadedFileId } });
        } catch {}
        const filename = uploadedFile?.filename || null;
        const derivedPrefix = filename && filename.includes("-") ? filename.split("-")[0] : null;
        return {
          id: pf.id,
          hotelId: pf.hotelId,
          fileType: pf.fileType,
          createdAt: pf.createdAt,
          uploadedFileId: pf.uploadedFileId,
          filename: uploadedFile?.filename || null,
          originalName: uploadedFile?.originalName || null,
          url: uploadedFile?.url || null,
          path: uploadedFile?.path || null,
          derivedPrefix,
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: withFiles.length,
      data: withFiles,
    });
  } catch (error) {
    console.error("Error fetching property files:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch property files",
      error: error.message,
    });
  }
};
  export const updateHotel = async (req, res) => {
    try {
      const userId = req.user?.id;
      const hotelId = req.user?.hotelId;
  
      if (!userId || !hotelId) {
        return res.status(401).json({ error: "Unauthorized: User or Hotel not found." });
      }
  
      // 1. Parse JSON fields if needed
      const parsedBody = { ...req.body };
      const fieldsToParse = ["bankAccounts", "rooms", "products", "amenities", "paymentModes", "otas"];
      fieldsToParse.forEach((field) => {
        if (req.body[field] && typeof req.body[field] === "string") {
          try {
            parsedBody[field] = JSON.parse(req.body[field]);
          } catch (e) {
            console.error(`Failed to parse JSON for field ${field}:`, e);
            parsedBody[field] = [];
          }
        }
      });
  
      const updatedHotel = await prisma.$transaction(async (tx) => {
        // Step A: Update hotel fields
        const hotel = await tx.hotel.update({
          where: { id: hotelId },
          data: {
            name: parsedBody.name,
            brandAffiliation: parsedBody.brandAffiliation,
            category: parsedBody.category,
            registeredAddress: parsedBody.registeredAddress,
            operationalAddress: parsedBody.operationalAddress,
            country: parsedBody.country,
            state: parsedBody.state,
            city: parsedBody.city,
            pinCode: parsedBody.pinCode,
            timeZone: parsedBody.timeZone,
            preferredLanguage: parsedBody.preferredLanguage,
            contactPerson: parsedBody.contactPerson,
            phoneCode: parsedBody.phoneCode,
            phoneNumber: parsedBody.phoneNumber,
            whatsappNumber: parsedBody.whatsappNumber,
            email: parsedBody.email,
            website: parsedBody.website,
            googleMapsLink: parsedBody.googleMapsLink,
            totalRooms: parsedBody.totalRooms ? Number(parsedBody.totalRooms) : 0,
            propertyType: parsedBody.propertyType,
            currency: parsedBody.currency,
            panNumber: parsedBody.panNumber,
            gstin: parsedBody.gstin,
            tourismRegistration: parsedBody.tourismRegistration,
            companyRegistration: parsedBody.companyRegistration,
            checkInTime: parsedBody.checkInTime,
            checkOutTime: parsedBody.checkOutTime,
            earlyCheckInPolicy: parsedBody.earlyCheckInPolicy,
            lateCheckOutPolicy: parsedBody.lateCheckOutPolicy,
            cancellationPolicy: parsedBody.cancellationPolicy,
            noShowPolicy: parsedBody.noShowPolicy,
            invoiceFormat: parsedBody.invoiceFormat,
            paymentModes: parsedBody.paymentModes,
            otas: parsedBody.otas,
            channelManager: parsedBody.channelManager,
            bookingEngine: parsedBody.bookingEngine,
            products: Array.isArray(parsedBody.products) ? parsedBody.products : [],
          },
        });
  
        // Step B: Replace rooms
        let createdRooms = [];
        if (Array.isArray(parsedBody.rooms)) {
          await tx.room.deleteMany({ where: { hotelId: hotel.id } });
  
          for (const room of parsedBody.rooms) {
            const createdRoom = await tx.room.create({
              data: {
                name: room.name,
                numOfRooms: Number(room.numOfRooms) || 0,
                maxGuests: Number(room.maxGuests) || 0,
                rateType: room.rateType || "standard",
                rate: Number(room.rate) || 0,
                extraAdultRate: room.extraAdultRate ? Number(room.extraAdultRate) : null,
                roomNumbers: Array.isArray(room.roomNumbers) ? room.roomNumbers : [],
                amenities: room.amenities || [],
                smoking: room.smoking || "non-smoking",
                extraBedPolicy: room.extraBedPolicy || null,
                childPolicy: room.childPolicy || null,
                petPolicy: room.petPolicy || "Not Allowed",
                hotelId: hotel.id,
              },
            });
            createdRooms.push(createdRoom);
          }
        }
  
        if (req.files) {
          const fileNameMap = {}; // customize if needed
          const filePaths = {};

          // Case 1: req.files is an array (upload.array)
          const allFiles = Array.isArray(req.files)
            ? req.files
            // Case 2: req.files is an object (upload.fields)
            : Object.values(req.files).flat();

          for (const file of allFiles) {
            const field = file.fieldname;
            const labelPrefix = fileNameMap[field] || field;

            const timestamp = Date.now();
            const extension = file.originalname.split(".").pop();
            const uniqueFilename = `${labelPrefix}-${timestamp}.${extension}`;
            const fileUrl = `${req.protocol}://${req.get("host")}/api/hotel/files/${uniqueFilename}`;
            const fileType = file.mimetype || extension;
            // Step 1: Save in UploadedFile
          

            // Step 2: Link via PropertyFiles
            await tx.propertyFiles.create({
              data: {
                altText: file.originalname,
                hotelId: hotel.id,
                fileType,
                url: fileUrl
              },
            });
           
          }

          // Update hotel doc paths if needed
          if (Object.keys(filePaths).length > 0) {
            await tx.hotel.update({
              where: { id: hotel.id },
              data: filePaths,
            });
          }
        }

  
        // Step D: Replace bank accounts
        if (Array.isArray(parsedBody.bankAccounts)) {
          await tx.bankAccount.deleteMany({ where: { hotelId: hotel.id } });
          await tx.bankAccount.createMany({
            data: parsedBody.bankAccounts.map((acc) => ({
              accountHolderName: acc.accountHolderName,
              bankName: acc.bankName,
              accountNumber: acc.accountNumber,
              ifscCode: acc.ifscCode,
              accountType: acc.accountType,
              branch: acc.branch,
              isPrimary: acc.isPrimary,
              hotelId: hotel.id,
            })),
          });
        }
  
        return tx.hotel.findUnique({
          where: { id: hotel.id },
          include: { propertyFiles: true, rooms: true, bankAccounts: true },
        });
      });
  
      return res.status(200).json({
        message: "Hotel details updated successfully!",
        hotel: updatedHotel,
      });
    } catch (err) {
      console.error("Hotel update error:", err);
      return res.status(500).json({ error: "Server error", details: err.message });
    }
  };
  
  
  
export const getAllRooms = async (req, res) => {
    try {
        const hotelId = req.user?.hotelId;
        if (!hotelId) {
            return res.status(401).json({ success: false, message: "Unauthorized: No hotel associated with user." });
        }

        const roomUnits = await prisma.roomUnit.findMany({
            where: { hotelId },
            include: {
                room: {
                    select: { name: true, rateType: true, rate: true }
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

export const getRoomDetails = async (req, res) => {
    try {
        // CORRECTED: Switched from query to params to get a specific room ID.
        const { roomId } = req.params;
        const hotelId = req.user?.hotelId;

        if (!hotelId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }
        if (!roomId) {
            return res.status(400).json({ success: false, error: 'Room ID is required' });
        }

        const room = await prisma.room.findFirst({
            where: {
                id: roomId,
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
            return res.status(404).json({ success: false, error: 'Room not found or access denied' });
        }

        res.json({ success: true, data: room });

    } catch (error) {
        console.error('Error fetching room details:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

// =================== Delete Property File ===================
export const deletePropertyFile = async (req, res) => {
  try {
    const userHotelId = req.user?.hotelId;
    const { id } = req.params; // propertyFiles id (route param is string)
    const fileId = parseInt(id, 10);

    if (!userHotelId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (!id || Number.isNaN(fileId)) {
      return res.status(400).json({ success: false, message: "File id is required" });
    }

    const propertyFile = await prisma.propertyFiles.findUnique({ where: { id: fileId } });
    if (!propertyFile) {
      return res.status(404).json({ success: false, message: "Property file not found" });
    }
    if (propertyFile.hotelId !== userHotelId) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    // Delete both the linking record and the uploaded file metadata
    await prisma.$transaction(async (tx) => {
      // Remove the link first
      await tx.propertyFiles.delete({ where: { id: fileId } });
      // Then remove the uploaded file if present
      if (propertyFile.uploadedFileId) {
        await tx.uploadedFile.delete({ where: { id: Number(propertyFile.uploadedFileId) } });
      }
    });

    return res.json({ success: true, id: fileId });
  } catch (error) {
    console.error("Error deleting property file:", error);
    return res.status(500).json({ success: false, message: "Failed to delete file" });
  }
};

// ===================== Get Products ===========================
export const getProductsByHotelId = async (req, res) => {
    try {
        // CORRECTED: Use the authenticated user's hotelId.
        const hotelId = req.user?.hotelId;
        if (!hotelId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const hotel = await prisma.hotel.findUnique({
            where: { id: hotelId },
            select: { products: true },
        });

        if (!hotel) {
            return res.status(404).json({ error: "Hotel not found" });
        }

        res.status(200).json({ products: hotel.products || [] });
    } catch (error) {
        console.error("Error fetching hotel products:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// =================== Get Available Upgrades ===================
// NOTE: This logic is correct. No changes needed.
export const getAvailableUpgrades = async (req, res) => {
    try {
        const hotelId = req.user.hotelId;
        if (!hotelId) {
            return res.status(400).json({ message: "User is not associated with a hotel." });
        }
        const hotel = await prisma.hotel.findUnique({
            where: { id: hotelId },
            select: { products: true },
        });
        if (!hotel) {
            return res.status(404).json({ message: "Hotel not found" });
        }

        const existingProductValues = (hotel.products || []).map(p => p.value);
        const upgrades = ALL_MODULES.filter(
            module => !existingProductValues.includes(module.value)
        );
        
        return res.json({ upgrades });
    } catch (err) {
        console.error("Error fetching upgrades:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// =================== Download Policy ===================
// NOTE: This logic is correct. No changes needed.
export const downloadHotelPolicy = async (req, res) => {
    try {
        const hotelId = req.user.hotelId;
        if (!hotelId) {
             return res.status(401).json({ message: "Hotel not found for this user." });
        }
        const hotel = await prisma.hotel.findUnique({
            where: { id: hotelId },
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

        // --- PDF Content ---
        doc.fontSize(18).text("Hotel Policy Document", { align: "center" });
        doc.moveDown();
        doc.fontSize(12).text(`Hotel Name: ${hotel.name}`);
        doc.text(`Location: ${hotel.city || ""}, ${hotel.state || ""}, ${hotel.country || ""}`);
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

        
        doc.fontSize(10).text(policyContent, { align: "left", lineGap: 2 });
        doc.end();

    } catch (error) {
        console.error("Error generating hotel policy PDF:", error);
        res.status(500).json({ success: false, message: "Failed to generate hotel policy PDF" });
    }
};
