import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();


// Generate unique order number
const generateOrderNumber = async (hotelId) => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  
  const lastOrder = await prisma.order.findFirst({
    where: {
      hotelId,
      orderNumber: {
        startsWith: `ORD${dateStr}`
      }
    },
    orderBy: { orderNumber: 'desc' }
  });

  let sequence = 1;
  if (lastOrder) {
    const lastSequence = parseInt(lastOrder.orderNumber.slice(-4));
    sequence = lastSequence + 1;
  }

  return `ORD${dateStr}${sequence.toString().padStart(4, '0')}`;
};

// ===================== ORDER CONTROLLERS =====================

export const getOrders = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { 
      status, 
      type, 
      tableId, 
      customerId, 
      startDate, 
      endDate,
      page = 1,
      limit = 20
    } = req.query;

    const whereClause = { hotelId };
    
    if (status) whereClause.status = status;
    if (type) whereClause.type = type;
    if (tableId) whereClause.tableId = tableId;
    if (customerId) whereClause.customerId = customerId;
    
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = new Date(startDate);
      if (endDate) whereClause.createdAt.lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: whereClause,
        include: {
          customer: {
            select: { id: true, name: true, phone: true }
          },
          table: {
            select: { id: true, number: true, capacity: true }
          },
          orderItems: {
            include: {
              item: {
                select: { id: true, name: true, price: true }
              },
              modifiers: {
                include: {
                  modifier: {
                    select: { name: true, price: true }
                  }
                }
              }
            }
          },
          bills: true,
          payments: true,
          kitchenOrders: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.order.count({ where: whereClause })
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
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message
    });
  }
};

export const getOrder = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: { 
        id,
        hotelId 
      },
      include: {
        customer: true,
        table: {
          include: {
            area: true
          }
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
        },
        bills: true,
        payments: true,
        discounts: true,
        kitchenOrders: true,
        orderSplits: true
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
      error: error.message
    });
  }
};

export const createOrder = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { 
      type, 
      tableId, 
      customerId, 
      items, 
      notes,
      estimatedTime 
    } = req.body;

    if (!type || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order type and items are required"
      });
    }

    // Generate order number
    const orderNumber = await generateOrderNumber(hotelId);

    // Calculate total amount
    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of items) {
      const menuItem = await prisma.menuItem.findFirst({
        where: { id: item.itemId, hotelId }
      });

      if (!menuItem) {
        return res.status(400).json({
          success: false,
          message: `Menu item with ID ${item.itemId} not found`
        });
      }

      let itemTotal = menuItem.basePrice * item.quantity;
      
      // Add modifier costs
      if (item.modifiers && item.modifiers.length > 0) {
        for (const modifierId of item.modifiers) {
          const modifier = await prisma.menuModifier.findFirst({
            where: { id: modifierId, hotelId }
          });
          if (modifier) {
            itemTotal += modifier.price * item.quantity;
          }
        }
      }

      totalAmount += itemTotal;
      orderItemsData.push({
        itemId: parseInt(item.itemId),
        quantity: item.quantity,
        price: itemTotal,
        notes: item.notes || null
      });
    }

    // Create order with items
    const order = await prisma.order.create({
      data: {
        orderNumber,
        type,
        tableId: tableId || null,
        customerId: customerId || null,
        hotelId,
        notes: notes || null,
        estimatedTime: estimatedTime ? parseInt(estimatedTime) : null,
        orderItems: {
          create: orderItemsData
        }
      },
      include: {
        orderItems: {
          include: {
            item: true
          }
        }
      }
    });

    // Create kitchen order
    await prisma.kitchenOrder.create({
      data: {
        orderId: order.id,
        status: "PENDING",
        priority: "NORMAL",
        estimatedTime: estimatedTime ? parseInt(estimatedTime) : null
      }
    });

    // Update table status if dine-in
    if (type === 'dine-in' && tableId) {
      await prisma.table.update({
        where: { id: tableId },
        data: { status: "OCCUPIED" }
      });
    }

    res.status(201).json({
      success: true,
      data: order,
      message: "Order created successfully"
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message
    });
  }
};

export const updateOrder = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { id } = req.params;
    const updates = req.body;

    const order = await prisma.order.update({
      where: { 
        id,
        hotelId 
      },
      data: {
        notes: updates.notes,
        estimatedTime: updates.estimatedTime ? parseInt(updates.estimatedTime) : undefined,
        actualTime: updates.actualTime ? parseInt(updates.actualTime) : undefined
      }
    });

    res.json({
      success: true,
      data: order,
      message: "Order updated successfully"
    });
  } catch (error) {
    console.error("Error updating order:", error);
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: "Order not found"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to update order",
        error: error.message
      });
    }
  }
};

