const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const Subscription = require('../models/Subscription');

// Pricing configuration
const PRICING = {
    monthly: {
        priceId: process.env.STRIPE_MONTHLY_PRICE_ID,
        amount: 2900, // $29.00
        interval: 'month',
    },
    annual: {
        priceId: process.env.STRIPE_ANNUAL_PRICE_ID,
        amount: 29000, // $290.00
        interval: 'year',
    },
};

/**
 * Get current subscription status
 */
const getSubscriptionStatus = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        const now = new Date();

        let daysRemaining = 0;
        if (user.subscriptionStatus === 'trial') {
            daysRemaining = Math.ceil((user.trialEndDate - now) / (1000 * 60 * 60 * 24));
        }

        res.json({
            status: user.subscriptionStatus,
            plan: user.subscriptionPlan,
            trialEndDate: user.trialEndDate,
            subscriptionEndDate: user.subscriptionEndDate,
            daysRemaining,
            stripeCustomerId: user.stripeCustomerId,
        });
    } catch (error) {
        console.error('Error getting subscription status:', error);
        res.status(500).json({ message: 'Error al obtener estado de suscripción' });
    }
};

/**
 * Create Stripe checkout session
 */
const createCheckoutSession = async (req, res) => {
    try {
        const { plan } = req.body; // 'monthly' or 'annual'
        const user = await User.findById(req.user._id);

        if (!PRICING[plan]) {
            return res.status(400).json({ message: 'Plan inválido' });
        }

        // Create or retrieve Stripe customer
        let customerId = user.stripeCustomerId;
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                metadata: {
                    userId: user._id.toString(),
                },
            });
            customerId = customer.id;
            user.stripeCustomerId = customerId;
            await user.save();
        }

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ['card'],
            line_items: [
                {
                    price: PRICING[plan].priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/subscription/cancelled`,
            metadata: {
                userId: user._id.toString(),
                plan,
            },
        });

        res.json({ sessionId: session.id, url: session.url });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ message: 'Error al crear sesión de pago' });
    }
};

/**
 * Handle Stripe webhooks
 */
const handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            await handleCheckoutCompleted(event.data.object);
            break;
        case 'customer.subscription.updated':
            await handleSubscriptionUpdated(event.data.object);
            break;
        case 'customer.subscription.deleted':
            await handleSubscriptionDeleted(event.data.object);
            break;
        case 'invoice.payment_failed':
            await handlePaymentFailed(event.data.object);
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
};

/**
 * Handle successful checkout
 */
const handleCheckoutCompleted = async (session) => {
    const userId = session.metadata.userId;
    const plan = session.metadata.plan;
    const subscriptionId = session.subscription;

    const user = await User.findById(userId);
    if (!user) return;

    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
    const endDate = new Date(stripeSubscription.current_period_end * 1000);

    // Update user
    user.subscriptionStatus = 'active';
    user.subscriptionPlan = plan;
    user.subscriptionStartDate = new Date();
    user.subscriptionEndDate = endDate;
    user.stripeSubscriptionId = subscriptionId;
    await user.save();

    // Create subscription record
    await Subscription.create({
        user: userId,
        plan,
        status: 'active',
        amount: PRICING[plan].amount,
        currency: 'usd',
        startDate: new Date(),
        endDate,
        stripeSubscriptionId: subscriptionId,
        stripeCustomerId: user.stripeCustomerId,
        stripePriceId: PRICING[plan].priceId,
    });
};

/**
 * Handle subscription update
 */
const handleSubscriptionUpdated = async (subscription) => {
    const user = await User.findOne({ stripeSubscriptionId: subscription.id });
    if (!user) return;

    const endDate = new Date(subscription.current_period_end * 1000);
    user.subscriptionEndDate = endDate;

    if (subscription.cancel_at_period_end) {
        user.subscriptionStatus = 'cancelled';
    }

    await user.save();

    await Subscription.findOneAndUpdate(
        { stripeSubscriptionId: subscription.id },
        {
            endDate,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            status: subscription.cancel_at_period_end ? 'cancelled' : 'active',
        }
    );
};

/**
 * Handle subscription deletion
 */
const handleSubscriptionDeleted = async (subscription) => {
    const user = await User.findOne({ stripeSubscriptionId: subscription.id });
    if (!user) return;

    user.subscriptionStatus = 'expired';
    user.subscriptionPlan = null;
    await user.save();

    await Subscription.findOneAndUpdate(
        { stripeSubscriptionId: subscription.id },
        { status: 'expired' }
    );
};

/**
 * Handle payment failure
 */
const handlePaymentFailed = async (invoice) => {
    const user = await User.findOne({ stripeCustomerId: invoice.customer });
    if (!user) return;

    user.subscriptionStatus = 'past_due';
    await user.save();
};

/**
 * Cancel subscription
 */
const cancelSubscription = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user.stripeSubscriptionId) {
            return res.status(400).json({ message: 'No tienes una suscripción activa' });
        }

        // Cancel at period end
        await stripe.subscriptions.update(user.stripeSubscriptionId, {
            cancel_at_period_end: true,
        });

        user.subscriptionStatus = 'cancelled';
        await user.save();

        res.json({ message: 'Suscripción cancelada. Tendrás acceso hasta el final del período actual.' });
    } catch (error) {
        console.error('Error cancelling subscription:', error);
        res.status(500).json({ message: 'Error al cancelar suscripción' });
    }
};

/**
 * Get billing history
 */
const getBillingHistory = async (req, res) => {
    try {
        const subscriptions = await Subscription.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(10);

        res.json(subscriptions);
    } catch (error) {
        console.error('Error getting billing history:', error);
        res.status(500).json({ message: 'Error al obtener historial de facturación' });
    }
};

module.exports = {
    getSubscriptionStatus,
    createCheckoutSession,
    handleWebhook,
    cancelSubscription,
    getBillingHistory,
};
