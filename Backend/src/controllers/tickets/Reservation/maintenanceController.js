// src/controllers/maintenanceController.js
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { emitRoomStatusUpdate } from '../../utils/websocketEvents.js';

const prisma = new PrismaClient();

export const markRoomForMaintenance = async (req, res) => {
  try {
    const { roomUnitId, checkIn, checkOut, notes } = req.body;
    const hotelId = req.user?.hotelId;
    const io = req.app.get('io');

    if (!hotelId) {
      return res.status(401).json({ success: false, message: "Unauthorized: hotelId missing" });
    }

    // Validate dates
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    
    if (isNaN(startDate.getTime())) {
      return res.status(400).json({ success: false, message: "Invalid start date" });
    }
    
    if (isNaN(endDate.getTime())) {
      return res.status(400).json({ success: false, message: "Invalid end date" });
    }
    
    if (endDate <= startDate) {
      return res.status(400).json({ success: false, message: "End date must be after start date" });
    }

    // Check if room exists and belongs to the hotel - include the room relation
    const roomUnit = await prisma.roomUnit.findFirst({
      where: {
        id: roomUnitId,
        room: {
          hotelId: hotelId
        }
      },
      include: {
        room: true // Include the room relation
      }
    });

    if (!roomUnit) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    if (!roomUnit.room) {
      return res.status(404).json({ success: false, message: "Room type information missing" });
    }

    // Check for conflicting reservations
    const conflictingReservations = await prisma.reservation.findFirst({
      where: {
        roomUnitId,
        OR: [
          {
            checkIn: { lt: endDate },
            checkOut: { gt: startDate }
          }
        ]
      }
    });

    if (conflictingReservations) {
      return res.status(400).json({ 
        success: false, 
        message: "Room has reservations during this period" 
      });
    }

    // Create maintenance record (as a special reservation)
    const maintenanceRecord = await prisma.reservation.create({
      data: {
        checkIn: startDate,
        checkOut: endDate,
        nights: Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)),
        roomType: roomUnit.room.name, // Now safe to access
        rateType: 'MAINTENANCE',
        guests: 0,
        rooms: 1,
        roomNo: roomUnit.roomNumber,
        bookedBy: 'System',
        businessSegment: 'Maintenance',
        billTo: 'Hotel',
        paymentMode: 'None',
        perDayRate: 0,
        perDayTax: 0,
        taxInclusive: true,
        totalAmount: 0,
        guestName: 'Maintenance',
        email: '',
        phone: '',
        gender: 'Male',
        address: '',
        city: '',
        state: '',
        zip: '',
        country: '',
        identity: '',
        idDetail: '',
        specialRequest: notes || '',
        hotelId,
        roomUnitId,
        isMaintenance: true
      }
    });

    // Update room status immediately
    const updatedRoomUnit = await prisma.roomUnit.update({
      where: { id: roomUnitId },
      data: { 
        status: 'MAINTENANCE',
        notes: notes || null
      }
    });

    emitRoomStatusUpdate(io, hotelId, [updatedRoomUnit]);

    return res.status(201).json({ 
      success: true, 
      data: maintenanceRecord,
      message: "Room successfully marked for maintenance"
    });

  } catch (error) {
    console.error("Error marking room for maintenance:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal server error",
      error: error.message // Include error message for debugging
    });
  } finally {
    await prisma.$disconnect();
  }
};

// ... rest of your controller code remains the same ...

export const endMaintenance = async (req, res) => {
  try {
    const { roomUnitId } = req.body;
    const hotelId = req.user?.hotelId;
    const io = req.app.get('io');

    if (!hotelId) {
      return res.status(401).json({ success: false, message: "Unauthorized: hotelId missing" });
    }

    // Check if room exists and belongs to the hotel
    const roomUnit = await prisma.roomUnit.findFirst({
      where: {
        id: roomUnitId,
        room: {
          hotelId: hotelId
        }
      }
    });

    if (!roomUnit) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    // Find active maintenance record
    const now = new Date();
    const maintenanceRecord = await prisma.reservation.findFirst({
      where: {
        roomUnitId,
        isMaintenance: true,
        checkIn: { lte: now },
        checkOut: { gte: now }
      }
    });

    if (maintenanceRecord) {
      // Update the end date to now
      await prisma.reservation.update({
        where: { id: maintenanceRecord.id },
        data: {
          checkOut: now,
          nights: Math.ceil((now - maintenanceRecord.checkIn)) / (1000 * 60 * 60 * 24)
        }
      });
    }

    // Update room status
    await prisma.roomUnit.update({
      where: { id: roomUnitId },
      data: { 
        status: 'AVAILABLE',
        notes: null
      }
    });

    emitRoomStatusUpdate(io, hotelId, [roomUnit]);

    return res.status(200).json({ 
      success: true, 
      message: "Maintenance ended successfully" 
    });

  } catch (error) {
    console.error("Error ending maintenance:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  } finally {
    await prisma.$disconnect();
  }
};