export const updateOrderStatus = async (req, res) => {
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

    const order = await prisma.order.update({
      where: { 
        id,
        hotelId 
      },
      data: { status },
      include: {
        table: true
      }
    });

    // Update table status if order is completed or cancelled
    if ((status === 'COMPLETED' || status === 'CANCELLED') && order.table) {
      await prisma.table.update({
        where: { id: order.table.id },
        data: { status: "AVAILABLE" }
      });
    }

    // Update kitchen order status
    if (status === 'PREPARING') {
      await prisma.kitchenOrder.updateMany({
        where: { orderId: id },
        data: { status: "PREPARING" }
      });
    } else if (status === 'READY') {
      await prisma.kitchenOrder.updateMany({
        where: { orderId: id },
        data: { status: "READY" }
      });
    }

    res.json({
      success: true,
      data: order,
      message: "Order status updated successfully"
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: "Order not found"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to update order status",
        error: error.message
      });
    }
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { id } = req.params;
    const { reason } = req.body;

    const order = await prisma.order.findFirst({
      where: { id, hotelId },
      include: { table: true }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    if (order.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel completed order"
      });
    }

    // Update order status
    await prisma.order.update({
      where: { id },
      data: { 
        status: 'CANCELLED',
        notes: reason ? `${order.notes || ''}\nCancellation reason: ${reason}`.trim() : order.notes
      }
    });

    // Update table status if dine-in
    if (order.type === 'dine-in' && order.table) {
      await prisma.table.update({
        where: { id: order.table.id },
        data: { status: "AVAILABLE" }
      });
    }

    // Update kitchen order status
    await prisma.kitchenOrder.updateMany({
      where: { orderId: id },
      data: { status: "CANCELLED" }
    });

    res.json({
      success: true,
      message: "Order cancelled successfully"
    });
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel order",
      error: error.message
    });
  }
};

// ===================== ORDER ITEM CONTROLLERS =====================

export const addOrderItem = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { orderId } = req.params;
    const { itemId, quantity, modifiers, notes } = req.body;

    if (!itemId || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Item ID and quantity are required"
      });
    }

    // Verify order exists
    const order = await prisma.order.findFirst({
      where: { id: orderId, hotelId }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    if (order.status === 'COMPLETED' || order.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: "Cannot add items to completed or cancelled order"
      });
    }

    // Get menu item
    const menuItem = await prisma.menuItem.findFirst({
      where: { id: itemId, hotelId }
    });

    if (!menuItem) {
      return res.status(400).json({
        success: false,
        message: "Menu item not found"
      });
    }

    // Calculate price
    let itemPrice = menuItem.basePrice * quantity;
    
    // Add modifier costs
    if (modifiers && modifiers.length > 0) {
      for (const modifierId of modifiers) {
        const modifier = await prisma.menuModifier.findFirst({
          where: { id: modifierId, hotelId }
        });
        if (modifier) {
          itemPrice += modifier.price * quantity;
        }
      }
    }

    // Create order item
    const orderItem = await prisma.orderItem.create({
      data: {
        orderId,
        itemId: parseInt(itemId),
        quantity: parseInt(quantity),
        price: itemPrice,
        notes: notes || null
      }
    });

    // Add modifiers
    if (modifiers && modifiers.length > 0) {
      const modifierPromises = modifiers.map(modifierId =>
        prisma.orderModifier.create({
          data: {
            modifierId,
            orderItemId: orderItem.id
          }
        })
      );
      await Promise.all(modifierPromises);
    }

    res.status(201).json({
      success: true,
      data: orderItem,
      message: "Item added to order successfully"
    });
  } catch (error) {
    console.error("Error adding order item:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add item to order",
      error: error.message
    });
  }
};

export const updateOrderItem = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { orderId, itemId } = req.params;
    const { quantity, notes } = req.body;

    // Verify order exists
    const order = await prisma.order.findFirst({
      where: { id: orderId, hotelId }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    if (order.status === 'COMPLETED' || order.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: "Cannot modify items in completed or cancelled order"
      });
    }

    const orderItem = await prisma.orderItem.update({
      where: { 
        id: itemId,
        orderId 
      },
      data: {
        quantity: quantity ? parseInt(quantity) : undefined,
        notes: notes !== undefined ? notes : undefined
      }
    });

    res.json({
      success: true,
      data: orderItem,
      message: "Order item updated successfully"
    });
  } catch (error) {
    console.error("Error updating order item:", error);
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: "Order item not found"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to update order item",
        error: error.message
      });
    }
  }
};

