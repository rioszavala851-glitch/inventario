const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    plan: {
        type: String,
        enum: ['monthly', 'annual'],
        required: true,
    },
    status: {
        type: String,
        enum: ['active', 'cancelled', 'expired', 'past_due'],
        default: 'active',
    },
    amount: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        default: 'usd',
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    stripeSubscriptionId: {
        type: String,
        required: true,
    },
    stripeCustomerId: {
        type: String,
        required: true,
    },
    stripePriceId: {
        type: String,
        required: true,
    },
    cancelAtPeriodEnd: {
        type: Boolean,
        default: false,
    },
    cancelledAt: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
