const express = require('express');
const router = express.Router();
const {
    authUser,
    registerUser,
    getMe
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/login', authUser);
router.post('/register', registerUser);

// Protected routes
router.get('/me', protect, getMe);

module.exports = router;
