const express = require('express');
const router = express.Router();
const {
    getUsers,
    createUser,
    deleteUser,
    updateProfile,
    changePassword,
    updateUser
} = require('../controllers/userController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

console.log('✅ userRoutes.js loaded successfully');

// Profile routes - require only authentication
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);

// Admin routes - require authentication AND admin role
router.get('/', protect, isAdmin, getUsers);
router.post('/', protect, isAdmin, createUser);
router.put('/:id', protect, isAdmin, updateUser);
router.delete('/:id', protect, isAdmin, deleteUser);

console.log('✅ User routes registered');

module.exports = router;
