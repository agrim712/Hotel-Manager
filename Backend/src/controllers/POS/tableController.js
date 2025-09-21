import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

// ===================== TABLE CONTROLLERS =====================

export const getTables = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { areaId, status } = req.query;

    const whereClause = { hotelId };
    if (areaId) whereClause.areaId = areaId;
    if (status) whereClause.status = status;

    const tables = await prisma.table.findMany({
      where: whereClause,
      include: {
        area: true,
        waiter: true,
        orders: {
          where: {
            status: {
              in: ['PENDING', 'CONFIRMED', 'PREPARING']
            }
          },
          include: {
            customer: {
              select: { name: true, phone: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { number: 'asc' }
    });

    res.json({
      success: true,
      data: tables
    });
  } catch (error) {
    console.error("Error fetching tables:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tables",
      error: error.message
    });
  }
};

export const getTable = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { id } = req.params;

    const table = await prisma.table.findFirst({
      where: { 
        id,
        hotelId 
      },
      include: {
        area: true,
        orders: {
          where: {
            status: {
              in: ['PENDING', 'CONFIRMED', 'PREPARING']
            }
          },
          include: {
            customer: {
              select: { name: true, phone: true }
            },
            orderItems: {
              include: {
                item: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!table) {
      return res.status(404).json({
        success: false,
        message: "Table not found"
      });
    }

    res.json({
      success: true,
      data: table
    });
  } catch (error) {
    console.error("Error fetching table:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch table",
      error: error.message
    });
  }
};

export const createTable = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { number, capacity, areaId, waiterId } = req.body;

    if (!number || !capacity) {
      return res.status(400).json({
        success: false,
        message: "Table number and capacity are required"
      });
    }

    // Check if table number already exists in the area
    const existingTable = await prisma.table.findFirst({
      where: {
        number,
        areaId: areaId || null,
        hotelId
      }
    });

    if (existingTable) {
      return res.status(400).json({
        success: false,
        message: "Table number already exists in this area"
      });
    }

    // Verify waiter exists if provided
    if (waiterId) {
      const waiter = await prisma.waiter.findFirst({
        where: {
          id: waiterId,
          hotelId,
          isActive: true
        }
      });

      if (!waiter) {
        return res.status(400).json({
          success: false,
          message: "Waiter not found or inactive"
        });
      }
    }

    const table = await prisma.table.create({
      data: {
        number,
        capacity: parseInt(capacity),
        areaId: areaId || null,
        waiterId: waiterId || null,
        hotelId,
        status: "AVAILABLE"
      },
      include: {
        area: true,
        waiter: true
      }
    });

    res.status(201).json({
      success: true,
      data: table,
      message: "Table created successfully"
    });
  } catch (error) {
    console.error("Error creating table:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create table",
      error: error.message
    });
  }
};

export const updateTable = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { id } = req.params;
    const { number, capacity, areaId, waiterId } = req.body;

    // Check if table number already exists in the area (excluding current table)
    if (number) {
      const existingTable = await prisma.table.findFirst({
        where: {
          number,
          areaId: areaId || null,
          hotelId,
          NOT: { id }
        }
      });

      if (existingTable) {
        return res.status(400).json({
          success: false,
          message: "Table number already exists in this area"
        });
      }
    }

    // Verify waiter exists if provided
    if (waiterId) {
      const waiter = await prisma.waiter.findFirst({
        where: {
          id: waiterId,
          hotelId,
          isActive: true
        }
      });

      if (!waiter) {
        return res.status(400).json({
          success: false,
          message: "Waiter not found or inactive"
        });
      }
    }

    const table = await prisma.table.update({
      where: { 
        id,
        hotelId 
      },
      data: {
        number,
        capacity: capacity ? parseInt(capacity) : undefined,
        areaId: areaId !== undefined ? areaId : undefined,
        waiterId: waiterId !== undefined ? waiterId : undefined
      },
      include: {
        area: true,
        waiter: true
      }
    });

    res.json({
      success: true,
      data: table,
      message: "Table updated successfully"
    });
  } catch (error) {
    console.error("Error updating table:", error);
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: "Table not found"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to update table",
        error: error.message
      });
    }
  }
};

