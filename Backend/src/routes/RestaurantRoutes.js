import express from "express";
import {addItemToCategory,updateItem,deleteItem,getAllCategories,createCategory,deleteCategory} from '../../src/controllers/Restaurant/menuController.js';
const router = express.Router();

// Category routes
router.get('/categories', getAllCategories);
router.post('/categories', createCategory);
router.delete('/categories/:categoryId', deleteCategory);

// Item routes
router.post('/categories/:categoryId/items', addItemToCategory);
router.put('/items/:itemId', updateItem);
router.delete('/items/:itemId', deleteItem);

export default router;