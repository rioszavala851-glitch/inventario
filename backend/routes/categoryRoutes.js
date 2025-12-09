const express = require('express');
const router = express.Router();
const {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
} = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/checkPermission');

// All routes require authentication
router.use(protect);

// Get all categories
router.get('/', getCategories);

// Get category by ID
router.get('/:id', getCategoryById);

// Create category (admin only)
router.post('/', checkPermission('manage_ingredients'), createCategory);

// Update category (admin only)
router.put('/:id', checkPermission('manage_ingredients'), updateCategory);

// Delete category (admin only)
router.delete('/:id', checkPermission('manage_ingredients'), deleteCategory);

module.exports = router;
