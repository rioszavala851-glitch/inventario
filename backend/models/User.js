const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role',
        required: true,
    },
    // Subscription fields
    trialStartDate: {
        type: Date,
        default: Date.now,
    },
    trialEndDate: {
        type: Date,
        default: function () {
            return new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days from now
        }
    },
    subscriptionStatus: {
        type: String,
        enum: ['trial', 'active', 'expired', 'cancelled'],
        default: 'trial',
    },
    subscriptionPlan: {
        type: String,
        enum: ['monthly', 'annual', null],
        default: null,
    },
    subscriptionStartDate: {
        type: Date,
        default: null,
    },
    subscriptionEndDate: {
        type: Date,
        default: null,
    },
    stripeCustomerId: {
        type: String,
        default: null,
    },
    stripeSubscriptionId: {
        type: String,
        default: null,
    }
}, {
    timestamps: true,
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