export const removeOrderItem = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { orderId, itemId } = req.params;

    // Verify order exists
    const order = await prisma.order.findFirst({
      where: { id: orderId, hotelId }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    if (order.status === 'COMPLETED' || order.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: "Cannot remove items from completed or cancelled order"
      });
    }

    // Delete modifiers first
    await prisma.orderModifier.deleteMany({
      where: { orderItemId: itemId }
    });

    // Delete order item
    await prisma.orderItem.delete({
      where: { 
        id: itemId,
        orderId 
      }
    });

    res.json({
      success: true,
      message: "Order item removed successfully"
    });
  } catch (error) {
    console.error("Error removing order item:", error);
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: "Order item not found"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to remove order item",
        error: error.message
      });
    }
  }
};

// ===================== ORDER MODIFIER CONTROLLERS =====================

export const addOrderModifier = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { orderId, itemId } = req.params;
    const { modifierId } = req.body;

    if (!modifierId) {
      return res.status(400).json({
        success: false,
        message: "Modifier ID is required"
      });
    }

    // Verify modifier exists
    const modifier = await prisma.menuModifier.findFirst({
      where: { id: modifierId, hotelId }
    });

    if (!modifier) {
      return res.status(400).json({
        success: false,
        message: "Menu modifier not found"
      });
    }

    const orderModifier = await prisma.orderModifier.create({
      data: {
        modifierId,
        orderItemId: itemId
      }
    });

    res.status(201).json({
      success: true,
      data: orderModifier,
      message: "Modifier added successfully"
    });
  } catch (error) {
    console.error("Error adding order modifier:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add modifier",
      error: error.message
    });
  }
};

export const removeOrderModifier = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { orderId, itemId, modifierId } = req.params;

    await prisma.orderModifier.deleteMany({
      where: {
        id: modifierId,
        orderItemId: itemId
      }
    });

    res.json({
      success: true,
      message: "Modifier removed successfully"
    });
  } catch (error) {
    console.error("Error removing order modifier:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove modifier",
      error: error.message
    });
  }
};

// ===================== ORDER SPLIT CONTROLLERS =====================

export const splitOrder = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { id } = req.params;
    const { splits } = req.body;

    if (!splits || splits.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Split data is required"
      });
    }

    // Verify order exists
    const order = await prisma.order.findFirst({
      where: { id, hotelId },
      include: { orderItems: true }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Create splits
    const splitPromises = splits.map(split =>
      prisma.orderSplit.create({
        data: {
          orderId: id,
          items: split.items,
          total: split.total,
          customerName: split.customerName || null
        }
      })
    );

    const createdSplits = await Promise.all(splitPromises);

    res.status(201).json({
      success: true,
      data: createdSplits,
      message: "Order split successfully"
    });
  } catch (error) {
    console.error("Error splitting order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to split order",
      error: error.message
    });
  }
};

export const getOrderSplits = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { id } = req.params;

    const splits = await prisma.orderSplit.findMany({
      where: { orderId: id }
    });

    res.json({
      success: true,
      data: splits
    });
  } catch (error) {
    console.error("Error fetching order splits:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order splits",
      error: error.message
    });
  }
};

// ===================== CUSTOMER CONTROLLERS =====================

export const getCustomers = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { search, page = 1, limit = 20 } = req.query;

    const whereClause = { hotelId };
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.customer.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      data: customers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch customers",
      error: error.message
    });
  }
};

export const getCustomer = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { id } = req.params;

    const customer = await prisma.customer.findFirst({
      where: { id, hotelId },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        feedbacks: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }

    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error("Error fetching customer:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch customer",
      error: error.message
    });
  }
};

export const createCustomer = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { name, email, phone } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Customer name is required"
      });
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        hotelId
      }
    });

    res.status(201).json({
      success: true,
      data: customer,
      message: "Customer created successfully"
    });
  } catch (error) {
    console.error("Error creating customer:", error);
    if (error.code === 'P2002') {
      res.status(400).json({
        success: false,
        message: "Customer with this email already exists"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to create customer",
        error: error.message
      });
    }
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { id } = req.params;
    const { name, email, phone } = req.body;

    const customer = await prisma.customer.update({
      where: { 
        id,
        hotelId 
      },
      data: {
        name,
        email: email || null,
        phone: phone || null
      }
    });

    res.json({
      success: true,
      data: customer,
      message: "Customer updated successfully"
    });
  } catch (error) {
    console.error("Error updating customer:", error);
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to update customer",
        error: error.message
      });
    }
  }
};

export const getCustomerOrders = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { id } = req.params;

    const orders = await prisma.order.findMany({
      where: { 
        customerId: id,
        hotelId 
      },
      include: {
        orderItems: {
          include: {
            item: true
          }
        },
        bills: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch customer orders",
      error: error.message
    });
  }
};

export const getCustomerFeedback = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { id } = req.params;

    const feedbacks = await prisma.feedback.findMany({
      where: { 
        customerId: id,
        hotelId 
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: feedbacks
    });
  } catch (error) {
    console.error("Error fetching customer feedback:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch customer feedback",
      error: error.message
    });
  }
};
