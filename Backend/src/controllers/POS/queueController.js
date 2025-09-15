import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();
// ===================== QUEUE CONTROLLERS =====================

export const getQueueEntries = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { status } = req.query;

    const whereClause = { hotelId };
    if (status) whereClause.status = status;

    const queueEntries = await prisma.queueEntry.findMany({
      where: whereClause,
      orderBy: { createdAt: 'asc' }
    });

    res.json({
      success: true,
      data: queueEntries
    });
  } catch (error) {
    console.error("Error fetching queue entries:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch queue entries",
      error: error.message
    });
  }
};

export const getQueueEntry = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { id } = req.params;

    const queueEntry = await prisma.queueEntry.findFirst({
      where: { 
        id,
        hotelId 
      }
    });

    if (!queueEntry) {
      return res.status(404).json({
        success: false,
        message: "Queue entry not found"
      });
    }

    res.json({
      success: true,
      data: queueEntry
    });
  } catch (error) {
    console.error("Error fetching queue entry:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch queue entry",
      error: error.message
    });
  }
};

export const addToQueue = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { customerName, phone, partySize, notes } = req.body;

    if (!customerName || !partySize) {
      return res.status(400).json({
        success: false,
        message: "Customer name and party size are required"
      });
    }

    // Calculate estimated wait time based on current queue
    const waitingEntries = await prisma.queueEntry.count({
      where: {
        hotelId,
        status: 'WAITING'
      }
    });

    // Assume average 15 minutes per party
    const estimatedWait = waitingEntries * 15;

    const queueEntry = await prisma.queueEntry.create({
      data: {
        customerName,
        phone: phone || null,
        partySize: parseInt(partySize),
        estimatedWait,
        notes: notes || null,
        hotelId
      }
    });

    res.status(201).json({
      success: true,
      data: queueEntry,
      message: "Added to queue successfully"
    });
  } catch (error) {
    console.error("Error adding to queue:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add to queue",
      error: error.message
    });
  }
};

export const updateQueueEntry = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { id } = req.params;
    const { customerName, phone, partySize, notes } = req.body;

    const queueEntry = await prisma.queueEntry.update({
      where: { 
        id,
        hotelId 
      },
      data: {
        customerName: customerName || undefined,
        phone: phone !== undefined ? phone : undefined,
        partySize: partySize ? parseInt(partySize) : undefined,
        notes: notes !== undefined ? notes : undefined
      }
    });

    res.json({
      success: true,
      data: queueEntry,
      message: "Queue entry updated successfully"
    });
  } catch (error) {
    console.error("Error updating queue entry:", error);
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: "Queue entry not found"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to update queue entry",
        error: error.message
      });
    }
  }
};

export const updateQueueStatus = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required"
      });
    }

    const validStatuses = ['WAITING', 'SEATED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be one of: WAITING, SEATED, CANCELLED"
      });
    }

    const queueEntry = await prisma.queueEntry.update({
      where: { 
        id,
        hotelId 
      },
      data: { status }
    });

    res.json({
      success: true,
      data: queueEntry,
      message: "Queue status updated successfully"
    });
  } catch (error) {
    console.error("Error updating queue status:", error);
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: "Queue entry not found"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to update queue status",
        error: error.message
      });
    }
  }
};

export const removeFromQueue = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { id } = req.params;

    await prisma.queueEntry.delete({
      where: { 
        id,
        hotelId 
      }
    });

    res.json({
      success: true,
      message: "Removed from queue successfully"
    });
  } catch (error) {
    console.error("Error removing from queue:", error);
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: "Queue entry not found"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to remove from queue",
        error: error.message
      });
    }
  }
};

export const getEstimatedWaitTimes = async (req, res) => {
  try {
    const { hotelId } = req.user;

    // Get current queue statistics
    const waitingCount = await prisma.queueEntry.count({
      where: {
        hotelId,
        status: 'WAITING'
      }
    });

    // Get average table turnover time (assuming 60 minutes per table)
    const occupiedTables = await prisma.table.count({
      where: {
        hotelId,
        status: 'OCCUPIED'
      }
    });

    const totalTables = await prisma.table.count({
      where: { hotelId }
    });

    const availableTables = totalTables - occupiedTables;

    // Calculate estimated wait times
    const baseWaitTime = 15; // 15 minutes base wait
    const queueWaitTime = waitingCount * baseWaitTime;
    const tableWaitTime = occupiedTables > 0 ? (occupiedTables / totalTables) * 60 : 0;

    const estimatedWait = Math.max(queueWaitTime, tableWaitTime);

    const waitTimes = {
      currentQueueLength: waitingCount,
      occupiedTables,
      availableTables,
      totalTables,
      estimatedWaitMinutes: Math.round(estimatedWait),
      estimatedWaitFormatted: `${Math.round(estimatedWait)} minutes`
    };

    res.json({
      success: true,
      data: waitTimes
    });
  } catch (error) {
    console.error("Error calculating wait times:", error);
    res.status(500).json({
      success: false,
      message: "Failed to calculate wait times",
      error: error.message
    });
  }
};
