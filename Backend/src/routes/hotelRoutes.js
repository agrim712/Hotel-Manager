import express from "express";
import multer from "multer";

import pkg from '@prisma/client';
const { PrismaClient, Prisma } = pkg;
import { auth, authorizeRoles } from "../middleware/auth.js";
import { createHotel, getAvailableUpgrades, getProductsByHotelId} from "../controllers/hotelContoller.js";
import { getRoomTypes } from "../controllers/Reservation/roomType.js";
import { getRatePlans } from "../controllers/Reservation/getRatePlans.js";
import { getRoomCount } from "../controllers/Reservation/noOfRooms.js";
import { maxGuests } from "../controllers/Reservation/maxGuest.js";
import { getAvailableRoomNumbers, getRoomsWithUnits } from "../controllers/roomController.js";
import { createReservation, updateReservation, deleteReservation } from "../controllers/Reservation/reservationController.js";
import { getRes } from "../controllers/Reservation/getReservation.js";
import { getGuests, getPreviousStays } from "../controllers/Guest/guestController.js";
import { getRoomCounts } from "../controllers/roomCountController.js";
import { getAllRoomUnits } from "../controllers/roomUnit.js";
import { updateRoomUnitStatus } from "../controllers/UpdateStatus.js";
import { downloadHotelPolicy } from '../controllers/hotelContoller.js';
import { getSavedForm, saveForm } from "../controllers/formController.js";
import { getHotelKPI } from "../controllers/Revenue/revenueController.js";
import { getAllRooms } from "../controllers/hotelContoller.js";
import { HOTEL_ROLES } from "../utils/roles.js";
import { getRoomDetails , updateHotel, getPropertyFilesByHotelId, deletePropertyFile} from "../controllers/hotelContoller.js";
import { createSchedule, getSchedules } from "../controllers/tickets/preventiveController.js"
import { createTicket, getTickets, getTicketById, assignTechnician, updateTicketStatus } from "../controllers/tickets/ticketsController.js"
import { getTechnicians, createTechnician } from '../controllers/tickets/techniciansController.js'
import { 
  generateRateTemplate, 
  uploadRates, 
  getRates 
} from "../controllers/rateController.js";
import { staffUser } from "../controllers/staffUser.js";
import { emitRoomCleaningStatusUpdated } from "../utils/websocketEvents.js";
import { createEquipment, getEquipments } from "../controllers/tickets/euiqmentController.js";
import { getEnergyConsumption } from "../controllers/tickets/getEnergyConsumption.js";
import { getQuotations } from "../controllers/sales/quotationController.js";
const prisma = new PrismaClient();
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });


router.post('/onboard', auth, authorizeRoles('HOTELADMIN'), upload.any(),createHotel);
// 👇 no extra "hotel" prefix here
router.get("/:hotelId/property-files", getPropertyFilesByHotelId);
router.delete("/property-files/:id", auth, authorizeRoles('HOTELADMIN'), deletePropertyFile);


router.post(
  "/upload-file",
  auth,
  authorizeRoles("HOTELADMIN"),
  upload.array("files", 10),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: "No files were uploaded." });
      }

      const { hotelId, roomId } = req.body;

      if (!hotelId && !roomId) {
        return res.status(400).json({
          success: false,
          message: "A hotelId or a roomId must be provided to associate the image with a property."
        });
      }

      const savedEntities = await Promise.all(
        req.files.map(async (file) => {
          const timestamp = Date.now();
          const uniqueFilename = `${timestamp}-${file.originalname}`;
          const fileUrl = `${req.protocol}://${req.get("host")}/api/hotel/files/${uniqueFilename}`;
          
          return prisma.$transaction(async (tx) => {
            // Step 1: Create the UploadedFile metadata record.
            // NOTE: We are NOT saving `file.buffer` because the schema has no Bytes field.
            // The actual file content is currently being discarded.
            const newFile = await tx.uploadedFile.create({
              data: {
                filename: uniqueFilename,
                originalName: file.originalname,
                path: `db://${uniqueFilename}`, // This is a logical path
                url: fileUrl,
              },
            });

            // Step 2: Create the PropertyImage record according to your schema.
            // It links directly to the hotel/room and stores the URL.
            const newPropertyImage = await tx.propertyImage.create({
              data: {
                url: fileUrl, // Use the URL generated above
                altText: file.originalname, // Use the original filename as alt text
                hotelId: hotelId ? hotelId : undefined, // hotelId is a String in your schema
                roomId: roomId ? roomId : undefined,   // roomId is a String in your schema
              },
            });
            
            // Return both created records for the response
            return { uploadedFile: newFile, propertyImage: newPropertyImage };
          });
        })
      );

      // The response does not contain binary data, so no sanitation is needed.
      res.status(201).json({ success: true, results: savedEntities });

    } catch (error) {
      console.error("Error during file upload:", error);
      
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') { 
          return res.status(400).json({
            success: false,
            message: `Invalid property ID. The specified hotel or room does not exist.`,
            error: `The value provided for '${error.meta.field_name}' is not valid.`,
          });
        }
      }

      res.status(500).json({
        success: false,
        message: "Failed to upload files due to a server error.",
        error: error.message,
      });
    }
  }
  
);
router.put(
  '/update',
  auth,
  authorizeRoles('HOTELADMIN'),
  upload.any(),
  updateHotel
);

