const express = require('express');
const router = express.Router();
const {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    checkLowStock,
    createNotification
} = require('../controllers/notificationController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// User routes
router.get('/', getNotifications);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);
router.delete('/', clearAllNotifications);

// Admin routes
router.post('/', isAdmin, createNotification);
router.post('/check-stock', isAdmin, checkLowStock);

module.exports = router;
