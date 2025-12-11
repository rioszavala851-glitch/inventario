const express = require('express');
const router = express.Router();
const {
    getSummaryReport,
    getConsumptionReport,
    getTrendsReport,
    getCategoryReport
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// Report routes
router.get('/summary', getSummaryReport);
router.get('/consumption', getConsumptionReport);
router.get('/trends', getTrendsReport);
router.get('/categories', getCategoryReport);

module.exports = router;
