const express = require('express');
const router = express.Router();
const { getUsers, createUser, deleteUser } = require('../controllers/userController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

console.log('✅ userRoutes.js loaded successfully');

// Protect all user routes - require authentication and admin role
router.use(protect);
router.use(isAdmin);

router.route('/')
    .get(getUsers)
    .post(createUser);

router.route('/:id')
    .delete(deleteUser);

console.log('✅ User routes registered');

module.exports = router;
