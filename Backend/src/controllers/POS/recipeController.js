import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

// ===================== RECIPE CONTROLLERS =====================

export const getRecipes = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { menuItemId } = req.query;

    const where = { hotelId };
    if (menuItemId) where.menuItemId = menuItemId;

    const recipes = await prisma.recipe.findMany({
      where,
      include: {
        menuItem: { select: { id: true, name: true } },
        items: {
          include: {
            inventoryItem: { select: { id: true, name: true, unit: true } },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({ success: true, data: recipes });
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch recipes', error: error.message });
  }
};

export const getRecipe = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { id } = req.params;

    const recipe = await prisma.recipe.findFirst({
      where: { id, hotelId },
      include: {
        menuItem: true,
        items: { include: { inventoryItem: true } },
      },
    });

    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    res.json({ success: true, data: recipe });
  } catch (error) {
    console.error('Error fetching recipe:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch recipe', error: error.message });
  }
};

export const createRecipe = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { menuItemId, steps, items } = req.body;

    if (!menuItemId || !items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'menuItemId and items are required' });
    }

    // Verify menu item exists and belongs to hotel
    const menuItem = await prisma.menuItem.findFirst({ where: { id: menuItemId, hotelId } });
    if (!menuItem) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }

    // Ensure no existing recipe for this menu item
    const existing = await prisma.recipe.findFirst({ where: { menuItemId, hotelId } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Recipe already exists for this menu item' });
    }

    // Validate inventory items
    const inventoryIds = items.map((it) => it.inventoryItemId);
    const invItems = await prisma.inventoryItem.findMany({ where: { id: { in: inventoryIds }, hotelId } });
    if (invItems.length !== inventoryIds.length) {
      return res.status(400).json({ success: false, message: 'Some inventory items not found' });
    }

    const recipe = await prisma.recipe.create({
      data: {
        menuItemId,
        steps: steps || null,
        hotelId,
        items: {
          create: items.map((it) => ({
            inventoryItemId: it.inventoryItemId,
            quantity: parseFloat(it.quantity),
            unit: it.unit || null,
          })),
        },
      },
      include: {
        menuItem: true,
        items: { include: { inventoryItem: true } },
      },
    });

    res.status(201).json({ success: true, data: recipe, message: 'Recipe created successfully' });
  } catch (error) {
    console.error('Error creating recipe:', error);
    res.status(500).json({ success: false, message: 'Failed to create recipe', error: error.message });
  }
};

export const updateRecipe = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { id } = req.params;
    const { steps, items } = req.body;

    // Ensure recipe exists and belongs to hotel
    const recipe = await prisma.recipe.findFirst({ where: { id, hotelId } });
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    // If items provided, validate and replace existing items
    if (items) {
      const inventoryIds = items.map((it) => it.inventoryItemId);
      const invItems = await prisma.inventoryItem.findMany({ where: { id: { in: inventoryIds }, hotelId } });
      if (invItems.length !== inventoryIds.length) {
        return res.status(400).json({ success: false, message: 'Some inventory items not found' });
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (items) {
        await tx.recipeItem.deleteMany({ where: { recipeId: id } });
      }

      return tx.recipe.update({
        where: { id },
        data: {
          steps: steps !== undefined ? steps : undefined,
          ...(items && {
            items: {
              create: items.map((it) => ({
                inventoryItemId: it.inventoryItemId,
                quantity: parseFloat(it.quantity),
                unit: it.unit || null,
              })),
            },
          }),
        },
        include: { menuItem: true, items: { include: { inventoryItem: true } } },
      });
    });

    res.json({ success: true, data: updated, message: 'Recipe updated successfully' });
  } catch (error) {
    console.error('Error updating recipe:', error);
    res.status(500).json({ success: false, message: 'Failed to update recipe', error: error.message });
  }
};

export const deleteRecipe = async (req, res) => {
  try {
    const { hotelId } = req.user;
    const { id } = req.params;

    // Ensure recipe exists
    const recipe = await prisma.recipe.findFirst({ where: { id, hotelId } });
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    await prisma.recipeItem.deleteMany({ where: { recipeId: id } });
    await prisma.recipe.delete({ where: { id } });

    res.json({ success: true, message: 'Recipe deleted successfully' });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    res.status(500).json({ success: false, message: 'Failed to delete recipe', error: error.message });
  }
};
