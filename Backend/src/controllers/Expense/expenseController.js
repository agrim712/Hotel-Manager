import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const createExpense = async (req, res) => {
  try {
    const { amount, date, paymentMode, description, categoryId } = req.body;
    const receiptUrl = req.file?.path || null;

    const expense = await prisma.expense.create({
      data: {
        amount: parseFloat(amount),
        date: new Date(date),
        paymentMode,
        description,
        receiptUrl,
        categoryId,
        hotelId: req.user.hotelId,
        createdById: req.user.id
      }
    });

    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    console.error("Create Expense Error:", error);
    res.status(500).json({ success: false, message: "Failed to create expense" });
  }
};

export const getExpenses = async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany({
      where: { hotelId: req.user.hotelId },
      include: { category: true, createdBy: true },
      orderBy: { date: 'desc' }
    });

    res.json({ success: true, data: expenses });
  } catch (error) {
    console.error("Get Expenses Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch expenses" });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    await prisma.expense.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Delete Expense Error:", error);
    res.status(500).json({ success: false, message: "Failed to delete expense" });
  }
};

// TODO: Implement Excel export if needed
export const exportExpenses = async (req, res) => {
  res.status(501).json({ message: "Export to Excel not implemented yet" });
};