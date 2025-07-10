import express from 'express';
import { auth, authorizeRoles } from '../middleware/auth.js';
import multer from 'multer';
import {
  createExpense,
  getExpenses,
  deleteExpense,
  exportExpenses
} from '../controllers/Expense/expenseController.js';

import {
  createCategory,
  getCategories,
  deleteCategory
} from '../controllers/Expense/categoryController.js';

const router = express.Router();

// Receipt upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/receipts'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Category Routes
router.post('/category', auth, authorizeRoles('HOTELADMIN'), createCategory);
router.get('/category', auth, authorizeRoles('HOTELADMIN'), getCategories);

// Expense Routes
router.post('/add', auth, authorizeRoles('HOTELADMIN'), upload.single('receipt'), createExpense);
router.get('/', auth, authorizeRoles('HOTELADMIN'), getExpenses);
router.delete('/:id', auth, authorizeRoles('HOTELADMIN'), deleteExpense);
router.get('/export', auth, authorizeRoles('HOTELADMIN'), exportExpenses);
router.delete('/category/:id', auth, authorizeRoles('HOTELADMIN'), deleteCategory);


export default router;