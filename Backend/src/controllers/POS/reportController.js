import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

// ===================== SALES REPORT CONTROLLERS =====================

export const getSalesReport = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { 
      startDate, 
      endDate, 
      groupBy = 'day', // day, week, month
      orderType 
    } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required"
      });
    }

    const whereClause = { 
      hotelId,
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    };

    if (orderType) whereClause.type = orderType;

    // Get orders with bills
    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        bills: true,
        payments: true,
        customer: {
          select: { name: true }
        },
        table: {
          select: { number: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Calculate totals
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => {
      const billTotal = order.bills.reduce((billSum, bill) => billSum + bill.finalAmount, 0);
      return sum + billTotal;
    }, 0);

    const totalPayments = orders.reduce((sum, order) => {
      const paymentTotal = order.payments.reduce((paymentSum, payment) => paymentSum + payment.amount, 0);
      return sum + paymentTotal;
    }, 0);

    // Group by time period
    const groupedData = groupSalesData(orders, groupBy);

    // Order type breakdown
    const orderTypeBreakdown = orders.reduce((acc, order) => {
      acc[order.type] = (acc[order.type] || 0) + 1;
      return acc;
    }, {});

    // Payment method breakdown
    const paymentMethodBreakdown = orders.reduce((acc, order) => {
      order.payments.forEach(payment => {
        acc[payment.mode] = (acc[payment.mode] || 0) + payment.amount;
      });
      return acc;
    }, {});

    const report = {
      summary: {
        totalOrders,
        totalRevenue,
        totalPayments,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
      },
      groupedData,
      orderTypeBreakdown,
      paymentMethodBreakdown,
      period: {
        startDate,
        endDate,
        groupBy
      }
    };

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error("Error generating sales report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate sales report",
      error: error.message
    });
  }
};

// ===================== INVENTORY REPORT CONTROLLERS =====================

