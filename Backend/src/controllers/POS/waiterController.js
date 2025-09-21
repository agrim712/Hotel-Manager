import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

// ===================== WAITER CONTROLLERS =====================

export const getWaiters = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { isActive } = req.query;

    const whereClause = { hotelId };
    if (isActive !== undefined) {
      whereClause.isActive = isActive === 'true';
    }

    const waiters = await prisma.waiter.findMany({
      where: whereClause,
      include: {
        tables: {
          include: {
            area: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      data: waiters
    });
  } catch (error) {
    console.error("Error fetching waiters:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch waiters",
      error: error.message
    });
  }
};

export const getWaiter = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { id } = req.params;

    const waiter = await prisma.waiter.findFirst({
      where: { 
        id, 
        hotelId 
      },
      include: {
        tables: {
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
                }
              },
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          }
        }
      }
    });

    if (!waiter) {
      return res.status(404).json({
        success: false,
        message: "Waiter not found"
      });
    }

    res.json({
      success: true,
      data: waiter
    });
  } catch (error) {
    console.error("Error fetching waiter:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch waiter",
      error: error.message
    });
  }
};

export const createWaiter = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { name, email, phone, employeeId } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required"
      });
    }

    // Check if email already exists
    const existingWaiter = await prisma.waiter.findFirst({
      where: { email }
    });

    if (existingWaiter) {
      return res.status(400).json({
        success: false,
        message: "Email already exists"
      });
    }

    const waiter = await prisma.waiter.create({
      data: {
        name,
        email,
        phone: phone || null,
        employeeId: employeeId || null,
        hotelId,
        isActive: true
      }
    });

    res.status(201).json({
      success: true,
      data: waiter,
      message: "Waiter created successfully"
    });
  } catch (error) {
    console.error("Error creating waiter:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create waiter",
      error: error.message
    });
  }
};

export const updateWaiter = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { id } = req.params;
    const { name, email, phone, employeeId, isActive } = req.body;

    // Check if email already exists (excluding current waiter)
    if (email) {
      const existingWaiter = await prisma.waiter.findFirst({
        where: {
          email,
          hotelId,
          NOT: { id }
        }
      });

      if (existingWaiter) {
        return res.status(400).json({
          success: false,
          message: "Email already exists"
        });
      }
    }

    const waiter = await prisma.waiter.update({
      where: { 
        id,
        hotelId 
      },
      data: {
        name,
        email,
        phone,
        employeeId,
        isActive
      },
      include: {
        tables: {
          include: {
            area: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: waiter,
      message: "Waiter updated successfully"
    });
  } catch (error) {
    console.error("Error updating waiter:", error);
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: "Waiter not found"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to update waiter",
        error: error.message
      });
    }
  }
};

export const deleteWaiter = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { id } = req.params;

    // Check if waiter has assigned tables
    const waiterWithTables = await prisma.waiter.findFirst({
      where: { id, hotelId },
      include: {
        tables: true
      }
    });

    if (waiterWithTables && waiterWithTables.tables.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete waiter with assigned tables. Please reassign tables first."
      });
    }

    await prisma.waiter.delete({
      where: { 
        id,
        hotelId 
      }
    });

    res.json({
      success: true,
      message: "Waiter deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting waiter:", error);
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: "Waiter not found"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to delete waiter",
        error: error.message
      });
    }
  }
};

export const assignTablesToWaiter = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { id } = req.params;
    const { tableIds } = req.body;

    if (!tableIds || !Array.isArray(tableIds)) {
      return res.status(400).json({
        success: false,
        message: "Table IDs array is required"
      });
    }

    // Verify waiter exists
    const waiter = await prisma.waiter.findFirst({
      where: { id, hotelId }
    });

    if (!waiter) {
      return res.status(404).json({
        success: false,
        message: "Waiter not found"
      });
    }

    // Verify all tables exist and belong to the hotel
    const tables = await prisma.table.findMany({
      where: {
        id: { in: tableIds },
        hotelId
      }
    });

    if (tables.length !== tableIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more tables not found or don't belong to this hotel"
      });
    }

    // Remove existing assignments for these tables
    await prisma.table.updateMany({
      where: {
        id: { in: tableIds },
        hotelId
      },
      data: {
        waiterId: null
      }
    });

    // Assign tables to waiter
    await prisma.table.updateMany({
      where: {
        id: { in: tableIds },
        hotelId
      },
      data: {
        waiterId: id
      }
    });

    // Fetch updated waiter with tables
    const updatedWaiter = await prisma.waiter.findUnique({
      where: { id },
      include: {
        tables: {
          include: {
            area: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: updatedWaiter,
      message: "Tables assigned to waiter successfully"
    });
  } catch (error) {
    console.error("Error assigning tables to waiter:", error);
    res.status(500).json({
      success: false,
      message: "Failed to assign tables to waiter",
      error: error.message
    });
  }
};

export const removeTablesFromWaiter = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { id } = req.params;
    const { tableIds } = req.body;

    if (!tableIds || !Array.isArray(tableIds)) {
      return res.status(400).json({
        success: false,
        message: "Table IDs array is required"
      });
    }

    // Remove waiter assignment from tables
    await prisma.table.updateMany({
      where: {
        id: { in: tableIds },
        hotelId,
        waiterId: id
      },
      data: {
        waiterId: null
      }
    });

    // Fetch updated waiter with tables
    const updatedWaiter = await prisma.waiter.findUnique({
      where: { id },
      include: {
        tables: {
          include: {
            area: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: updatedWaiter,
      message: "Tables removed from waiter successfully"
    });
  } catch (error) {
    console.error("Error removing tables from waiter:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove tables from waiter",
      error: error.message
    });
  }
};

export const getWaiterTables = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { id } = req.params;

    const waiter = await prisma.waiter.findFirst({
      where: { id, hotelId },
      include: {
        tables: {
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
                }
              },
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          }
        }
      }
    });

    if (!waiter) {
      return res.status(404).json({
        success: false,
        message: "Waiter not found"
      });
    }

    res.json({
      success: true,
      data: waiter.tables
    });
  } catch (error) {
    console.error("Error fetching waiter tables:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch waiter tables",
      error: error.message
    });
  }
};
