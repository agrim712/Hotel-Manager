import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();
// ===================== COUPON CONTROLLERS =====================

export const getCoupons = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { 
      isActive, 
      type, 
      startDate, 
      endDate,
      page = 1,
      limit = 20
    } = req.query;

    const whereClause = { hotelId };
    
    if (isActive !== undefined) whereClause.isActive = isActive === 'true';
    if (type) whereClause.type = type;
    
    if (startDate || endDate) {
      whereClause.validFrom = {};
      if (startDate) whereClause.validFrom.gte = new Date(startDate);
      if (endDate) whereClause.validFrom.lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [coupons, total] = await Promise.all([
      prisma.coupon.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.coupon.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      data: coupons,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch coupons",
      error: error.message
    });
  }
};

export const getCoupon = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { id } = req.params;

    const coupon = await prisma.coupon.findFirst({
      where: { 
        id,
        hotelId 
      }
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found"
      });
    }

    res.json({
      success: true,
      data: coupon
    });
  } catch (error) {
    console.error("Error fetching coupon:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch coupon",
      error: error.message
    });
  }
};

export const createCoupon = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { 
      code, 
      name, 
      type, 
      value, 
      minOrderAmount, 
      maxDiscount, 
      usageLimit, 
      validFrom, 
      validTo 
    } = req.body;

    if (!code || !name || !type || !value || !validFrom || !validTo) {
      return res.status(400).json({
        success: false,
        message: "Code, name, type, value, valid from, and valid to are required"
      });
    }

    const validTypes = ['PERCENTAGE', 'FLAT', 'BUY_X_GET_Y'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid coupon type. Must be one of: PERCENTAGE, FLAT, BUY_X_GET_Y"
      });
    }

    // Check if code already exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code }
    });

    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: "Coupon code already exists"
      });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code,
        name,
        type,
        value: parseFloat(value),
        minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : null,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        validFrom: new Date(validFrom),
        validTo: new Date(validTo),
        hotelId
      }
    });

    res.status(201).json({
      success: true,
      data: coupon,
      message: "Coupon created successfully"
    });
  } catch (error) {
    console.error("Error creating coupon:", error);
    if (error.code === 'P2002') {
      res.status(400).json({
        success: false,
        message: "Coupon code already exists"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to create coupon",
        error: error.message
      });
    }
  }
};

export const updateCoupon = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { id } = req.params;
    const { 
      code, 
      name, 
      type, 
      value, 
      minOrderAmount, 
      maxDiscount, 
      usageLimit, 
      validFrom, 
      validTo, 
      isActive 
    } = req.body;

    // Check if new code already exists (excluding current coupon)
    if (code) {
      const existingCoupon = await prisma.coupon.findFirst({
        where: {
          code,
          NOT: { id }
        }
      });

      if (existingCoupon) {
        return res.status(400).json({
          success: false,
          message: "Coupon code already exists"
        });
      }
    }

    const updateData = {};
    
    if (code) updateData.code = code;
    if (name) updateData.name = name;
    if (type) updateData.type = type;
    if (value !== undefined) updateData.value = parseFloat(value);
    if (minOrderAmount !== undefined) updateData.minOrderAmount = minOrderAmount ? parseFloat(minOrderAmount) : null;
    if (maxDiscount !== undefined) updateData.maxDiscount = maxDiscount ? parseFloat(maxDiscount) : null;
    if (usageLimit !== undefined) updateData.usageLimit = usageLimit ? parseInt(usageLimit) : null;
    if (validFrom) updateData.validFrom = new Date(validFrom);
    if (validTo) updateData.validTo = new Date(validTo);
    if (isActive !== undefined) updateData.isActive = isActive;

    const coupon = await prisma.coupon.update({
      where: { 
        id,
        hotelId 
      },
      data: updateData
    });

    res.json({
      success: true,
      data: coupon,
      message: "Coupon updated successfully"
    });
  } catch (error) {
    console.error("Error updating coupon:", error);
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: "Coupon not found"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to update coupon",
        error: error.message
      });
    }
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { id } = req.params;

    // Check if coupon has been used
    const coupon = await prisma.coupon.findFirst({
      where: { id, hotelId }
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found"
      });
    }

    if (coupon.usedCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete coupon that has been used"
      });
    }

    await prisma.coupon.delete({
      where: { 
        id,
        hotelId 
      }
    });

    res.json({
      success: true,
      message: "Coupon deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: "Coupon not found"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to delete coupon",
        error: error.message
      });
    }
  }
};

export const validateCoupon = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { code, orderAmount } = req.body;

    if (!code || !orderAmount) {
      return res.status(400).json({
        success: false,
        message: "Coupon code and order amount are required"
      });
    }

    const coupon = await prisma.coupon.findFirst({
      where: { 
        code,
        hotelId,
        isActive: true
      }
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Invalid coupon code"
      });
    }

    // Check validity dates
    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validTo) {
      return res.status(400).json({
        success: false,
        message: "Coupon has expired"
      });
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: "Coupon usage limit exceeded"
      });
    }

    // Check minimum order amount
    if (coupon.minOrderAmount && parseFloat(orderAmount) < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ${coupon.minOrderAmount} required`
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.type === 'PERCENTAGE') {
      discountAmount = (parseFloat(orderAmount) * coupon.value) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else if (coupon.type === 'FLAT') {
      discountAmount = coupon.value;
    }

    res.json({
      success: true,
      data: {
        coupon: {
          id: coupon.id,
          code: coupon.code,
          name: coupon.name,
          type: coupon.type,
          value: coupon.value
        },
        discountAmount,
        finalAmount: parseFloat(orderAmount) - discountAmount
      },
      message: "Coupon is valid"
    });
  } catch (error) {
    console.error("Error validating coupon:", error);
    res.status(500).json({
      success: false,
      message: "Failed to validate coupon",
      error: error.message
    });
  }
};

export const updateCouponUsage = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { id } = req.params;

    const coupon = await prisma.coupon.findFirst({
      where: { id, hotelId }
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found"
      });
    }

    // Check if usage limit exceeded
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: "Coupon usage limit exceeded"
      });
    }

    const updatedCoupon = await prisma.coupon.update({
      where: { id },
      data: {
        usedCount: coupon.usedCount + 1
      }
    });

    res.json({
      success: true,
      data: updatedCoupon,
      message: "Coupon usage updated successfully"
    });
  } catch (error) {
    console.error("Error updating coupon usage:", error);
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: "Coupon not found"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to update coupon usage",
        error: error.message
      });
    }
  }
};
