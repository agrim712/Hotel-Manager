import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

// ===================== KITCHEN ORDER CONTROLLERS =====================

export const getKitchenOrders = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { status, priority, displayId } = req.query;

    const whereClause = { 
      order: { hotelId }
    };
    
    if (status) whereClause.status = status;
    if (priority) whereClause.priority = priority;

    const kitchenOrders = await prisma.kitchenOrder.findMany({
      where: whereClause,
      include: {
        order: {
          include: {
            customer: {
              select: { name: true, phone: true }
            },
            table: {
              select: { number: true, area: { select: { name: true } } }
            },
            orderItems: {
              include: {
                item: {
                  select: { name: true, prepTime: true }
                },
                modifiers: {
                  include: {
                    modifier: {
                      select: { name: true }
                    }
                  }
                }
              }
            }
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' }
      ]
    });

    res.json({
      success: true,
      data: kitchenOrders
    });
  } catch (error) {
    console.error("Error fetching kitchen orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch kitchen orders",
      error: error.message
    });
  }
};

export const getKitchenOrder = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { id } = req.params;

    const kitchenOrder = await prisma.kitchenOrder.findFirst({
      where: { 
        id,
        order: { hotelId }
      },
      include: {
        order: {
          include: {
            customer: true,
            table: {
              include: { area: true }
            },
            orderItems: {
              include: {
                item: {
                  include: {
                    images: true,
                    category: true
                  }
                },
                modifiers: {
                  include: {
                    modifier: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!kitchenOrder) {
      return res.status(404).json({
        success: false,
        message: "Kitchen order not found"
      });
    }

    res.json({
      success: true,
      data: kitchenOrder
    });
  } catch (error) {
    console.error("Error fetching kitchen order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch kitchen order",
      error: error.message
    });
  }
};

export const updateKitchenOrderStatus = async (req, res) => {
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

    const validStatuses = ['PENDING', 'PREPARING', 'READY', 'SERVED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be one of: PENDING, PREPARING, READY, SERVED"
      });
    }

    const kitchenOrder = await prisma.kitchenOrder.update({
      where: { 
        id,
        order: { hotelId }
      },
      data: { status },
      include: {
        order: {
          include: {
            customer: true,
            table: true
          }
        }
      }
    });

    // Update main order status based on kitchen order status
    if (status === 'PREPARING') {
      await prisma.order.update({
        where: { id: kitchenOrder.orderId },
        data: { status: 'PREPARING' }
      });
    } else if (status === 'READY') {
      await prisma.order.update({
        where: { id: kitchenOrder.orderId },
        data: { status: 'READY' }
      });
    } else if (status === 'SERVED') {
      await prisma.order.update({
        where: { id: kitchenOrder.orderId },
        data: { status: 'COMPLETED' }
      });
    }

    res.json({
      success: true,
      data: kitchenOrder,
      message: "Kitchen order status updated successfully"
    });
  } catch (error) {
    console.error("Error updating kitchen order status:", error);
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: "Kitchen order not found"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to update kitchen order status",
        error: error.message
      });
    }
  }
};

export const updateKitchenOrderTime = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { id } = req.params;
    const { estimatedTime, actualTime } = req.body;

    const updateData = {};
    if (estimatedTime !== undefined) updateData.estimatedTime = parseInt(estimatedTime);
    if (actualTime !== undefined) updateData.actualTime = parseInt(actualTime);

    const kitchenOrder = await prisma.kitchenOrder.update({
      where: { 
        id,
        order: { hotelId }
      },
      data: updateData
    });

    res.json({
      success: true,
      data: kitchenOrder,
      message: "Kitchen order time updated successfully"
    });
  } catch (error) {
    console.error("Error updating kitchen order time:", error);
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: "Kitchen order not found"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to update kitchen order time",
        error: error.message
      });
    }
  }
};

// ===================== KITCHEN DISPLAY CONTROLLERS =====================

export const getKitchenDisplays = async (req, res) => {
  try {
    const { hotelId } = req.user;

    const displays = await prisma.kitchenDisplay.findMany({
      where: { hotelId },
      orderBy: { createdAt: 'asc' }
    });

    res.json({
      success: true,
      data: displays
    });
  } catch (error) {
    console.error("Error fetching kitchen displays:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch kitchen displays",
      error: error.message
    });
  }
};

export const createKitchenDisplay = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { name, location } = req.body;

    if (!name || !location) {
      return res.status(400).json({
        success: false,
        message: "Name and location are required"
      });
    }

    const display = await prisma.kitchenDisplay.create({
      data: {
        name,
        location,
        hotelId
      }
    });

    res.status(201).json({
      success: true,
      data: display,
      message: "Kitchen display created successfully"
    });
  } catch (error) {
    console.error("Error creating kitchen display:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create kitchen display",
      error: error.message
    });
  }
};

export const updateKitchenDisplay = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { id } = req.params;
    const { name, location, isActive } = req.body;

    const display = await prisma.kitchenDisplay.update({
      where: { 
        id,
        hotelId 
      },
      data: {
        name: name || undefined,
        location: location || undefined,
        isActive: isActive !== undefined ? isActive : undefined
      }
    });

    res.json({
      success: true,
      data: display,
      message: "Kitchen display updated successfully"
    });
  } catch (error) {
    console.error("Error updating kitchen display:", error);
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: "Kitchen display not found"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to update kitchen display",
        error: error.message
      });
    }
  }
};

export const deleteKitchenDisplay = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { id } = req.params;

    await prisma.kitchenDisplay.delete({
      where: { 
        id,
        hotelId 
      }
    });

    res.json({
      success: true,
      message: "Kitchen display deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting kitchen display:", error);
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: "Kitchen display not found"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to delete kitchen display",
        error: error.message
      });
    }
  }
};

// ===================== KITCHEN ANALYTICS =====================

export const getKitchenAnalytics = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { startDate, endDate } = req.query;

    const whereClause = { 
      order: { hotelId }
    };
    
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = new Date(startDate);
      if (endDate) whereClause.createdAt.lte = new Date(endDate);
    }

    const [
      totalOrders,
      pendingOrders,
      preparingOrders,
      readyOrders,
      avgPrepTime,
      statusBreakdown
    ] = await Promise.all([
      prisma.kitchenOrder.count({ where: whereClause }),
      prisma.kitchenOrder.count({ where: { ...whereClause, status: 'PENDING' } }),
      prisma.kitchenOrder.count({ where: { ...whereClause, status: 'PREPARING' } }),
      prisma.kitchenOrder.count({ where: { ...whereClause, status: 'READY' } }),
      prisma.kitchenOrder.aggregate({
        where: {
          ...whereClause,
          actualTime: { not: null }
        },
        _avg: { actualTime: true }
      }),
      prisma.kitchenOrder.groupBy({
        by: ['status'],
        where: whereClause,
        _count: { status: true }
      })
    ]);

    const analytics = {
      totalOrders,
      pendingOrders,
      preparingOrders,
      readyOrders,
      avgPrepTime: avgPrepTime._avg.actualTime || 0,
      statusBreakdown: statusBreakdown.map(item => ({
        status: item.status,
        count: item._count.status
      }))
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error("Error fetching kitchen analytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch kitchen analytics",
      error: error.message
    });
  }
};
