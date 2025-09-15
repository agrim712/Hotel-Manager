import pkg from "@prisma/client";
const { PrismaClient } = pkg;


import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

// ===================== MENU CATEGORY CONTROLLERS =====================

export const getMenuCategories = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const categories = await prisma.menuCategory.findMany({
      where: { hotelId },
      include: {
        menuItems: {
          include: {
            images: true,
            modifiers: true
          },
          orderBy: { sortOrder: 'asc' }
        }
      },
      orderBy: { sortOrder: 'asc' }
    });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error("Error fetching menu categories:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch menu categories",
      error: error.message
    });
  }
};

export const createMenuCategory = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { name, description, sortOrder } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required"
      });
    }

    const category = await prisma.menuCategory.create({
      data: {
        name,
        description: description || null,
        sortOrder: sortOrder || 0,
        hotelId
      }
    });

    res.status(201).json({
      success: true,
      data: category,
      message: "Category created successfully"
    });
  } catch (error) {
    console.error("Error creating menu category:", error);
    if (error.code === 'P2002') {
      res.status(400).json({
        success: false,
        message: "Category name already exists"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to create category",
        error: error.message
      });
    }
  }
};

export const updateMenuCategory = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { id } = req.params;
    const { name, description, sortOrder, isActive } = req.body;

    const category = await prisma.menuCategory.update({
      where: { 
        id,
        hotelId 
      },
      data: {
        name,
        description: description || null,
        sortOrder: sortOrder || 0,
        isActive: isActive !== undefined ? isActive : true
      }
    });

    res.json({
      success: true,
      data: category,
      message: "Category updated successfully"
    });
  } catch (error) {
    console.error("Error updating menu category:", error);
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: "Category not found"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to update category",
        error: error.message
      });
    }
  }
};

export const deleteMenuCategory = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { id } = req.params;

    // Check if category has items
    const categoryWithItems = await prisma.menuCategory.findUnique({
      where: { id },
      include: { menuItems: true }
    });

    if (categoryWithItems.menuItems.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete category with existing items. Please delete all items first."
      });
    }

    await prisma.menuCategory.delete({
      where: { 
        id,
        hotelId 
      }
    });

    res.json({
      success: true,
      message: "Category deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting menu category:", error);
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: "Category not found"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to delete category",
        error: error.message
      });
    }
  }
};

// ===================== MENU ITEM CONTROLLERS =====================

export const getMenuItems = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { categoryId, isAvailable } = req.query;

    const whereClause = { hotelId };
    if (categoryId) whereClause.categoryId = categoryId;
    if (isAvailable !== undefined) whereClause.isAvailable = isAvailable === 'true';

    const items = await prisma.menuItem.findMany({
      where: whereClause,
      include: {
        category: true,
        images: true,
        modifiers: true,
        combos: true
      },
      orderBy: { sortOrder: 'asc' }
    });

    res.json({
      success: true,
      data: items
    });
  } catch (error) {
    console.error("Error fetching menu items:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch menu items",
      error: error.message
    });
  }
};

export const getMenuItem = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { id } = req.params;

    const item = await prisma.menuItem.findFirst({
      where: { 
        id,
        hotelId 
      },
      include: {
        category: true,
        images: true,
        modifiers: true,
        combos: true
      }
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found"
      });
    }

    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error("Error fetching menu item:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch menu item",
      error: error.message
    });
  }
};

