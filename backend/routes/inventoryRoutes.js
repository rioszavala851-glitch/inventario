const express = require('express');
const router = express.Router();
const { updateStock, saveSnapshot, getHistory, getDashboardStats, bulkUpdateStock } = require('../controllers/inventoryController');

router.put('/update', updateStock);
router.post('/bulk-update', bulkUpdateStock);
router.post('/save-snapshot', saveSnapshot);
router.get('/history', getHistory);
router.get('/dashboard', getDashboardStats);

module.exports = router;
