import pkg from "@prisma/client";
const { PrismaClient, PaymentMode } = pkg;

const prisma = new PrismaClient();

// In-memory timers to auto-release tables after maintenance window
const maintenanceTimers = new Map(); // key: tableId, value: NodeJS.Timeout

const scheduleTableMaintenance = async (tableId, hotelId, durationMs = 10 * 60 * 1000) => {
  try {
    if (!tableId) return;

    // Set table to MAINTENANCE now
    await prisma.table.update({
      where: { id: tableId },
      data: { status: 'MAINTENANCE' },
    });

    // Clear any existing timer for this table
    const existing = maintenanceTimers.get(tableId);
    if (existing) {
      clearTimeout(existing);
      maintenanceTimers.delete(tableId);
    }

    // Schedule release to AVAILABLE after duration, if no active orders
    const timer = setTimeout(async () => {
      try {
        const activeOrders = await prisma.order.count({
          where: {
            tableId: tableId,
            hotelId: hotelId,
            status: {
              in: ['PENDING', 'CONFIRMED', 'PREPARING']
            }
          }
        });

        if (activeOrders === 0) {
          await prisma.table.update({
            where: { id: tableId },
            data: { status: 'AVAILABLE' },
          });
        }
      } catch (innerErr) {
        console.error('Error auto-releasing table from maintenance:', innerErr);
      } finally {
        maintenanceTimers.delete(tableId);
      }
    }, durationMs);

    maintenanceTimers.set(tableId, timer);
  } catch (err) {
    console.error('Error scheduling table maintenance:', err);
  }
};

// ===================== BILL CONTROLLERS =====================

// Normalize incoming payment mode strings to Prisma PaymentMode enum values
const normalizePaymentMode = (mode) => {
  if (!mode) return null;
  const value = String(mode).trim().toUpperCase();
  // Direct matches
  const allowed = new Set(["CASH", "CARD", "UPI", "BANK", "OTHER"]);
  if (allowed.has(value)) return value;
  // Common aliases from frontend/UI
  switch (value) {
    case "WALLET":
    case "ONLINE":
    case "DIGITAL":
      return "OTHER";
    default:
      return null;
  }
};

export const getBills = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { 
      orderId, 
      startDate, 
      endDate,
      page = 1,
      limit = 20
    } = req.query;

    const whereClause = { 
      order: { hotelId }
    };
    
    if (orderId) whereClause.orderId = orderId;
    
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = new Date(startDate);
      if (endDate) whereClause.createdAt.lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [bills, total] = await Promise.all([
      prisma.bill.findMany({
        where: whereClause,
        include: {
          order: {
            include: {
              customer: {
                select: { name: true, phone: true }
              },
              table: {
                select: { number: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.bill.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      data: bills,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Error fetching bills:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bills",
      error: error.message
    });
  }
};

export const getBill = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { id } = req.params;

    const bill = await prisma.bill.findFirst({
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
                item: true,
                modifiers: {
                  include: {
                    modifier: true
                  }
                }
              }
            },
            discounts: true
          }
        }
      }
    });

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found"
      });
    }

    res.json({
      success: true,
      data: bill
    });
  } catch (error) {
    console.error("Error fetching bill:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bill",
      error: error.message
    });
  }
};