export const createMenuItem = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { 
      name, 
      description, 
      basePrice, 
      categoryId, 
      prepTime, 
      spiceLevel, 
      allergens, 
      vegetarian, 
      calories,
      sortOrder 
    } = req.body;

    if (!name || !basePrice || !categoryId) {
      return res.status(400).json({
        success: false,
        message: "Name, price, and category are required"
      });
    }

    // Verify category exists
    const category = await prisma.menuCategory.findFirst({
      where: { id: categoryId, hotelId }
    });

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category not found"
      });
    }

    const item = await prisma.menuItem.create({
      data: {
        name,
        description: description || null,
        basePrice: parseFloat(basePrice),
        categoryId,
        hotelId,
        prepTime: prepTime ? parseInt(prepTime) : 15,
        spiceLevel: spiceLevel || "Mild",
        allergens: allergens ? JSON.parse(allergens) : [],
        vegetarian: vegetarian === 'true' || vegetarian === true,
        calories: calories ? parseInt(calories) : null,
        sortOrder: sortOrder || 0
      }
    });

    // Handle image uploads
    if (req.files && req.files.length > 0) {
      const imagePromises = req.files.map((file, index) => 
        prisma.menuItemImage.create({
          data: {
            url: `/uploads/${file.filename}`,
            altText: description || name,
            isPrimary: index === 0,
            itemId: item.id
          }
        })
      );
      await Promise.all(imagePromises);
    }

    // Return item with images
    const itemWithImages = await prisma.menuItem.findUnique({
      where: { id: item.id },
      include: {
        category: true,
        images: true,
        modifiers: true
      }
    });

    res.status(201).json({
      success: true,
      data: itemWithImages,
      message: "Menu item created successfully"
    });
  } catch (error) {
    console.error("Error creating menu item:", error);
    if (error.code === 'P2002') {
      res.status(400).json({
        success: false,
        message: "Menu item name already exists in this category"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to create menu item",
        error: error.message
      });
    }
  }
};

export const updateMenuItem = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { id } = req.params;
    const updates = req.body;

    const parsedUpdates = {
      name: updates.name,
      description: updates.description || null,
      basePrice: updates.basePrice ? parseFloat(updates.basePrice) : undefined,
      prepTime: updates.prepTime ? parseInt(updates.prepTime) : undefined,
      spiceLevel: updates.spiceLevel || "Mild",
      allergens: updates.allergens ? JSON.parse(updates.allergens) : [],
      vegetarian: updates.vegetarian === 'true' || updates.vegetarian === true,
      calories: updates.calories ? parseInt(updates.calories) : null,
      sortOrder: updates.sortOrder || 0,
      isAvailable: updates.isAvailable !== undefined ? updates.isAvailable : true
    };

    const item = await prisma.menuItem.update({
      where: { 
        id,
        hotelId 
      },
      data: parsedUpdates
    });

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      // Mark old images as non-primary
      await prisma.menuItemImage.updateMany({
        where: { itemId: item.id },
        data: { isPrimary: false }
      });

      // Add new images
      const imagePromises = req.files.map((file, index) => 
        prisma.menuItemImage.create({
          data: {
            url: `/uploads/${file.filename}`,
            altText: parsedUpdates.description || parsedUpdates.name || item.name,
            isPrimary: index === 0,
            itemId: item.id
          }
        })
      );
      await Promise.all(imagePromises);
    }

    // Return updated item with images
    const updatedItem = await prisma.menuItem.findUnique({
      where: { id: item.id },
      include: {
        category: true,
        images: true,
        modifiers: true
      }
    });

    res.json({
      success: true,
      data: updatedItem,
      message: "Menu item updated successfully"
    });
  } catch (error) {
    console.error("Error updating menu item:", error);
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: "Menu item not found"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to update menu item",
        error: error.message
      });
    }
  }
};

export const deleteMenuItem = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { id } = req.params;

    // Check if item is used in any orders
    const orderItems = await prisma.orderItem.findMany({
      where: { itemId: parseInt(id) }
    });

    if (orderItems.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete menu item that has been ordered. Consider marking as unavailable instead."
      });
    }

    // Delete images first
    const images = await prisma.menuItemImage.findMany({
      where: { itemId: id }
    });

    // Delete image files
    images.forEach(image => {
      const imagePath = path.join(process.cwd(), 'uploads', path.basename(image.url));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    });

    await prisma.menuItemImage.deleteMany({
      where: { itemId: id }
    });

    // Delete modifiers
    await prisma.menuModifier.deleteMany({
      where: { itemId: id }
    });

    // Delete the item
    await prisma.menuItem.delete({
      where: { 
        id,
        hotelId 
      }
    });

    res.json({
      success: true,
      message: "Menu item deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting menu item:", error);
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: "Menu item not found"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to delete menu item",
        error: error.message
      });
    }
  }
};

// ===================== MENU MODIFIER CONTROLLERS =====================

