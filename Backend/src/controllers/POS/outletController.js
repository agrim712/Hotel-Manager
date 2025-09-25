import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Get all outlets for a hotel
export const getOutlets = async (req, res) => {
  try {
    const { hotelId } = req.user;
    
    const outlets = await prisma.outlet.findMany({
      where: { hotelId },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        _count: {
          select: {
            tables: true,
            areas: true,
            waiters: true,
            orders: true,
            menuCategories: true,
            menuItems: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: outlets,
    });
  } catch (error) {
    console.error('Error fetching outlets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch outlets',
      error: error.message,
    });
  }
};

// Get a single outlet
export const getOutlet = async (req, res) => {
  try {
    const { id } = req.params;
    const { hotelId } = req.user;

    const outlet = await prisma.outlet.findFirst({
      where: { 
        id,
        hotelId 
      },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        tables: {
          include: {
            area: true,
            waiter: true,
          },
        },
        areas: true,
        waiters: true,
        menuCategories: {
          include: {
            menuItems: true,
          },
        },
        _count: {
          select: {
            tables: true,
            areas: true,
            waiters: true,
            orders: true,
            menuCategories: true,
            menuItems: true,
          },
        },
      },
    });

    if (!outlet) {
      return res.status(404).json({
        success: false,
        message: 'Outlet not found',
      });
    }

    res.json({
      success: true,
      data: outlet,
    });
  } catch (error) {
    console.error('Error fetching outlet:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch outlet',
      error: error.message,
    });
  }
};

// Create a new outlet
export const createOutlet = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const {
      name,
      description,
      location,
      address,
      phone,
      email,
      operatingHours,
      outletType = 'RESTAURANT',
      managerId,
      // Optional manager creation payload
      manager: managerPayload,
      managerName,
      managerEmail,
      managerPassword,
    } = req.body;

    // Validation
    if (!name || !location) {
      return res.status(400).json({
        success: false,
        message: 'Name and location are required',
      });
    }

    // Check if outlet name already exists for this hotel
    const existingOutlet = await prisma.outlet.findFirst({
      where: {
        name,
        hotelId,
      },
    });

    if (existingOutlet) {
      return res.status(400).json({
        success: false,
        message: 'Outlet name already exists for this hotel',
      });
    }

    // Determine final manager ID. We support three cases:
    // 1) managerId provided directly
    // 2) manager payload provided as { name, email, password }
    // 3) legacy flat fields managerName/managerEmail/managerPassword
    let finalManagerId = managerId || null;

    // Validate manager if provided by id
    if (finalManagerId) {
      const manager = await prisma.staffUser.findFirst({
        where: {
          id: finalManagerId,
          hotelId,
        },
      });

      if (!manager) {
        return res.status(400).json({
          success: false,
          message: 'Manager not found or does not belong to this hotel',
        });
      }
    }

    // If no managerId, try to create a new manager from provided payload
    const payload = managerPayload || undefined;
    const flatProvided = managerName && managerEmail && managerPassword;
    if (!finalManagerId && (payload?.name && payload?.email && payload?.password || flatProvided)) {
      const newMgrName = payload?.name || managerName;
      const newMgrEmail = payload?.email || managerEmail;
      const newMgrPassword = payload?.password || managerPassword;

      // Check if an existing staff with this email exists
      const existingStaff = await prisma.staffUser.findUnique({ where: { email: newMgrEmail } });
      if (existingStaff) {
        // If exists but belongs to same hotel, reuse; otherwise reject
        if (existingStaff.hotelId !== hotelId) {
          return res.status(400).json({
            success: false,
            message: 'A staff user with this email exists for another hotel',
          });
        }
        finalManagerId = existingStaff.id;
      } else {
        const hashedPassword = await bcrypt.hash(newMgrPassword, 10);
        const createdStaff = await prisma.staffUser.create({
          data: {
            name: newMgrName,
            email: newMgrEmail,
            password: hashedPassword,
            // Use the system role that grants manager permissions in POS
            role: 'RESTAURANTMANAGER',
            hotelId,
          },
        });
        finalManagerId = createdStaff.id;
      }
    }

    const outlet = await prisma.outlet.create({
      data: {
        name,
        description,
        location,
        address,
        phone,
        email,
        operatingHours,
        outletType,
        hotelId,
        managerId: finalManagerId,
      },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Outlet created successfully',
      data: outlet,
    });
  } catch (error) {
    console.error('Error creating outlet:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create outlet',
      error: error.message,
    });
  }
};

