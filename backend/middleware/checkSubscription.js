const User = require('../models/User');

/**
 * Middleware to check if user has active trial or subscription
 */
const checkSubscription = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const now = new Date();

        // Check if user is in trial period
        if (user.subscriptionStatus === 'trial') {
            if (now <= user.trialEndDate) {
                // Trial is still active
                req.subscriptionInfo = {
                    status: 'trial',
                    daysRemaining: Math.ceil((user.trialEndDate - now) / (1000 * 60 * 60 * 24)),
                    trialEndDate: user.trialEndDate,
                };
                return next();
            } else {
                // Trial has expired
                user.subscriptionStatus = 'expired';
                await user.save();
                return res.status(403).json({
                    message: 'Tu período de prueba ha expirado',
                    subscriptionStatus: 'expired',
                    requiresUpgrade: true,
                });
            }
        }

        // Check if user has active subscription
        if (user.subscriptionStatus === 'active') {
            if (now <= user.subscriptionEndDate) {
                // Subscription is active
                req.subscriptionInfo = {
                    status: 'active',
                    plan: user.subscriptionPlan,
                    endDate: user.subscriptionEndDate,
                };
                return next();
            } else {
                // Subscription has expired
                user.subscriptionStatus = 'expired';
                await user.save();
                return res.status(403).json({
                    message: 'Tu suscripción ha expirado',
                    subscriptionStatus: 'expired',
                    requiresUpgrade: true,
                });
            }
        }

        // User has no active trial or subscription
        return res.status(403).json({
            message: 'Necesitas una suscripción activa para acceder',
            subscriptionStatus: user.subscriptionStatus,
            requiresUpgrade: true,
        });

    } catch (error) {
        console.error('Error en checkSubscription middleware:', error);
        res.status(500).json({ message: 'Error del servidor al verificar suscripción' });
    }
};

/**
 * Middleware to get subscription info without blocking access
 * Useful for displaying subscription status in UI
 */
const getSubscriptionInfo = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return next();
        }

        const now = new Date();

        if (user.subscriptionStatus === 'trial') {
            req.subscriptionInfo = {
                status: 'trial',
                daysRemaining: Math.ceil((user.trialEndDate - now) / (1000 * 60 * 60 * 24)),
                trialEndDate: user.trialEndDate,
            };
        } else if (user.subscriptionStatus === 'active') {
            req.subscriptionInfo = {
                status: 'active',
                plan: user.subscriptionPlan,
                endDate: user.subscriptionEndDate,
            };
        } else {
            req.subscriptionInfo = {
                status: user.subscriptionStatus,
            };
        }

        next();
    } catch (error) {
        console.error('Error en getSubscriptionInfo middleware:', error);
        next();
    }
};

module.exports = { checkSubscription, getSubscriptionInfo };