export const getMenuModifiers = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { itemId } = req.query;

    const whereClause = { hotelId };
    if (itemId) whereClause.itemId = itemId;

    const modifiers = await prisma.menuModifier.findMany({
      where: whereClause,
      include: {
        item: {
          select: { name: true, category: { select: { name: true } } }
        }
      }
    });

    res.json({
      success: true,
      data: modifiers
    });
  } catch (error) {
    console.error("Error fetching menu modifiers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch menu modifiers",
      error: error.message
    });
  }
};

export const createMenuModifier = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { name, price, type, isRequired, itemId } = req.body;

    if (!name || !price || !type || !itemId) {
      return res.status(400).json({
        success: false,
        message: "Name, price, type, and item ID are required"
      });
    }

    // Verify item exists
    const item = await prisma.menuItem.findFirst({
      where: { id: itemId, hotelId }
    });

    if (!item) {
      return res.status(400).json({
        success: false,
        message: "Menu item not found"
      });
    }

    const modifier = await prisma.menuModifier.create({
      data: {
        name,
        price: parseFloat(price),
        type,
        isRequired: isRequired === 'true' || isRequired === true,
        itemId,
        hotelId
      }
    });

    res.status(201).json({
      success: true,
      data: modifier,
      message: "Menu modifier created successfully"
    });
  } catch (error) {
    console.error("Error creating menu modifier:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create menu modifier",
      error: error.message
    });
  }
};

export const updateMenuModifier = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { id } = req.params;
    const { name, price, type, isRequired } = req.body;

    const modifier = await prisma.menuModifier.update({
      where: { 
        id,
        hotelId 
      },
      data: {
        name,
        price: price ? parseFloat(price) : undefined,
        type,
        isRequired: isRequired !== undefined ? isRequired : false
      }
    });

    res.json({
      success: true,
      data: modifier,
      message: "Menu modifier updated successfully"
    });
  } catch (error) {
    console.error("Error updating menu modifier:", error);
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: "Menu modifier not found"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to update menu modifier",
        error: error.message
      });
    }
  }
};

export const deleteMenuModifier = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { id } = req.params;

    await prisma.menuModifier.delete({
      where: { 
        id,
        hotelId 
      }
    });

    res.json({
      success: true,
      message: "Menu modifier deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting menu modifier:", error);
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: "Menu modifier not found"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to delete menu modifier",
        error: error.message
      });
    }
  }
};

// ===================== COMBO ITEM CONTROLLERS =====================

export const getComboItems = async (req, res) => {
  try {
    const { hotelId } = req.user;

    const combos = await prisma.comboItem.findMany({
      where: { hotelId },
      include: {
        menuItems: {
          select: { id: true, name: true, basePrice: true }
        }
      }
    });

    res.json({
      success: true,
      data: combos
    });
  } catch (error) {
    console.error("Error fetching combo items:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch combo items",
      error: error.message
    });
  }
};

export const createComboItem = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { name, description, price, items } = req.body;

    if (!name || !price || !items) {
      return res.status(400).json({
        success: false,
        message: "Name, price, and items are required"
      });
    }

    const combo = await prisma.comboItem.create({
      data: {
        name,
        description: description || null,
        price: parseFloat(price),
        items: JSON.parse(items),
        hotelId
      }
    });

    res.status(201).json({
      success: true,
      data: combo,
      message: "Combo item created successfully"
    });
  } catch (error) {
    console.error("Error creating combo item:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create combo item",
      error: error.message
    });
  }
};

export const updateComboItem = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { id } = req.params;
    const { name, description, price, items } = req.body;

    const combo = await prisma.comboItem.update({
      where: { 
        id,
        hotelId 
      },
      data: {
        name,
        description: description || null,
        price: price ? parseFloat(price) : undefined,
        items: items ? JSON.parse(items) : undefined
      }
    });

    res.json({
      success: true,
      data: combo,
      message: "Combo item updated successfully"
    });
  } catch (error) {
    console.error("Error updating combo item:", error);
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: "Combo item not found"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to update combo item",
        error: error.message
      });
    }
  }
};

export const deleteComboItem = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { id } = req.params;

    await prisma.comboItem.delete({
      where: { 
        id,
        hotelId 
      }
    });

    res.json({
      success: true,
      message: "Combo item deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting combo item:", error);
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: "Combo item not found"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to delete combo item",
        error: error.message
      });
    }
  }
};
