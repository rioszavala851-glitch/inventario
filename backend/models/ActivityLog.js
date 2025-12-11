const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        enum: [
            'login', 'logout',
            'create', 'update', 'delete',
            'import', 'export',
            'capture_inventory', 'create_snapshot',
            'change_password', 'update_profile',
            'create_user', 'update_user', 'delete_user',
            'create_role', 'update_role', 'delete_role',
            'other'
        ],
        required: true
    },
    entity: {
        type: String,
        enum: ['user', 'role', 'ingredient', 'inventory', 'snapshot', 'category', 'supplier', 'notification', 'system', 'other'],
        required: true
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId
    },
    entityName: {
        type: String
    },
    description: {
        type: String,
        required: true
    },
    details: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    }
}, {
    timestamps: true
});

// Indexes for faster queries
activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });
activityLogSchema.index({ entity: 1, createdAt: -1 });
activityLogSchema.index({ createdAt: -1 });

// Static method to log activity
activityLogSchema.statics.log = async function (data) {
    try {
        return await this.create(data);
    } catch (error) {
        console.error('Error logging activity:', error);
    }
};

module.exports = mongoose.model('ActivityLog', activityLogSchema);