router.get('/status-by-email', async (req, res) => {
  try {
      const { email } = req.query;

      if (!email) {
          return res.status(400).json({ message: 'Email query parameter is required.' });
      }

      const hotel = await prisma.hotel.findUnique({ where: { email: email } });

      if (!hotel) {
          return res.status(404).json({ message: 'No hotel registration found for this email.' });
      }

      // Check payment status and return the appropriate response
      if (hotel.isPaymentDone === false) {
          return res.status(200).json({
              status: 'PENDING_PAYMENT',
              message: 'Payment is pending. Please complete the process.',
              hotelId: hotel.id
          });
      } else {
          // isPaymentDone is true
          return res.status(200).json({
              status: 'PAYMENT_SUCCESSFUL',
              message: 'Payment has been completed.',
              hotelId: hotel.id
          });
      }
      
      // The code below this line was unreachable and has been removed.

  } catch (error) {
      console.error('Error fetching hotel status:', error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Route to serve files from database
router.get("/files/:filename", auth, async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Find the file in the database
    const fileRecord = await prisma.uploadedFile.findFirst({
      where: { filename: filename }
    });

    if (!fileRecord) {
      return res.status(404).json({ error: "File not found" });
    }

    // Determine content type based on file extension
    const ext = filename.split('.').pop().toLowerCase();
    let contentType = 'application/octet-stream';
    
    if (['jpg', 'jpeg'].includes(ext)) contentType = 'image/jpeg';
    else if (ext === 'png') contentType = 'image/png';
    else if (ext === 'pdf') contentType = 'application/pdf';
    else if (ext === 'gif') contentType = 'image/gif';
    else if (ext === 'webp') contentType = 'image/webp';

    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `inline; filename="${fileRecord.filename}"`,
      'Content-Length': fileRecord.data.length,
      'Cache-Control': 'public, max-age=31536000'
    });

    // Send the file data
    res.send(fileRecord.data);
  } catch (error) {
    console.error("Error serving file:", error);
    res.status(500).json({ error: "Failed to serve file" });
  }
});

router.post('/save-form',auth, authorizeRoles('HOTELADMIN'),saveForm);
router.get('/get-saved-form',auth,authorizeRoles('HOTELADMIN'),getSavedForm);

router.get('/me', auth, authorizeRoles('HOTELADMIN','Front Office'), async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { hotel: true },
    });

    if (user && user.hotel) {
      return res.json({ hotel: user.hotel });
    }

    const staffUser = await prisma.staffUser.findFirst({
      where: { id: req.user.id },
      include: { hotel: true },
    });

    if (staffUser && staffUser.hotel) {
      return res.json({ hotel: staffUser.hotel });
    }

    return res.status(404).json({ error: "Hotel not found" });

  } catch (err) {
    console.error("Error fetching hotel profile:", err);
    res.status(500).json({ error: "Failed to fetch hotel profile" });
  }
});


router.get("/products", auth, authorizeRoles(...HOTEL_ROLES),getProductsByHotelId);

router.get('/available-upgrades', auth, authorizeRoles(...HOTEL_ROLES), getAvailableUpgrades);


router.get("/leads", auth, authorizeRoles(...HOTEL_ROLES), async (req, res) => {
  try {
    const leads = await prisma.lead.findMany({
      where: { hotelId: req.user.hotelId },
      orderBy: { createdAt: "desc" },
    });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ message: "Error fetching leads", error: err.message });
  }
});

