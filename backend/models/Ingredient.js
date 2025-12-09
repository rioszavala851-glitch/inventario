const mongoose = require('mongoose');

const ingredientSchema = mongoose.Schema({
    // Basic Information
    name: {
        type: String,
        required: true,
    },
    detail: {
        type: String,
    },

    // Identifiers
    sku: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
    },
    barcode: {
        type: String,
        trim: true,
    },
    qrCode: {
        type: String,
    },

    // Categorization
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
    },
    subcategory: {
        type: String,
        trim: true,
    },

    // Product Details
    brand: {
        type: String,
        trim: true,
    },
    model: {
        type: String,
        trim: true,
    },
    color: {
        type: String,
        trim: true,
    },
    size: {
        type: String,
        trim: true,
    },
    image: {
        type: String, // URL or path to image
    },

    // Measurement
    unit: {
        type: String,
        required: true,
        enum: ['PIEZA', 'PAQUETE', 'MILILITRO', 'LITRO', 'GRAMO', 'KILO'],
    },

    // Pricing
    purchasePrice: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
    },
    salePrice: {
        type: Number,
        default: 0,
        min: 0,
    },
    margin: {
        type: Number,
        default: 0,
        min: 0,
    },

    // Legacy field (keep for backward compatibility)
    cost: {
        type: Number,
        default: 0,
    },

    // Supplier
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
    },

    // Stock Management
    stocks: {
        almacen: { type: Number, default: 0 },
        cocina: { type: Number, default: 0 },
        ensalada: { type: Number, default: 0 },
        isla: { type: Number, default: 0 },
    },
    minStock: {
        type: Number,
        default: 10,
        min: 0,
    },

    // Status
    active: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Ingredient', ingredientSchema);