// Update an outlet
export const updateOutlet = async (req, res) => {
  try {
    const { id } = req.params;
    const { hotelId } = req.user;
    const {
      name,
      description,
      location,
      address,
      phone,
      email,
      operatingHours,
      outletType,
      isActive,
      managerId,
    } = req.body;

    // Check if outlet exists and belongs to the hotel
    const existingOutlet = await prisma.outlet.findFirst({
      where: {
        id,
        hotelId,
      },
    });

    if (!existingOutlet) {
      return res.status(404).json({
        success: false,
        message: 'Outlet not found',
      });
    }

    // Check if name already exists for another outlet in this hotel
    if (name && name !== existingOutlet.name) {
      const nameExists = await prisma.outlet.findFirst({
        where: {
          name,
          hotelId,
          id: { not: id },
        },
      });

      if (nameExists) {
        return res.status(400).json({
          success: false,
          message: 'Outlet name already exists for this hotel',
        });
      }
    }

    // Validate manager if provided
    if (managerId !== undefined && managerId !== null) {
      const manager = await prisma.staffUser.findFirst({
        where: {
          id: managerId,
          hotelId,
        },
      });

      if (!manager) {
        return res.status(400).json({
          success: false,
          message: 'Manager not found or does not belong to this hotel',
        });
      }
    }

    const outlet = await prisma.outlet.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(location && { location }),
        ...(address !== undefined && { address }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
        ...(operatingHours !== undefined && { operatingHours }),
        ...(outletType && { outletType }),
        ...(isActive !== undefined && { isActive }),
        ...(managerId !== undefined && { managerId }),
      },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: 'Outlet updated successfully',
      data: outlet,
    });
  } catch (error) {
    console.error('Error updating outlet:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update outlet',
      error: error.message,
    });
  }
};

// Delete an outlet
export const deleteOutlet = async (req, res) => {
  try {
    const { id } = req.params;
    const { hotelId } = req.user;

    // Check if outlet exists and belongs to the hotel
    const existingOutlet = await prisma.outlet.findFirst({
      where: {
        id,
        hotelId,
      },
    });

    if (!existingOutlet) {
      return res.status(404).json({
        success: false,
        message: 'Outlet not found',
      });
    }

    // Check if outlet has any associated data
    const associatedData = await prisma.outlet.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            tables: true,
            areas: true,
            waiters: true,
            orders: true,
            menuCategories: true,
            menuItems: true,
          },
        },
      },
    });

    const hasAssociatedData = Object.values(associatedData._count).some(count => count > 0);

    if (hasAssociatedData) {
      // Instead of deleting, mark as inactive
      const outlet = await prisma.outlet.update({
        where: { id },
        data: { isActive: false },
      });

      return res.json({
        success: true,
        message: 'Outlet deactivated successfully (has associated data)',
        data: outlet,
      });
    }

    // Safe to delete if no associated data
    await prisma.outlet.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Outlet deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting outlet:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete outlet',
      error: error.message,
    });
  }
};

