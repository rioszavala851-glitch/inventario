const express = require('express');
const router = express.Router();
const {
    getSuppliers,
    getSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier,
} = require('../controllers/supplierController');
const { protect } = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/checkPermission');

// All routes require authentication
router.use(protect);

// Get all suppliers
router.get('/', getSuppliers);

// Get supplier by ID
router.get('/:id', getSupplierById);

// Create supplier (admin only)
router.post('/', checkPermission('manage_ingredients'), createSupplier);

// Update supplier (admin only)
router.put('/:id', checkPermission('manage_ingredients'), updateSupplier);

// Delete supplier (admin only)
router.delete('/:id', checkPermission('manage_ingredients'), deleteSupplier);

module.exports = router;
