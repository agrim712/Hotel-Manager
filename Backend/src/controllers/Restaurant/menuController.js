import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get all categories with their items
export const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.R_Category.findMany({
      include: {
        items: true
      }
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

// Create a new category
export const createCategory = async (req, res) => {
  const { name, description } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  try {
    const category = await prisma.R_Category.create({
      data: {
        name,
        description: description || null
      }
    });
    res.status(201).json(category);
  } catch (error) {
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Category name must be unique' });
    } else {
      res.status(500).json({ error: 'Failed to create category' });
    }
  }
};

// Add item to a category
export const addItemToCategory = async (req, res) => {
  const { categoryId } = req.params;
  const { 
    name, 
    price, 
    description, 
    spiceLevel, 
    allergens, 
    vegetarian, 
    available, 
    prepTime 
  } = req.body;

  if (!name || !price) {
    return res.status(400).json({ error: 'Name and price are required' });
  }

  try {
    const item = await prisma.R_Item.create({
      data: {
        name,
        price: parseFloat(price),
        description: description || null,
        spiceLevel: spiceLevel || 'Mild',
        allergens: allergens || [],
        vegetarian: vegetarian || false,
        available: available !== false, // default to true
        prepTime: prepTime || 15,
        categoryId: parseInt(categoryId)
      }
    });
    res.status(201).json(item);
  } catch (error) {
    if (error.code === 'P2003') {
      res.status(404).json({ error: 'Category not found' });
    } else if (error.code === 'P2002') {
      res.status(400).json({ error: 'Item name must be unique within this category' });
    } else {
      res.status(500).json({ error: 'Failed to add item' });
    }
  }
};

// Update an item
export const updateItem = async (req, res) => {
  const { itemId } = req.params;
  const updates = req.body;

  try {
    const item = await prisma.R_Item.update({
      where: { id: parseInt(itemId) },
      data: updates
    });
    res.json(item);
  } catch (error) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Item not found' });
    } else {
      res.status(500).json({ error: 'Failed to update item' });
    }
  }
};

// Delete an item
export const deleteItem = async (req, res) => {
  const { itemId } = req.params;

  try {
    await prisma.R_Item.delete({
      where: { id: parseInt(itemId) }
    });
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Item not found' });
    } else {
      res.status(500).json({ error: 'Failed to delete item' });
    }
  }
};

// Delete a category (and its items)
export const deleteCategory = async (req, res) => {
  const { categoryId } = req.params;

  try {
    // First delete all items in the category
    await prisma.R_Item.deleteMany({
      where: { categoryId: parseInt(categoryId) }
    });
    
    // Then delete the category
    await prisma.R_Category.delete({
      where: { id: parseInt(categoryId) }
    });
    
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Category not found' });
    } else {
      res.status(500).json({ error: 'Failed to delete category' });
    }
  }
};
