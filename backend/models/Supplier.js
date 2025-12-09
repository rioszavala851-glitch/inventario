const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    contactName: {
        type: String,
        trim: true,
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
    },
    phone: {
        type: String,
        trim: true,
    },
    address: {
        type: String,
        trim: true,
    },
    rfc: {
        type: String,
        trim: true,
        uppercase: true,
    },
    paymentTerms: {
        type: String,
        trim: true,
        default: 'Contado', // Cash, 15 días, 30 días, etc.
    },
    deliveryTime: {
        type: Number,
        default: 0, // Days
        min: 0,
    },
    active: {
        type: Boolean,
        default: true,
    },
    notes: {
        type: String,
        trim: true,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Supplier', supplierSchema);
