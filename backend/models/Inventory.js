const mongoose = require('mongoose');

// This model represents a "Snapshot" or "History Record" of the inventory at a point in time
const inventorySchema = mongoose.Schema({
    date: {
        type: Date,
        default: Date.now,
    },
    items: [{
        ingredient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Ingredient',
        },
        name: String,
        unit: String,
        cost: Number,
        totalQuantity: Number, // Sum of all areas
        totalValue: Number,    // cost * totalQuantity
        breakdown: {
            almacen: Number,
            cocina: Number,
            ensalada: Number,
            isla: Number,
        }
    }],
    totalInventoryValue: {
        type: Number,
        default: 0,
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Inventory', inventorySchema);
