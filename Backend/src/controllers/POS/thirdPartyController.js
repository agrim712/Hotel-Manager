import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

// ===================== THIRD-PARTY ORDER CONTROLLERS =====================

export const getThirdPartyOrders = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { 
      platform, 
      status, 
      startDate, 
      endDate,
      page = 1,
      limit = 20
    } = req.query;

    const whereClause = { hotelId };
    
    if (platform) whereClause.platform = platform;
    if (status) whereClause.status = status;
    
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = new Date(startDate);
      if (endDate) whereClause.createdAt.lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      prisma.thirdPartyOrder.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.thirdPartyOrder.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Error fetching third-party orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch third-party orders",
      error: error.message
    });
  }
};

export const getThirdPartyOrder = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { id } = req.params;

    const order = await prisma.thirdPartyOrder.findFirst({
      where: { 
        id,
        hotelId 
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Third-party order not found"
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error("Error fetching third-party order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch third-party order",
      error: error.message
    });
  }
};

export const createThirdPartyOrder = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { platform, externalOrderId, orderData, status = 'PENDING' } = req.body;

    if (!platform || !externalOrderId || !orderData) {
      return res.status(400).json({
        success: false,
        message: "Platform, external order ID, and order data are required"
      });
    }

    const validPlatforms = ['SWIGGY', 'ZOMATO', 'UBER_EATS', 'DUNZO', 'OTHER'];
    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({
        success: false,
        message: "Invalid platform. Must be one of: SWIGGY, ZOMATO, UBER_EATS, DUNZO, OTHER"
      });
    }

    const thirdPartyOrder = await prisma.thirdPartyOrder.create({
      data: {
        platform,
        externalOrderId,
        status,
        orderData: JSON.parse(orderData),
        hotelId
      }
    });

    res.status(201).json({
      success: true,
      data: thirdPartyOrder,
      message: "Third-party order created successfully"
    });
  } catch (error) {
    console.error("Error creating third-party order:", error);
    if (error.code === 'P2002') {
      res.status(400).json({
        success: false,
        message: "Order with this external ID already exists for this platform"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to create third-party order",
        error: error.message
      });
    }
  }
};

export const updateThirdPartyOrder = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { id } = req.params;
    const { orderData, status } = req.body;

    const updateData = {};
    
    if (orderData) updateData.orderData = JSON.parse(orderData);
    if (status) updateData.status = status;

    const thirdPartyOrder = await prisma.thirdPartyOrder.update({
      where: { 
        id,
        hotelId 
      },
      data: updateData
    });

    res.json({
      success: true,
      data: thirdPartyOrder,
      message: "Third-party order updated successfully"
    });
  } catch (error) {
    console.error("Error updating third-party order:", error);
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: "Third-party order not found"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to update third-party order",
        error: error.message
      });
    }
  }
};

export const updateThirdPartyOrderStatus = async (req, res) => {
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

    const validStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be one of: PENDING, CONFIRMED, PREPARING, READY, OUT_FOR_DELIVERY, DELIVERED, CANCELLED"
      });
    }

    const thirdPartyOrder = await prisma.thirdPartyOrder.update({
      where: { 
        id,
        hotelId 
      },
      data: { status }
    });

    res.json({
      success: true,
      data: thirdPartyOrder,
      message: "Third-party order status updated successfully"
    });
  } catch (error) {
    console.error("Error updating third-party order status:", error);
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: "Third-party order not found"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to update third-party order status",
        error: error.message
      });
    }
  }
};

// ===================== WEBHOOK HANDLERS =====================

export const swiggyWebhook = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const webhookData = req.body;

    // Validate webhook signature if needed
    // const signature = req.headers['x-swiggy-signature'];
    // if (!validateSwiggySignature(webhookData, signature)) {
    //   return res.status(401).json({ success: false, message: "Invalid signature" });
    // }

    const { order_id, status, order_data } = webhookData;

    // Check if order already exists
    const existingOrder = await prisma.thirdPartyOrder.findFirst({
      where: {
        platform: 'SWIGGY',
        externalOrderId: order_id,
        hotelId
      }
    });

    if (existingOrder) {
      // Update existing order
      await prisma.thirdPartyOrder.update({
        where: { id: existingOrder.id },
        data: {
          status,
          orderData: order_data
        }
      });
    } else {
      // Create new order
      await prisma.thirdPartyOrder.create({
        data: {
          platform: 'SWIGGY',
          externalOrderId: order_id,
          status,
          orderData: order_data,
          hotelId
        }
      });
    }

    res.json({
      success: true,
      message: "Swiggy webhook processed successfully"
    });
  } catch (error) {
    console.error("Error processing Swiggy webhook:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process webhook",
      error: error.message
    });
  }
};

export const zomatoWebhook = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const webhookData = req.body;

    // Validate webhook signature if needed
    // const signature = req.headers['x-zomato-signature'];
    // if (!validateZomatoSignature(webhookData, signature)) {
    //   return res.status(401).json({ success: false, message: "Invalid signature" });
    // }

    const { order_id, status, order_data } = webhookData;

    // Check if order already exists
    const existingOrder = await prisma.thirdPartyOrder.findFirst({
      where: {
        platform: 'ZOMATO',
        externalOrderId: order_id,
        hotelId
      }
    });

    if (existingOrder) {
      // Update existing order
      await prisma.thirdPartyOrder.update({
        where: { id: existingOrder.id },
        data: {
          status,
          orderData: order_data
        }
      });
    } else {
      // Create new order
      await prisma.thirdPartyOrder.create({
        data: {
          platform: 'ZOMATO',
          externalOrderId: order_id,
          status,
          orderData: order_data,
          hotelId
        }
      });
    }

    res.json({
      success: true,
      message: "Zomato webhook processed successfully"
    });
  } catch (error) {
    console.error("Error processing Zomato webhook:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process webhook",
      error: error.message
    });
  }
};

export const uberEatsWebhook = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const webhookData = req.body;

    // Validate webhook signature if needed
    // const signature = req.headers['x-uber-eats-signature'];
    // if (!validateUberEatsSignature(webhookData, signature)) {
    //   return res.status(401).json({ success: false, message: "Invalid signature" });
    // }

    const { order_id, status, order_data } = webhookData;

    // Check if order already exists
    const existingOrder = await prisma.thirdPartyOrder.findFirst({
      where: {
        platform: 'UBER_EATS',
        externalOrderId: order_id,
        hotelId
      }
    });

    if (existingOrder) {
      // Update existing order
      await prisma.thirdPartyOrder.update({
        where: { id: existingOrder.id },
        data: {
          status,
          orderData: order_data
        }
      });
    } else {
      // Create new order
      await prisma.thirdPartyOrder.create({
        data: {
          platform: 'UBER_EATS',
          externalOrderId: order_id,
          status,
          orderData: order_data,
          hotelId
        }
      });
    }

    res.json({
      success: true,
      message: "Uber Eats webhook processed successfully"
    });
  } catch (error) {
    console.error("Error processing Uber Eats webhook:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process webhook",
      error: error.message
    });
  }
};

// ===================== HELPER FUNCTIONS =====================

// Function to validate webhook signatures (implement based on platform requirements)
const validateSwiggySignature = (data, signature) => {
  // Implement Swiggy signature validation
  return true; // Placeholder
};

const validateZomatoSignature = (data, signature) => {
  // Implement Zomato signature validation
  return true; // Placeholder
};

const validateUberEatsSignature = (data, signature) => {
  // Implement Uber Eats signature validation
  return true; // Placeholder
};