export const createBill = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { orderId, tax, serviceCharge, discount, finalAmount } = req.body;

    if (!orderId || !finalAmount) {
      return res.status(400).json({
        success: false,
        message: "Order ID and final amount are required"
      });
    }

    // Verify order exists and belongs to hotel
    const order = await prisma.order.findFirst({
      where: { id: orderId, hotelId },
      include: {
        orderItems: {
          include: {
            item: true,
            modifiers: {
              include: {
                modifier: true
              }
            }
          }
        },
        discounts: true
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Calculate subtotal
    const subtotal = order.orderItems.reduce((sum, item) => {
      let itemTotal = item.price;
      return sum + itemTotal;
    }, 0);

    // Calculate discount amount
    let discountAmount = 0;
    if (order.discounts && order.discounts.length > 0) {
      discountAmount = order.discounts.reduce((sum, discount) => {
        if (discount.type === 'PERCENTAGE') {
          return sum + (subtotal * discount.value / 100);
        } else {
          return sum + discount.value;
        }
      }, 0);
    }

    // Add manual discount if provided
    if (discount) {
      discountAmount += parseFloat(discount);
    }

    const bill = await prisma.bill.create({
      data: {
        orderId,
        total: subtotal,
        tax: tax ? parseFloat(tax) : null,
        serviceCharge: serviceCharge ? parseFloat(serviceCharge) : null,
        discount: discountAmount,
        finalAmount: parseFloat(finalAmount)
      },
      include: {
        order: {
          include: {
            customer: true,
            table: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: bill,
      message: "Bill created successfully"
    });
  } catch (error) {
    console.error("Error creating bill:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create bill",
      error: error.message
    });
  }
};

export const updateBill = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { id } = req.params;
    const { tax, serviceCharge, discount, finalAmount } = req.body;

    const bill = await prisma.bill.update({
      where: { 
        id,
        order: { hotelId }
      },
      data: {
        tax: tax !== undefined ? parseFloat(tax) : undefined,
        serviceCharge: serviceCharge !== undefined ? parseFloat(serviceCharge) : undefined,
        discount: discount !== undefined ? parseFloat(discount) : undefined,
        finalAmount: finalAmount !== undefined ? parseFloat(finalAmount) : undefined
      }
    });

    res.json({
      success: true,
      data: bill,
      message: "Bill updated successfully"
    });
  } catch (error) {
    console.error("Error updating bill:", error);
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: "Bill not found"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to update bill",
        error: error.message
      });
    }
  }
};

// ===================== PAYMENT CONTROLLERS =====================