export const getInventoryReport = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { 
      startDate, 
      endDate,
      itemId 
    } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required"
      });
    }

    const whereClause = { 
      hotelId,
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    };

    if (itemId) whereClause.itemId = itemId;

    // Get inventory transactions
    const transactions = await prisma.inventoryTransaction.findMany({
      where: whereClause,
      include: {
        item: {
          select: { name: true, unit: true, costPrice: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Get current inventory levels
    const inventoryItems = await prisma.inventoryItem.findMany({
      where: { hotelId },
      include: {
        supplier: {
          select: { name: true }
        }
      }
    });

    // Calculate transaction summaries
    const transactionSummary = transactions.reduce((acc, transaction) => {
      const itemName = transaction.item.name;
      if (!acc[itemName]) {
        acc[itemName] = {
          itemId: transaction.itemId,
          unit: transaction.item.unit,
          costPrice: transaction.item.costPrice,
          in: 0,
          out: 0,
          waste: 0,
          adjustment: 0
        };
      }
      acc[itemName][transaction.type.toLowerCase()] += transaction.quantity;
      return acc;
    }, {});

    // Low stock items
    const lowStockItems = inventoryItems.filter(item => 
      item.threshold && item.quantity <= item.threshold
    );

    // High value items (by quantity * cost)
    const highValueItems = inventoryItems
      .filter(item => item.costPrice)
      .map(item => ({
        ...item,
        totalValue: item.quantity * item.costPrice
      }))
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 10);

    const report = {
      summary: {
        totalItems: inventoryItems.length,
        lowStockItems: lowStockItems.length,
        totalTransactions: transactions.length
      },
      transactionSummary,
      lowStockItems,
      highValueItems,
      period: {
        startDate,
        endDate
      }
    };

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error("Error generating inventory report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate inventory report",
      error: error.message
    });
  }
};

// ===================== REVENUE REPORT CONTROLLERS =====================

export const getRevenueReport = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { 
      startDate, 
      endDate,
      groupBy = 'day'
    } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required"
      });
    }

    const whereClause = { 
      hotelId,
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    };

    // Get bills
    const bills = await prisma.bill.findMany({
      where: whereClause,
      include: {
        order: {
          include: {
            customer: {
              select: { name: true }
            },
            table: {
              select: { number: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Calculate totals
    const totalRevenue = bills.reduce((sum, bill) => sum + bill.finalAmount, 0);
    const totalTax = bills.reduce((sum, bill) => sum + (bill.tax || 0), 0);
    const totalServiceCharge = bills.reduce((sum, bill) => sum + (bill.serviceCharge || 0), 0);
    const totalDiscount = bills.reduce((sum, bill) => sum + (bill.discount || 0), 0);

    // Group by time period
    const groupedRevenue = groupRevenueData(bills, groupBy);

    // Revenue by order type
    const revenueByOrderType = bills.reduce((acc, bill) => {
      const orderType = bill.order.type;
      acc[orderType] = (acc[orderType] || 0) + bill.finalAmount;
      return acc;
    }, {});

    // Average bill amount
    const averageBillAmount = bills.length > 0 ? totalRevenue / bills.length : 0;

    const report = {
      summary: {
        totalRevenue,
        totalTax,
        totalServiceCharge,
        totalDiscount,
        averageBillAmount,
        totalBills: bills.length
      },
      groupedRevenue,
      revenueByOrderType,
      period: {
        startDate,
        endDate,
        groupBy
      }
    };

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error("Error generating revenue report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate revenue report",
      error: error.message
    });
  }
};

// ===================== KITCHEN REPORT CONTROLLERS =====================

export const getKitchenReport = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { 
      startDate, 
      endDate 
    } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required"
      });
    }

    const whereClause = { 
      hotelId,
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    };

    // Get kitchen orders
    const kitchenOrders = await prisma.kitchenOrder.findMany({
      where: whereClause,
      include: {
        order: {
          include: {
            orderItems: {
              include: {
                item: {
                  select: { name: true, prepTime: true }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Calculate statistics
    const totalOrders = kitchenOrders.length;
    const statusBreakdown = kitchenOrders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    const priorityBreakdown = kitchenOrders.reduce((acc, order) => {
      acc[order.priority] = (acc[order.priority] || 0) + 1;
      return acc;
    }, {});

    // Average prep time
    const ordersWithActualTime = kitchenOrders.filter(order => order.actualTime);
    const averagePrepTime = ordersWithActualTime.length > 0 
      ? ordersWithActualTime.reduce((sum, order) => sum + order.actualTime, 0) / ordersWithActualTime.length
      : 0;

    // Most ordered items
    const itemCounts = {};
    kitchenOrders.forEach(kitchenOrder => {
      kitchenOrder.order.orderItems.forEach(orderItem => {
        const itemName = orderItem.item.name;
        itemCounts[itemName] = (itemCounts[itemName] || 0) + orderItem.quantity;
      });
    });

    const mostOrderedItems = Object.entries(itemCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const report = {
      summary: {
        totalOrders,
        averagePrepTime: Math.round(averagePrepTime),
        ordersWithActualTime: ordersWithActualTime.length
      },
      statusBreakdown,
      priorityBreakdown,
      mostOrderedItems,
      period: {
        startDate,
        endDate
      }
    };

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error("Error generating kitchen report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate kitchen report",
      error: error.message
    });
  }
};

// ===================== CUSTOMER REPORT CONTROLLERS =====================

export const getCustomerReport = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { 
      startDate, 
      endDate 
    } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required"
      });
    }

    const whereClause = { 
      hotelId,
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    };

    // Get customers with orders
    const customers = await prisma.customer.findMany({
      where: { hotelId },
      include: {
        orders: {
          where: whereClause,
          include: {
            bills: true,
            feedbacks: true
          }
        }
      }
    });

    // Calculate customer statistics
    const customerStats = customers.map(customer => {
      const totalOrders = customer.orders.length;
      const totalSpent = customer.orders.reduce((sum, order) => {
        const billTotal = order.bills.reduce((billSum, bill) => billSum + bill.finalAmount, 0);
        return sum + billTotal;
      }, 0);
      const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
      const totalFeedback = customer.feedbacks.length;
      const averageRating = totalFeedback > 0 
        ? customer.feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0) / totalFeedback
        : 0;

      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        totalOrders,
        totalSpent,
        averageOrderValue,
        totalFeedback,
        averageRating
      };
    }).filter(customer => customer.totalOrders > 0);

    // Top customers by spending
    const topCustomers = customerStats
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    // Customer segments
    const segments = {
      new: customerStats.filter(c => c.totalOrders === 1).length,
      regular: customerStats.filter(c => c.totalOrders >= 2 && c.totalOrders <= 5).length,
      loyal: customerStats.filter(c => c.totalOrders > 5).length
    };

    const report = {
      summary: {
        totalActiveCustomers: customerStats.length,
        totalOrders: customerStats.reduce((sum, c) => sum + c.totalOrders, 0),
        totalRevenue: customerStats.reduce((sum, c) => sum + c.totalSpent, 0),
        averageCustomerValue: customerStats.length > 0 
          ? customerStats.reduce((sum, c) => sum + c.totalSpent, 0) / customerStats.length
          : 0
      },
      topCustomers,
      customerSegments: segments,
      period: {
        startDate,
        endDate
      }
    };

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error("Error generating customer report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate customer report",
      error: error.message
    });
  }
};

// ===================== DASHBOARD DATA CONTROLLERS =====================

