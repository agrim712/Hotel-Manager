import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    const category = await prisma.expenseCategory.create({
      data: {
        name,
        hotelId: req.user.hotelId
      }
    });

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    console.error("Create Category Error:", error);
    res.status(500).json({ success: false, message: "Failed to create category" });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await prisma.expenseCategory.findMany({
      where: { hotelId: req.user.hotelId }
    });

    res.json({ success: true, data: categories });
  } catch (error) {
    console.error("Get Categories Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch categories" });
  }

};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Optional: check if the category belongs to user's hotel
    const category = await prisma.expenseCategory.findUnique({
      where: { id },
    });

    if (!category || category.hotelId !== req.user.hotelId) {
      return res.status(404).json({ success: false, message: "Category not found or unauthorized" });
    }

    // Optional: ensure no expenses exist under this category
    const hasExpenses = await prisma.expense.findFirst({
      where: { categoryId: id },
    });

    if (hasExpenses) {
      return res
        .status(400)
        .json({ success: false, message: "Cannot delete category with associated expenses" });
    }

    await prisma.expenseCategory.delete({
      where: { id },
    });

    res.json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    console.error("Delete Category Error:", error);
    res.status(500).json({ success: false, message: "Failed to delete category" });
  }
};