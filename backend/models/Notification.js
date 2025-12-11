const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['low_stock', 'info', 'warning', 'success', 'system'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isGlobal: {
        type: Boolean,
        default: false
    },
    read: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date
    },
    link: {
        type: String
    }
}, {
    timestamps: true
});

// Index for faster queries
notificationSchema.index({ user: 1, read: 1, createdAt: -1 });
notificationSchema.index({ isGlobal: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