export const getDashboardData = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // Today's orders
    const todayOrders = await prisma.order.findMany({
      where: {
        hotelId,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      include: {
        bills: true,
        kitchenOrders: true,
        orderItems: {
          include: {
            item: {
              select: {
                name: true,
                price: true
              }
            }
          }
        }
      }
    });

    // Today's revenue
    const todayRevenue = todayOrders.reduce((sum, order) => {
      const billTotal = order.bills.reduce((billSum, bill) => billSum + bill.finalAmount, 0);
      return sum + billTotal;
    }, 0);

    // Active tables
    const activeTables = await prisma.table.count({
      where: {
        hotelId,
        status: 'OCCUPIED'
      }
    });

    // Pending kitchen orders
    const pendingKitchenOrders = await prisma.kitchenOrder.count({
      where: {
        hotelId,
        status: 'PENDING'
      }
    });

    // Queue length
    const queueLength = await prisma.queueEntry.count({
      where: {
        hotelId,
        status: 'WAITING'
      }
    });

    // Low stock items
    const lowStockItems = await prisma.inventoryItem.count({
      where: {
        hotelId,
        threshold: { not: null },
        quantity: { lte: prisma.inventoryItem.fields.threshold }
      }
    });

    const dashboardData = {
      today: {
        orders: todayOrders.length,
        revenue: todayRevenue,
        activeTables,
        pendingKitchenOrders,
        queueLength,
        lowStockItems
      },
      recentOrders: todayOrders.slice(-5).map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        type: order.type,
        status: order.status,
        total: order.bills.reduce((sum, bill) => sum + bill.finalAmount, 0),
        createdAt: order.createdAt
      }))
    };

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data",
      error: error.message
    });
  }
};

export const getAnalyticsData = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { 
      startDate, 
      endDate,
      metric = 'revenue' // revenue, orders, customers
    } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required"
      });
    }

    const whereClause = { 
      hotelId,
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    };

    let data = [];

    if (metric === 'revenue') {
      const bills = await prisma.bill.findMany({
        where: whereClause,
        orderBy: { createdAt: 'asc' }
      });
      data = bills.map(bill => ({
        date: bill.createdAt.toISOString().split('T')[0],
        value: bill.finalAmount
      }));
    } else if (metric === 'orders') {
      const orders = await prisma.order.findMany({
        where: whereClause,
        orderBy: { createdAt: 'asc' }
      });
      data = orders.map(order => ({
        date: order.createdAt.toISOString().split('T')[0],
        value: 1
      }));
    } else if (metric === 'customers') {
      const customers = await prisma.customer.findMany({
        where: {
          hotelId,
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        },
        orderBy: { createdAt: 'asc' }
      });
      data = customers.map(customer => ({
        date: customer.createdAt.toISOString().split('T')[0],
        value: 1
      }));
    }

    // Group by date and sum values
    const groupedData = data.reduce((acc, item) => {
      const date = item.date;
      acc[date] = (acc[date] || 0) + item.value;
      return acc;
    }, {});

    const analyticsData = Object.entries(groupedData).map(([date, value]) => ({
      date,
      value
    }));

    res.json({
      success: true,
      data: analyticsData
    });
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics data",
      error: error.message
    });
  }
};

// ===================== HELPER FUNCTIONS =====================

const groupSalesData = (orders, groupBy) => {
  const grouped = {};

  orders.forEach(order => {
    const date = new Date(order.createdAt);
    let key;

    switch (groupBy) {
      case 'day':
        key = date.toISOString().split('T')[0];
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
        break;
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      default:
        key = date.toISOString().split('T')[0];
    }

    if (!grouped[key]) {
      grouped[key] = {
        date: key,
        orders: 0,
        revenue: 0
      };
    }

    grouped[key].orders += 1;
    const billTotal = order.bills.reduce((sum, bill) => sum + bill.finalAmount, 0);
    grouped[key].revenue += billTotal;
  });

  return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
};

const groupRevenueData = (bills, groupBy) => {
  const grouped = {};

  bills.forEach(bill => {
    const date = new Date(bill.createdAt);
    let key;

    switch (groupBy) {
      case 'day':
        key = date.toISOString().split('T')[0];
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
        break;
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      default:
        key = date.toISOString().split('T')[0];
    }

    if (!grouped[key]) {
      grouped[key] = {
        date: key,
        revenue: 0,
        tax: 0,
        serviceCharge: 0,
        discount: 0
      };
    }

    grouped[key].revenue += bill.finalAmount;
    grouped[key].tax += bill.tax || 0;
    grouped[key].serviceCharge += bill.serviceCharge || 0;
    grouped[key].discount += bill.discount || 0;
  });

  return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
};
