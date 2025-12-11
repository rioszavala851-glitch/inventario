const mongoose = require('mongoose');

const snapshotItemSchema = new mongoose.Schema({
    ingredient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ingredient',
        required: true
    },
    name: String,
    sku: String,
    unit: String,
    quantity: {
        type: Number,
        required: true,
        default: 0
    },
    purchasePrice: {
        type: Number,
        default: 0
    },
    totalValue: {
        type: Number,
        default: 0
    }
});

const snapshotSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    area: {
        type: String,
        enum: ['almacen', 'cocina', 'ensalada', 'isla', 'all'],
        default: 'all'
    },
    items: [snapshotItemSchema],
    summary: {
        totalItems: {
            type: Number,
            default: 0
        },
        totalQuantity: {
            type: Number,
            default: 0
        },
        totalValue: {
            type: Number,
            default: 0
        }
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['draft', 'final'],
        default: 'final'
    }
}, {
    timestamps: true
});

// Index for faster queries
snapshotSchema.index({ createdAt: -1 });
snapshotSchema.index({ area: 1 });

module.exports = mongoose.model('Snapshot', snapshotSchema);
