import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

// ===================== INVENTORY ITEM CONTROLLERS =====================

export const getInventoryItems = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { 
      search, 
      supplierId, 
      lowStock,
      page = 1,
      limit = 20
    } = req.query;

    const whereClause = { hotelId };
    
    if (search) {
      whereClause.name = {
        contains: search,
        mode: 'insensitive'
      };
    }
    
    if (supplierId) {
      whereClause.supplierId = supplierId;
    }
    
    if (lowStock === 'true') {
      whereClause.threshold = { not: null };
      whereClause.quantity = { lte: prisma.inventoryItem.fields.threshold };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [items, total] = await Promise.all([
      prisma.inventoryItem.findMany({
        where: whereClause,
        include: {
          supplier: {
            select: { name: true, contact: true }
          },
          transactions: {
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        },
        orderBy: { name: 'asc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.inventoryItem.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      data: items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Error fetching inventory items:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch inventory items",
      error: error.message
    });
  }
};

export const getInventoryItem = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { id } = req.params;

    const item = await prisma.inventoryItem.findFirst({
      where: { 
        id,
        hotelId 
      },
      include: {
        supplier: true,
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found"
      });
    }

    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error("Error fetching inventory item:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch inventory item",
      error: error.message
    });
  }
};

export const createInventoryItem = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { 
      name, 
      quantity, 
      unit, 
      threshold, 
      costPrice, 
      supplierId 
    } = req.body;

    if (!name || !quantity || !unit) {
      return res.status(400).json({
        success: false,
        message: "Name, quantity, and unit are required"
      });
    }

    const item = await prisma.inventoryItem.create({
      data: {
        name,
        quantity: parseFloat(quantity),
        unit,
        threshold: threshold ? parseFloat(threshold) : null,
        costPrice: costPrice ? parseFloat(costPrice) : null,
        supplierId: supplierId || null,
        hotelId
      },
      include: {
        supplier: true
      }
    });

    // Create initial transaction
    await prisma.inventoryTransaction.create({
      data: {
        itemId: item.id,
        type: 'IN',
        quantity: parseFloat(quantity),
        reason: 'Initial stock',
        hotelId
      }
    });

    res.status(201).json({
      success: true,
      data: item,
      message: "Inventory item created successfully"
    });
  } catch (error) {
    console.error("Error creating inventory item:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create inventory item",
      error: error.message
    });
  }
};

export const updateInventoryItem = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { id } = req.params;
    const { 
      name, 
      quantity, 
      unit, 
      threshold, 
      costPrice, 
      supplierId 
    } = req.body;

    const item = await prisma.inventoryItem.update({
      where: { 
        id,
        hotelId 
      },
      data: {
        name: name || undefined,
        quantity: quantity !== undefined ? parseFloat(quantity) : undefined,
        unit: unit || undefined,
        threshold: threshold !== undefined ? parseFloat(threshold) : undefined,
        costPrice: costPrice !== undefined ? parseFloat(costPrice) : undefined,
        supplierId: supplierId !== undefined ? supplierId : undefined
      },
      include: {
        supplier: true
      }
    });

    res.json({
      success: true,
      data: item,
      message: "Inventory item updated successfully"
    });
  } catch (error) {
    console.error("Error updating inventory item:", error);
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: "Inventory item not found"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to update inventory item",
        error: error.message
      });
    }
  }
};

export const deleteInventoryItem = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { id } = req.params;

    // Check if item has transactions
    const transactions = await prisma.inventoryTransaction.findMany({
      where: { itemId: id }
    });

    if (transactions.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete inventory item with transaction history"
      });
    }

    await prisma.inventoryItem.delete({
      where: { 
        id,
        hotelId 
      }
    });

    res.json({
      success: true,
      message: "Inventory item deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting inventory item:", error);
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: "Inventory item not found"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to delete inventory item",
        error: error.message
      });
    }
  }
};

// ===================== INVENTORY TRANSACTION CONTROLLERS =====================