// Get outlet statistics
export const getOutletStatistics = async (req, res) => {
  try {
    const { id } = req.params;
    const { hotelId } = req.user;

    // Verify outlet belongs to hotel
    const outlet = await prisma.outlet.findFirst({
      where: {
        id,
        hotelId,
      },
    });

    if (!outlet) {
      return res.status(404).json({
        success: false,
        message: 'Outlet not found',
      });
    }

    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    // Get statistics
    const [
      totalTables,
      totalAreas,
      totalWaiters,
      totalMenuItems,
      todayOrders,
      totalRevenue,
      activeOrders,
    ] = await Promise.all([
      prisma.table.count({ where: { outletId: id } }),
      prisma.area.count({ where: { outletId: id } }),
      prisma.waiter.count({ where: { outletId: id, isActive: true } }),
      prisma.menuItem.count({ where: { outletId: id, isAvailable: true } }),
      prisma.order.count({
        where: {
          outletId: id,
          createdAt: {
            gte: startOfDay,
            lt: endOfDay,
          },
        },
      }),
      prisma.bill.aggregate({
        where: {
          order: {
            outletId: id,
            createdAt: {
              gte: startOfDay,
              lt: endOfDay,
            },
          },
        },
        _sum: {
          finalAmount: true,
        },
      }),
      prisma.order.count({
        where: {
          outletId: id,
          status: {
            in: ['PENDING', 'CONFIRMED', 'PREPARING'],
          },
        },
      }),
    ]);

    const statistics = {
      totalTables,
      totalAreas,
      totalWaiters,
      totalMenuItems,
      todayOrders,
      totalRevenue: totalRevenue._sum.finalAmount || 0,
      activeOrders,
    };

    res.json({
      success: true,
      data: {
        outlet,
        statistics,
      },
    });
  } catch (error) {
    console.error('Error fetching outlet statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch outlet statistics',
      error: error.message,
    });
  }
};

// Toggle outlet active status
export const toggleOutletStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { hotelId } = req.user;

    const existingOutlet = await prisma.outlet.findFirst({
      where: {
        id,
        hotelId,
      },
    });

    if (!existingOutlet) {
      return res.status(404).json({
        success: false,
        message: 'Outlet not found',
      });
    }

    const outlet = await prisma.outlet.update({
      where: { id },
      data: {
        isActive: !existingOutlet.isActive,
      },
    });

    res.json({
      success: true,
      message: `Outlet ${outlet.isActive ? 'activated' : 'deactivated'} successfully`,
      data: outlet,
    });
  } catch (error) {
    console.error('Error toggling outlet status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle outlet status',
      error: error.message,
    });
  }
};

