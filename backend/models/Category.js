const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    icon: {
        type: String,
        default: 'Package', // Lucide icon name
    },
    color: {
        type: String,
        default: '#6366f1', // Indigo color
    },
    subcategories: [{
        type: String,
        trim: true,
    }],
    active: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Category', categorySchema);