export const getInventoryTransactions = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { 
      itemId, 
      type, 
      startDate, 
      endDate,
      page = 1,
      limit = 20
    } = req.query;

    const whereClause = { hotelId };
    
    if (itemId) whereClause.itemId = itemId;
    if (type) whereClause.type = type;
    
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = new Date(startDate);
      if (endDate) whereClause.createdAt.lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [transactions, total] = await Promise.all([
      prisma.inventoryTransaction.findMany({
        where: whereClause,
        include: {
          item: {
            select: { name: true, unit: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.inventoryTransaction.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      data: transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Error fetching inventory transactions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch inventory transactions",
      error: error.message
    });
  }
};

export const createInventoryTransaction = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { itemId, type, quantity, reason, reference } = req.body;

    if (!itemId || !type || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Item ID, type, and quantity are required"
      });
    }

    const validTypes = ['IN', 'OUT', 'WASTE', 'ADJUSTMENT'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction type. Must be one of: IN, OUT, WASTE, ADJUSTMENT"
      });
    }

    // Get current item
    const item = await prisma.inventoryItem.findFirst({
      where: { id: itemId, hotelId }
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found"
      });
    }

    // Calculate new quantity
    let newQuantity = item.quantity;
    if (type === 'IN') {
      newQuantity += parseFloat(quantity);
    } else if (type === 'OUT' || type === 'WASTE') {
      newQuantity -= parseFloat(quantity);
      if (newQuantity < 0) {
        return res.status(400).json({
          success: false,
          message: "Insufficient stock for this transaction"
        });
      }
    } else if (type === 'ADJUSTMENT') {
      newQuantity = parseFloat(quantity);
    }

    // Create transaction
    const transaction = await prisma.inventoryTransaction.create({
      data: {
        itemId,
        type,
        quantity: parseFloat(quantity),
        reason: reason || null,
        reference: reference || null,
        hotelId
      }
    });

    // Update item quantity
    await prisma.inventoryItem.update({
      where: { id: itemId },
      data: { quantity: newQuantity }
    });

    res.status(201).json({
      success: true,
      data: transaction,
      message: "Inventory transaction created successfully"
    });
  } catch (error) {
    console.error("Error creating inventory transaction:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create inventory transaction",
      error: error.message
    });
  }
};

export const getLowStockItems = async (req, res) => {
  try {
    const { hotelId } = req.user;

    const lowStockItems = await prisma.inventoryItem.findMany({
      where: {
        hotelId,
        threshold: { not: null },
        quantity: { lte: prisma.inventoryItem.fields.threshold }
      },
      include: {
        supplier: {
          select: { name: true, contact: true, email: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      data: lowStockItems
    });
  } catch (error) {
    console.error("Error fetching low stock items:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch low stock items",
      error: error.message
    });
  }
};

export const adjustInventory = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { itemId, newQuantity, reason } = req.body;

    if (!itemId || newQuantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "Item ID and new quantity are required"
      });
    }

    const item = await prisma.inventoryItem.findFirst({
      where: { id: itemId, hotelId }
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found"
      });
    }

    const adjustmentQuantity = parseFloat(newQuantity) - item.quantity;

    // Create adjustment transaction
    const transaction = await prisma.inventoryTransaction.create({
      data: {
        itemId,
        type: 'ADJUSTMENT',
        quantity: Math.abs(adjustmentQuantity),
        reason: reason || 'Manual adjustment',
        hotelId
      }
    });

    // Update item quantity
    await prisma.inventoryItem.update({
      where: { id: itemId },
      data: { quantity: parseFloat(newQuantity) }
    });

    res.json({
      success: true,
      data: transaction,
      message: "Inventory adjusted successfully"
    });
  } catch (error) {
    console.error("Error adjusting inventory:", error);
    res.status(500).json({
      success: false,
      message: "Failed to adjust inventory",
      error: error.message
    });
  }
};

// ===================== SUPPLIER CONTROLLERS =====================

export const getSuppliers = async (req, res) => {
  try {
    const { hotelId } = req.user;

    const suppliers = await prisma.supplier.findMany({
      where: { hotelId },
      include: {
        items: {
          select: { id: true, name: true, quantity: true }
        },
        purchaseOrders: {
          select: { id: true, status: true, totalAmount: true },
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      data: suppliers
    });
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch suppliers",
      error: error.message
    });
  }
};

export const createSupplier = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { name, contact, email, address, phone, category } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Supplier name is required"
      });
    }

    // Validate category if provided
    const validCategories = ['MAIN', 'SECONDARY', 'EMERGENCY'];
    const cat = category && validCategories.includes(category) ? category : undefined;

    const supplier = await prisma.supplier.create({
      data: {
        name,
        contact: contact || null,
        email: email || null,
        address: address || null,
        phone: phone || null,
        category: cat,
        hotelId
      }
    });

    res.status(201).json({
      success: true,
      data: supplier,
      message: "Supplier created successfully"
    });
  } catch (error) {
    console.error("Error creating supplier:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create supplier",
      error: error.message
    });
  }
};

export const updateSupplier = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { id } = req.params;
    const { name, contact, email, address, phone, category } = req.body;

    const validCategories = ['MAIN', 'SECONDARY', 'EMERGENCY'];

    const supplier = await prisma.supplier.update({
      where: { 
        id,
        hotelId 
      },
      data: {
        name: name || undefined,
        contact: contact !== undefined ? contact : undefined,
        email: email !== undefined ? email : undefined,
        address: address !== undefined ? address : undefined,
        phone: phone !== undefined ? phone : undefined,
        category: category !== undefined ? (validCategories.includes(category) ? category : undefined) : undefined
      }
    });

    res.json({
      success: true,
      data: supplier,
      message: "Supplier updated successfully"
    });
  } catch (error) {
    console.error("Error updating supplier:", error);
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: "Supplier not found"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to update supplier",
        error: error.message
      });
    }
  }
};