// Get comprehensive dashboard data for all outlets
export const getOutletsDashboard = async (req, res) => {
  try {
    const { hotelId } = req.user;

    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
    
    // Get this month's date range
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

    // Get all outlets with basic info
    const outlets = await prisma.outlet.findMany({
      where: { hotelId },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            tables: true,
            areas: true,
            waiters: true,
            menuItems: true,
            orders: true,
          },
        },
      },
    });

    // Get aggregated statistics
    const [todayOrdersCount, todayRevenue, monthlyRevenue, totalCustomers] = await Promise.all([
      // Today's orders
      prisma.order.count({
        where: {
          hotelId,
          createdAt: {
            gte: startOfDay,
            lt: endOfDay,
          },
        },
      }),
      
      // Today's revenue
      prisma.bill.aggregate({
        where: {
          order: {
            hotelId,
            createdAt: {
              gte: startOfDay,
              lt: endOfDay,
            },
          },
        },
        _sum: {
          finalAmount: true,
        },
      }),
      
      // Monthly revenue
      prisma.bill.aggregate({
        where: {
          order: {
            hotelId,
            createdAt: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
        },
        _sum: {
          finalAmount: true,
        },
      }),
      
      // Total customers
      prisma.customer.count({
        where: { hotelId },
      }),
    ]);

    // Get top performing outlets (by revenue)
    const outletRevenue = await Promise.all(
      outlets.map(async (outlet) => {
        const revenue = await prisma.bill.aggregate({
          where: {
            order: {
              outletId: outlet.id,
              createdAt: {
                gte: startOfMonth,
                lte: endOfMonth,
              },
            },
          },
          _sum: {
            finalAmount: true,
          },
        });
        
        const todayOrders = await prisma.order.count({
          where: {
            outletId: outlet.id,
            createdAt: {
              gte: startOfDay,
              lt: endOfDay,
            },
          },
        });

        return {
          ...outlet,
          monthlyRevenue: revenue._sum.finalAmount || 0,
          todayOrders,
        };
      })
    );

    // Sort outlets by monthly revenue
    const topOutlets = outletRevenue.sort((a, b) => b.monthlyRevenue - a.monthlyRevenue);

    // Get recent orders across all outlets
    const recentOrders = await prisma.order.findMany({
      where: { hotelId },
      include: {
        outlet: {
          select: {
            id: true,
            name: true,
          },
        },
        customer: {
          select: {
            name: true,
          },
        },
        table: {
          select: {
            number: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Calculate summary statistics
    const totalOutlets = outlets.length;
    const activeOutlets = outlets.filter(outlet => outlet.isActive).length;
    const totalTables = outlets.reduce((sum, outlet) => sum + outlet._count.tables, 0);
    const totalMenuItems = outlets.reduce((sum, outlet) => sum + outlet._count.menuItems, 0);
    const totalWaiters = outlets.reduce((sum, outlet) => sum + outlet._count.waiters, 0);

    // Get outlet performance trends (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      return {
        date: date.toISOString().split('T')[0],
        start: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        end: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59),
      };
    }).reverse();

    const dailyTrends = await Promise.all(
      last7Days.map(async (day) => {
        const [orders, revenue] = await Promise.all([
          prisma.order.count({
            where: {
              hotelId,
              createdAt: {
                gte: day.start,
                lte: day.end,
              },
            },
          }),
          prisma.bill.aggregate({
            where: {
              order: {
                hotelId,
                createdAt: {
                  gte: day.start,
                  lte: day.end,
                },
              },
            },
            _sum: {
              finalAmount: true,
            },
          }),
        ]);

        return {
          date: day.date,
          orders,
          revenue: revenue._sum.finalAmount || 0,
        };
      })
    );

    const dashboardData = {
      summary: {
        totalOutlets,
        activeOutlets,
        totalTables,
        totalMenuItems,
        totalWaiters,
        totalCustomers,
        todayOrders: todayOrdersCount,
        todayRevenue: todayRevenue._sum.finalAmount || 0,
        monthlyRevenue: monthlyRevenue._sum.finalAmount || 0,
      },
      outlets: topOutlets,
      recentOrders,
      dailyTrends,
      performance: {
        topPerformer: topOutlets[0] || null,
        averageRevenuePerOutlet: topOutlets.length > 0 
          ? topOutlets.reduce((sum, outlet) => sum + outlet.monthlyRevenue, 0) / topOutlets.length 
          : 0,
        totalOrdersToday: todayOrdersCount,
        activeOutletPercentage: totalOutlets > 0 ? (activeOutlets / totalOutlets) * 100 : 0,
      },
    };

    res.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error('Error fetching outlets dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch outlets dashboard',
      error: error.message,
    });
  }
};

// Get available staff users who can be assigned as managers
export const getAvailableManagers = async (req, res) => {
  try {
    const { hotelId } = req.user;

    const availableStaff = await prisma.staffUser.findMany({
      where: {
        hotelId,
        // Include both human-friendly labels and system role for restaurant managers
        role: {
          in: ['Outlet Manager', 'Restaurant Manager', 'Manager', 'Supervisor', 'RESTAURANTMANAGER'],
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        managedOutlets: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json({
      success: true,
      data: availableStaff,
    });
  } catch (error) {
    console.error('Error fetching available managers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available managers',
      error: error.message,
    });
  }
};