export const deleteTable = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { id } = req.params;

    // Check if table has active orders
    const activeOrders = await prisma.order.findMany({
      where: {
        tableId: id,
        status: {
          in: ['PENDING', 'CONFIRMED', 'PREPARING']
        }
      }
    });

    if (activeOrders.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete table with active orders"
      });
    }

    await prisma.table.delete({
      where: { 
        id,
        hotelId 
      }
    });

    res.json({
      success: true,
      message: "Table deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting table:", error);
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: "Table not found"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to delete table",
        error: error.message
      });
    }
  }
};

export const updateTableStatus = async (req, res) => {
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

    const validStatuses = ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be one of: AVAILABLE, OCCUPIED, RESERVED, MAINTENANCE"
      });
    }

    const table = await prisma.table.update({
      where: { 
        id,
        hotelId 
      },
      data: { status },
      include: {
        area: true
      }
    });

    res.json({
      success: true,
      data: table,
      message: "Table status updated successfully"
    });
  } catch (error) {
    console.error("Error updating table status:", error);
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: "Table not found"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to update table status",
        error: error.message
      });
    }
  }
};

export const getAvailableTables = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { capacity, areaId } = req.query;

    const whereClause = { 
      hotelId,
      status: 'AVAILABLE'
    };
    
    if (capacity) {
      whereClause.capacity = {
        gte: parseInt(capacity)
      };
    }
    
    if (areaId) {
      whereClause.areaId = areaId;
    }

    const tables = await prisma.table.findMany({
      where: whereClause,
      include: {
        area: true
      },
      orderBy: { number: 'asc' }
    });

    res.json({
      success: true,
      data: tables
    });
  } catch (error) {
    console.error("Error fetching available tables:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch available tables",
      error: error.message
    });
  }
};

// ===================== AREA CONTROLLERS =====================

export const getAreas = async (req, res) => {
  try {
    const { hotelId } = req.user;

    const areas = await prisma.area.findMany({
      where: { hotelId },
      include: {
        tables: {
          include: {
            orders: {
              where: {
                status: {
                  in: ['PENDING', 'CONFIRMED', 'PREPARING']
                }
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    // Add table counts and availability status
    const areasWithStats = areas.map(area => ({
      ...area,
      totalTables: area.tables.length,
      availableTables: area.tables.filter(table => table.status === 'AVAILABLE').length,
      occupiedTables: area.tables.filter(table => table.status === 'OCCUPIED').length,
      reservedTables: area.tables.filter(table => table.status === 'RESERVED').length
    }));

    res.json({
      success: true,
      data: areasWithStats
    });
  } catch (error) {
    console.error("Error fetching areas:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch areas",
      error: error.message
    });
  }
};

export const createArea = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Area name is required"
      });
    }

    // Check if area name already exists
    const existingArea = await prisma.area.findFirst({
      where: { name, hotelId }
    });

    if (existingArea) {
      return res.status(400).json({
        success: false,
        message: "Area name already exists"
      });
    }

    const area = await prisma.area.create({
      data: {
        name,
        hotelId
      }
    });

    res.status(201).json({
      success: true,
      data: area,
      message: "Area created successfully"
    });
  } catch (error) {
    console.error("Error creating area:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create area",
      error: error.message
    });
  }
};

export const updateArea = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Area name is required"
      });
    }

    // Check if area name already exists (excluding current area)
    const existingArea = await prisma.area.findFirst({
      where: {
        name,
        hotelId,
        NOT: { id }
      }
    });

    if (existingArea) {
      return res.status(400).json({
        success: false,
        message: "Area name already exists"
      });
    }

    const area = await prisma.area.update({
      where: { 
        id,
        hotelId 
      },
      data: { name }
    });

    res.json({
      success: true,
      data: area,
      message: "Area updated successfully"
    });
  } catch (error) {
    console.error("Error updating area:", error);
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: "Area not found"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to update area",
        error: error.message
      });
    }
  }
};

export const deleteArea = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { id } = req.params;

    // Check if area has tables
    const tables = await prisma.table.findMany({
      where: { areaId: id }
    });

    if (tables.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete area with existing tables. Please delete all tables first."
      });
    }

    await prisma.area.delete({
      where: { 
        id,
        hotelId 
      }
    });

    res.json({
      success: true,
      message: "Area deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting area:", error);
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: "Area not found"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to delete area",
        error: error.message
      });
    }
  }
};
