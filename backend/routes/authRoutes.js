const express = require('express');
const router = express.Router();
const {
    authUser,
    registerUser,
    getMe,
    loginValidation,
    registerValidation
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes with validation
router.post('/login', loginValidation, authUser);
router.post('/register', registerValidation, registerUser);

// Protected routes
router.get('/me', protect, getMe);

module.exports = router;