export const deleteSupplier = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { id } = req.params;

    // Check if supplier has items
    const items = await prisma.inventoryItem.findMany({
      where: { supplierId: id }
    });

    if (items.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete supplier with associated inventory items"
      });
    }

    await prisma.supplier.delete({
      where: { 
        id,
        hotelId 
      }
    });

    res.json({
      success: true,
      message: "Supplier deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting supplier:", error);
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: "Supplier not found"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to delete supplier",
        error: error.message
      });
    }
  }
};

// ===================== PURCHASE ORDER CONTROLLERS =====================

export const getPurchaseOrders = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { 
      supplierId, 
      status, 
      startDate, 
      endDate,
      page = 1,
      limit = 20
    } = req.query;

    const whereClause = { hotelId };
    
    if (supplierId) whereClause.supplierId = supplierId;
    if (status) whereClause.status = status;
    
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = new Date(startDate);
      if (endDate) whereClause.createdAt.lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where: whereClause,
        include: {
          supplier: {
            select: { name: true, contact: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.purchaseOrder.count({ where: whereClause })
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
    console.error("Error fetching purchase orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch purchase orders",
      error: error.message
    });
  }
};

export const getPurchaseOrder = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { id } = req.params;

    const order = await prisma.purchaseOrder.findFirst({
      where: { 
        id,
        hotelId 
      },
      include: {
        supplier: true
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Purchase order not found"
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error("Error fetching purchase order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch purchase order",
      error: error.message
    });
  }
};

export const createPurchaseOrder = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { 
      supplierId, 
      items, 
      expectedDate, 
      notes 
    } = req.body;

    if (!supplierId || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Supplier ID and items are required"
      });
    }

    // Verify supplier exists
    const supplier = await prisma.supplier.findFirst({
      where: { id: supplierId, hotelId }
    });

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found"
      });
    }

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => {
      return sum + (item.quantity * item.unitPrice);
    }, 0);

    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        supplierId,
        items: JSON.parse(items),
        totalAmount,
        expectedDate: expectedDate ? new Date(expectedDate) : null,
        notes: notes || null,
        hotelId
      },
      include: {
        supplier: true
      }
    });

    res.status(201).json({
      success: true,
      data: purchaseOrder,
      message: "Purchase order created successfully"
    });
  } catch (error) {
    console.error("Error creating purchase order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create purchase order",
      error: error.message
    });
  }
};

export const updatePurchaseOrder = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { id } = req.params;
    const { 
      items, 
      expectedDate, 
      notes 
    } = req.body;

    const updateData = {};
    
    if (items) {
      updateData.items = JSON.parse(items);
      // Recalculate total amount
      const parsedItems = JSON.parse(items);
      updateData.totalAmount = parsedItems.reduce((sum, item) => {
        return sum + (item.quantity * item.unitPrice);
      }, 0);
    }
    
    if (expectedDate !== undefined) {
      updateData.expectedDate = expectedDate ? new Date(expectedDate) : null;
    }
    
    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const purchaseOrder = await prisma.purchaseOrder.update({
      where: { 
        id,
        hotelId 
      },
      data: updateData,
      include: {
        supplier: true
      }
    });

    res.json({
      success: true,
      data: purchaseOrder,
      message: "Purchase order updated successfully"
    });
  } catch (error) {
    console.error("Error updating purchase order:", error);
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: "Purchase order not found"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to update purchase order",
        error: error.message
      });
    }
  }
};

export const updatePurchaseOrderStatus = async (req, res) => {
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

    const validStatuses = ['PENDING', 'CONFIRMED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be one of: PENDING, CONFIRMED, DELIVERED, CANCELLED"
      });
    }

    const updateData = { status };
    
    if (status === 'DELIVERED') {
      updateData.deliveredDate = new Date();
    }

    const purchaseOrder = await prisma.purchaseOrder.update({
      where: { 
        id,
        hotelId 
      },
      data: updateData,
      include: {
        supplier: true
      }
    });

    // If delivered, update inventory
    if (status === 'DELIVERED' && purchaseOrder.items) {
      const items = JSON.parse(purchaseOrder.items);
      
      for (const item of items) {
        await prisma.inventoryTransaction.create({
          data: {
            itemId: item.itemId,
            type: 'IN',
            quantity: item.quantity,
            reason: 'Purchase order delivery',
            reference: purchaseOrder.id,
            hotelId
          }
        });

        // Update item quantity
        const currentItem = await prisma.inventoryItem.findUnique({
          where: { id: item.itemId }
        });

        if (currentItem) {
          await prisma.inventoryItem.update({
            where: { id: item.itemId },
            data: { 
              quantity: currentItem.quantity + item.quantity,
              costPrice: item.unitPrice
            }
          });
        }
      }
    }

    res.json({
      success: true,
      data: purchaseOrder,
      message: "Purchase order status updated successfully"
    });
  } catch (error) {
    console.error("Error updating purchase order status:", error);
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: "Purchase order not found"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to update purchase order status",
        error: error.message
      });
    }
  }
};