export const getPayments = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { 
      orderId, 
      mode, 
      status,
      startDate, 
      endDate,
      page = 1,
      limit = 20
    } = req.query;

    const whereClause = { 
      order: { hotelId }
    };
    
    if (orderId) whereClause.orderId = orderId;
    if (mode) whereClause.mode = mode;
    if (status) whereClause.status = status;
    
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = new Date(startDate);
      if (endDate) whereClause.createdAt.lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where: whereClause,
        include: {
          order: {
            include: {
              customer: {
                select: { name: true, phone: true }
              },
              table: {
                select: { number: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.payment.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      data: payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payments",
      error: error.message
    });
  }
};

export const createPayment = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { orderId, mode, amount, status = 'SUCCESS' } = req.body;

    if (!orderId || !mode || !amount) {
      return res.status(400).json({
        success: false,
        message: "Order ID, payment mode, and amount are required"
      });
    }

    // Normalize and validate payment mode against Prisma enum
    const normalizeMode = (rawMode) => {
      if (!rawMode || typeof rawMode !== 'string') return null;
      const upper = rawMode.trim().toUpperCase();
      if (upper === 'WALLET') return PaymentMode.OTHER;
      if (upper in PaymentMode) return PaymentMode[upper];
      // Common aliases
      const aliasMap = {
        CASH: PaymentMode.CASH,
        CARD: PaymentMode.CARD,
        CREDITCARD: PaymentMode.CARD,
        DEBITCARD: PaymentMode.CARD,
        UPI: PaymentMode.UPI,
        BANK: PaymentMode.BANK,
        NETBANKING: PaymentMode.BANK,
        ONLINE: PaymentMode.BANK,
      };
      return aliasMap[upper] || null;
    };

    const normalizedMode = normalizeMode(mode);
    if (!normalizedMode) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment mode. Use one of: ${Object.values(PaymentMode).join(', ')}`
      });
    }

    // Verify order exists and belongs to hotel
    const order = await prisma.order.findFirst({
      where: { id: orderId, hotelId }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    const payment = await prisma.payment.create({
      data: {
        orderId,
        mode: normalizedMode,
        amount: parseFloat(amount),
        status
      },
      include: {
        order: {
          include: {
            customer: true,
            table: true
          }
        }
      }
    });

    // If payment is successful and the order has an associated table, put it into MAINTENANCE for 10 minutes
    if ((status === 'SUCCESS' || status === true) && payment.order?.table?.id) {
      await scheduleTableMaintenance(payment.order.table.id, hotelId);
    }

    res.status(201).json({
      success: true,
      data: payment,
      message: "Payment created successfully"
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create payment",
      error: error.message
    });
  }
};

export const updatePayment = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { id } = req.params;
    const { mode, amount, status } = req.body;

    // Fetch existing payment to detect status change
    const existing = await prisma.payment.findFirst({
      where: { id, order: { hotelId } },
      include: { order: { include: { table: true } } }
    });

    const payment = await prisma.payment.update({
      where: { 
        id,
        order: { hotelId }
      },
      data: {
        mode: mode || undefined,
        amount: amount !== undefined ? parseFloat(amount) : undefined,
        status: status || undefined
      },
      include: { order: { include: { table: true } } }
    });

    // If status transitioned to SUCCESS and there's a table, schedule maintenance
    if (status && status === 'SUCCESS' && existing?.status !== 'SUCCESS' && payment.order?.table?.id) {
      await scheduleTableMaintenance(payment.order.table.id, hotelId);
    }

    res.json({
      success: true,
      data: payment,
      message: "Payment updated successfully"
    });
  } catch (error) {
    console.error("Error updating payment:", error);
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to update payment",
        error: error.message
      });
    }
  }
};

// ===================== TAX CONFIGURATION CONTROLLERS =====================

export const getTaxConfiguration = async (req, res) => {
  try {
    const { hotelId } = req.user;

    const taxConfigs = await prisma.taxConfiguration.findMany({
      where: { hotelId },
      orderBy: { createdAt: 'asc' }
    });

    res.json({
      success: true,
      data: taxConfigs
    });
  } catch (error) {
    console.error("Error fetching tax configuration:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tax configuration",
      error: error.message
    });
  }
};

export const createTaxConfiguration = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { name, type, rate, isInclusive } = req.body;

    if (!name || !type || !rate) {
      return res.status(400).json({
        success: false,
        message: "Name, type, and rate are required"
      });
    }

    const taxConfig = await prisma.taxConfiguration.create({
      data: {
        name,
        type,
        rate: parseFloat(rate),
        isInclusive: isInclusive === 'true' || isInclusive === true,
        hotelId
      }
    });

    res.status(201).json({
      success: true,
      data: taxConfig,
      message: "Tax configuration created successfully"
    });
  } catch (error) {
    console.error("Error creating tax configuration:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create tax configuration",
      error: error.message
    });
  }
};

export const updateTaxConfiguration = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { id } = req.params;
    const { name, type, rate, isInclusive, isActive } = req.body;

    const taxConfig = await prisma.taxConfiguration.update({
      where: { 
        id,
        hotelId 
      },
      data: {
        name: name || undefined,
        type: type || undefined,
        rate: rate !== undefined ? parseFloat(rate) : undefined,
        isInclusive: isInclusive !== undefined ? isInclusive : undefined,
        isActive: isActive !== undefined ? isActive : undefined
      }
    });

    res.json({
      success: true,
      data: taxConfig,
      message: "Tax configuration updated successfully"
    });
  } catch (error) {
    console.error("Error updating tax configuration:", error);
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: "Tax configuration not found"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to update tax configuration",
        error: error.message
      });
    }
  }
};

// ===================== RECEIPT TEMPLATE CONTROLLERS =====================

export const getReceiptTemplates = async (req, res) => {
  try {
    const { hotelId } = req.user;

    const templates = await prisma.receiptTemplate.findMany({
      where: { hotelId },
      orderBy: { createdAt: 'asc' }
    });

    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error("Error fetching receipt templates:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch receipt templates",
      error: error.message
    });
  }
};

export const createReceiptTemplate = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { name, template, isDefault } = req.body;

    if (!name || !template) {
      return res.status(400).json({
        success: false,
        message: "Name and template are required"
      });
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.receiptTemplate.updateMany({
        where: { hotelId },
        data: { isDefault: false }
      });
    }

    const receiptTemplate = await prisma.receiptTemplate.create({
      data: {
        name,
        template: JSON.parse(template),
        isDefault: isDefault === 'true' || isDefault === true,
        hotelId
      }
    });

    res.status(201).json({
      success: true,
      data: receiptTemplate,
      message: "Receipt template created successfully"
    });
  } catch (error) {
    console.error("Error creating receipt template:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create receipt template",
      error: error.message
    });
  }
};

export const updateReceiptTemplate = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { id } = req.params;
    const { name, template, isDefault } = req.body;

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.receiptTemplate.updateMany({
        where: { hotelId },
        data: { isDefault: false }
      });
    }

    const receiptTemplate = await prisma.receiptTemplate.update({
      where: { 
        id,
        hotelId 
      },
      data: {
        name: name || undefined,
        template: template ? JSON.parse(template) : undefined,
        isDefault: isDefault !== undefined ? isDefault : undefined
      }
    });

    res.json({
      success: true,
      data: receiptTemplate,
      message: "Receipt template updated successfully"
    });
  } catch (error) {
    console.error("Error updating receipt template:", error);
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: "Receipt template not found"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to update receipt template",
        error: error.message
      });
    }
  }
};