// Create lead with auto enquiryId
router.post("/leads", auth, authorizeRoles(...HOTEL_ROLES), async (req, res) => {
  try {
    const { name, source, staff, status, contactEmail, contactPhone, notes } = req.body;

    // 🔹 Find last lead for this hotel
    const lastLead = await prisma.lead.findFirst({
      where: { hotelId: req.user.hotelId },
      orderBy: { createdAt: "desc" },
      select: { enquiryId: true },
    });

    // 🔹 Generate next enquiryId
    let nextNumber = 1;
    if (lastLead?.enquiryId) {
      const lastNumber = parseInt(lastLead.enquiryId.replace("ENQ-", ""), 10);
      nextNumber = lastNumber + 1;
    }
    const enquiryId = `ENQ-${String(nextNumber).padStart(4, "0")}`;

    // 🔹 Create lead
    const lead = await prisma.lead.create({
      data: {
        enquiryId,
        name,
        source,
        staff,
        status: status || "Open",
        contactEmail,
        contactPhone,
        notes,
        hotelId: req.user.hotelId, // ✅ from token
      },
    });

    res.status(201).json(lead);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating lead", error: err.message });
  }
});
router.delete(
  "/leads/:id",
  auth,
  authorizeRoles(...HOTEL_ROLES),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Ensure the lead belongs to the same hotel as the user
      const lead = await prisma.lead.findUnique({ where: { id } });
      if (!lead || lead.hotelId !== req.user.hotelId) {
        return res.status(404).json({ message: "Lead not found" });
      }

      await prisma.lead.delete({ where: { id } });

      res.json({ message: "Lead deleted successfully", id });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Error deleting lead", error: err.message });
    }
  }
);
router.post("/quotations", auth, authorizeRoles('HOTELADMIN'), getQuotations);

/* ===================== Rate Routes ==================== */
const rateUpload = multer({ 
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    console.log('Processing file:', file.originalname, 'with mimetype:', file.mimetype);
    
    // All possible Excel mimetypes
    const excelMimetypes = [
      'application/vnd.ms-excel', // .xls
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/octet-stream', // Sometimes used for Excel
      'application/vnd.ms-excel.sheet.macroEnabled.12' // Macro-enabled .xlsm
    ];

    const validExt = /\.(xlsx|xls)$/i.test(path.extname(file.originalname));
    const validMime = excelMimetypes.includes(file.mimetype);

    if (validExt && validMime) {
      console.log('File accepted');
      return cb(null, true);
    } else {
      console.log('File rejected - Invalid type or extension');
      cb(new Error('Only Excel files (.xlsx, .xls) are allowed'));
    }
  },
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1
  }
});

router.get('/rates/template', auth, authorizeRoles('HOTELADMIN'), generateRateTemplate);
router.post('/rates/upload', 
  auth,authorizeRoles('HOTELADMIN'),rateUpload.single('file'),uploadRates);
router.get('/rates/:rateType', auth, authorizeRoles('HOTELADMIN'), getRates);
router.post('/rates/test-upload', auth, authorizeRoles('HOTELADMIN'), (req, res) => {

  
  res.json({ success: true, message: 'Test route reached' });
});


/* ===================== Reservation Routes ==================== */
router.post('/reservation/create', auth, authorizeRoles('HOTELADMIN'), upload.single('photo'), createReservation);
router.put('/reservation/update/:id', auth, authorizeRoles('HOTELADMIN'), updateReservation);
router.delete('/reservation/delete/:id', auth, authorizeRoles('HOTELADMIN'), deleteReservation);
router.get('/getreservations', auth, authorizeRoles('HOTELADMIN','Front Office'), getRes);

/* ======================== Cleaning status ======================== */
// in hotelRoutes.js (or controller)

router.patch("/room-units/:id/cleaning-status", async (req, res) => {
  const { id } = req.params;
  const { cleaningStatus } = req.body;

  if (!cleaningStatus) {
    return res.status(400).json({ error: "cleaningStatus is required" });
  }

  try {
    const updatedRoom = await prisma.roomUnit.update({
      where: { id },
      data: { cleaningStatus },
      include: {
        room: true,
        hotel: { select: { id: true } }, // fetch hotel id for socket room
      },
    });

    const io = req.app.get('io');
    if (io && updatedRoom.hotelId) {
      emitRoomCleaningStatusUpdated(io, updatedRoom.hotelId, updatedRoom);
    }

    return res.json({ success: true, room: updatedRoom });
  } catch (error) {
    console.error("Error updating cleaning status:", error);
    return res.status(500).json({ error: "Failed to update cleaning status" });
  }
});


