const mongoose = require('mongoose');

const ingredientSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    detail: {
        type: String,
    },
    unit: {
        type: String,
        required: true,
        enum: ['PIEZA', 'PAQUETE', 'MILILITRO', 'LITRO', 'GRAMO', 'KILO'],
    },
    cost: {
        type: Number,
        required: true,
        default: 0,
    },
    stocks: {
        almacen: { type: Number, default: 0 },
        cocina: { type: Number, default: 0 },
        ensalada: { type: Number, default: 0 },
        isla: { type: Number, default: 0 },
    },
    qrCode: {
        type: String,
    },
    active: {
        type: Boolean,
        default: true,
    },
    minStock: {
        type: Number,
        default: 10,
        min: 0,
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Ingredient', ingredientSchema);
