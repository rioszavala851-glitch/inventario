const express = require('express');
const router = express.Router();
const {
    getActivityLogs,
    getActivitySummary,
    getEntityActivity
} = require('../controllers/activityController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// All routes require authentication and admin role
router.use(protect);
router.use(isAdmin);

router.get('/', getActivityLogs);
router.get('/summary', getActivitySummary);
router.get('/entity/:entityType/:entityId', getEntityActivity);

module.exports = router;
