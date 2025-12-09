const express = require('express');
const router = express.Router();
const {
    getSubscriptionStatus,
    createCheckoutSession,
    handleWebhook,
    cancelSubscription,
    getBillingHistory,
} = require('../controllers/subscriptionController');
const { protect } = require('../middleware/authMiddleware');

// Get subscription status
router.get('/status', protect, getSubscriptionStatus);

// Create checkout session
router.post('/create-checkout', protect, createCheckoutSession);

// Cancel subscription
router.post('/cancel', protect, cancelSubscription);

// Get billing history
router.get('/billing-history', protect, getBillingHistory);

// Stripe webhook (no auth required, verified by Stripe signature)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

module.exports = router;
