const express = require('express');
const router = express.Router();
const {
    exportData,
    importData,
    getBackupStatus
} = require('../controllers/backupController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// All routes require authentication and admin role
router.use(protect);
router.use(isAdmin);

router.get('/status', getBackupStatus);
router.get('/export', exportData);
router.post('/import', importData);

module.exports = router;
