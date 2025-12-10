const mongoose = require('mongoose');

const activitySchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    action: {
        type: String,
        required: true, // e.g., 'STOCK_UPDATE', 'SNAPSHOT_CREATED', 'LOGIN'
    },
    description: {
        type: String, // e.g., 'Actualización de inventario en Almacén'
    },
    details: {
        area: String,
        itemCount: Number,
        totalValue: Number
    },
    timestamp: {
        type: Date,
        default: Date.now,
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Activity', activitySchema);