/* ======================== Room Routes ======================== */
router.get('/room-types', auth, authorizeRoles('HOTELADMIN'), getRoomTypes);
router.get('/rate-plans', auth, authorizeRoles('HOTELADMIN'), getRatePlans);
router.get('/count', auth, authorizeRoles('HOTELADMIN'), getRoomCount);
router.get('/maxguests', auth, authorizeRoles('HOTELADMIN'), maxGuests);
router.get('/available-rooms', auth, authorizeRoles('HOTELADMIN'), getAvailableRoomNumbers);
router.get('/rooms-with-units', auth, authorizeRoles('HOTELADMIN','Front Office'), getRoomsWithUnits);
router.get('/roomunits', auth, authorizeRoles('HOTELADMIN'), getAllRoomUnits);
router.put('/roomunits/:id/status', auth, authorizeRoles('HOTELADMIN'), updateRoomUnitStatus);
router.get('/room-count', auth, authorizeRoles('HOTELADMIN'), getRoomCounts);

/* ======================== Guest Routes ======================== */
router.get('/guests', auth, authorizeRoles('HOTELADMIN'), getGuests);
router.get('/reservations/previous-stays/:email', auth, authorizeRoles('HOTELADMIN'), getPreviousStays);
router.get(
  "/hotel-policy",
  auth,
  authorizeRoles("HOTELADMIN"),
  downloadHotelPolicy
);
/* ======================== Maintenance Ticket ======================== */
router.post('/tickets',auth,authorizeRoles('HOTELADMIN'), createTicket);           // create
router.get('/tickets',auth,authorizeRoles('HOTELADMIN'), getTickets);              // list
router.get('/tickets:id',auth,authorizeRoles('HOTELADMIN'), getTicketById);        // single
router.post('/tickets/:id/assign',auth,authorizeRoles('HOTELADMIN'), assignTechnician); // assign technician { technicianId }
router.post('/tickets/:id/status',auth,authorizeRoles('HOTELADMIN'), updateTicketStatus); // update status { status }
router.get('/',auth,authorizeRoles('HOTELADMIN'), getTechnicians);
router.post('/',auth,authorizeRoles('HOTELADMIN'), createTechnician);

router.post('/euipments', auth,authorizeRoles('HOTELADMIN'), createEquipment); // Create equipment
router.get('/equipments',auth,authorizeRoles('HOTELADMIN'),  getEquipments);  

router.post('/schedules', createSchedule);
router.get('/schedules', getSchedules);

router.get('/energy' ,auth, authorizeRoles('HOTELADMIN'),getEnergyConsumption)
/* ======================== User Routes ======================== */
router.post("/create-role-user",auth,authorizeRoles('HOTELADMIN'),staffUser);
/* ======================== Revenue Routes ======================== */
router.get("/kpi/:hotelId", getHotelKPI);
router.get("/rooms", auth, authorizeRoles('HOTELADMIN'),getRoomDetails);
router.get('/rooms-units',  auth, authorizeRoles('HOTELADMIN'),getAllRooms);


/* ======================== Report Routes ======================== */
router.get('/reports/day-wise-report', auth, authorizeRoles('HOTELADMIN'), async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) return res.status(400).json({ message: 'Missing from/to date in query' });

    const hotelId = req.user.hotelId;
    const reservations = await prisma.reservation.findMany({
      where: { hotelId, checkIn: { gte: new Date(from), lte: new Date(to) } },
      select: { checkIn: true, totalAmount: true },
    });

    const revenueMap = {};
    reservations.forEach(res => {
      const dateStr = res.checkIn.toLocaleDateString('sv-SE');
      revenueMap[dateStr] = (revenueMap[dateStr] || 0) + Number(res.totalAmount || 0);
    });

    res.json({ data: revenueMap });
  } catch (err) {
    console.error('Error fetching day wise report:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/reports/room-wise-report', auth, authorizeRoles('HOTELADMIN'), async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) return res.status(400).json({ message: 'Missing from/to date in query' });

    const hotelId = req.user.hotelId;
    const reservations = await prisma.reservation.findMany({
      where: { hotelId, checkIn: { gte: new Date(from), lte: new Date(to) } },
      select: {
        roomNo: true,
        perDayRate: true,
        perDayTax: true,
        nights: true,
        taxInclusive: true,
      },
    });

    const report = {};
    for (const r of reservations) {
      const rate = r.perDayRate ?? 0;
      const tax = r.perDayTax ?? 0;
      const nights = r.nights ?? 1;
      const total = r.taxInclusive ? rate * nights : (rate + tax) * nights;
      report[r.roomNo] = (report[r.roomNo] || 0) + total;
    }

    res.json({ data: report });
  } catch (err) {
    console.error('Error generating Room Wise Report:', err);
    res.status(500).json({ error: 'Failed to generate Room Wise Report' });
  }
});

export default router;
