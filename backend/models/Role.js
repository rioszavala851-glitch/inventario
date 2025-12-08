const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    displayName: {
        type: String,
        required: true
    },
    permissions: [{
        type: String,
        enum: [
            'view_dashboard',
            'manage_ingredients',
            'capture_inventory',
            'view_history',
            'manage_users',
            'manage_roles',
            'view_reports'
        ]
    }],
    color: {
        type: String,
        default: '#6366f1'
    },
    icon: {
        type: String,
        default: 'Box'
    },
    isSystem: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Role', roleSchema);
