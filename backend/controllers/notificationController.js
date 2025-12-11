const Notification = require('../models/Notification');
const Ingredient = require('../models/Ingredient');
const Inventory = require('../models/Inventory');

// @desc    Get notifications for current user
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
    try {
        const { limit = 20, unreadOnly = false } = req.query;

        const query = {
            $or: [
                { user: req.user._id },
                { isGlobal: true }
            ]
        };

        if (unreadOnly === 'true') {
            query.read = false;
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        const unreadCount = await Notification.countDocuments({
            ...query,
            read: false
        });

        res.json({
            notifications,
            unreadCount
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Error al obtener notificaciones' });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ message: 'Notificación no encontrada' });
        }

        notification.read = true;
        notification.readAt = new Date();
        await notification.save();

        res.json(notification);
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: 'Error al actualizar notificación' });
    }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            {
                $or: [
                    { user: req.user._id },
                    { isGlobal: true }
                ],
                read: false
            },
            {
                read: true,
                readAt: new Date()
            }
        );

        res.json({ message: 'Todas las notificaciones marcadas como leídas' });
    } catch (error) {
        console.error('Error marking all as read:', error);
        res.status(500).json({ message: 'Error al actualizar notificaciones' });
    }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res) => {
    try {
        await Notification.findByIdAndDelete(req.params.id);
        res.json({ message: 'Notificación eliminada' });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ message: 'Error al eliminar notificación' });
    }
};

// @desc    Clear all notifications
// @route   DELETE /api/notifications
// @access  Private
const clearAllNotifications = async (req, res) => {
    try {
        await Notification.deleteMany({
            $or: [
                { user: req.user._id },
                { isGlobal: true }
            ]
        });

        res.json({ message: 'Todas las notificaciones eliminadas' });
    } catch (error) {
        console.error('Error clearing notifications:', error);
        res.status(500).json({ message: 'Error al eliminar notificaciones' });
    }
};

// @desc    Check for low stock and create notifications
// @route   POST /api/notifications/check-stock
// @access  Private
const checkLowStock = async (req, res) => {
    try {
        // Get all ingredients with their total stock
        const ingredients = await Ingredient.aggregate([
            {
                $lookup: {
                    from: 'inventories',
                    localField: '_id',
                    foreignField: 'ingredient',
                    as: 'inventory'
                }
            },
            {
                $addFields: {
                    totalStock: { $sum: '$inventory.quantity' }
                }
            },
            {
                $match: {
                    $expr: { $lt: ['$totalStock', { $ifNull: ['$minimumStock', 5] }] }
                }
            },
            {
                $project: {
                    name: 1,
                    unit: 1,
                    totalStock: 1,
                    minimumStock: { $ifNull: ['$minimumStock', 5] }
                }
            }
        ]);

        // Create notifications for low stock items
        const notifications = [];
        for (const ingredient of ingredients) {
            // Check if a similar notification already exists (not read, within last 24h)
            const existingNotification = await Notification.findOne({
                type: 'low_stock',
                'data.ingredientId': ingredient._id.toString(),
                read: false,
                createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
            });

            if (!existingNotification) {
                const notification = await Notification.create({
                    type: 'low_stock',
                    title: 'Stock Bajo',
                    message: `${ingredient.name} tiene solo ${ingredient.totalStock.toFixed(2)} ${ingredient.unit} (mínimo: ${ingredient.minimumStock})`,
                    data: {
                        ingredientId: ingredient._id.toString(),
                        ingredientName: ingredient.name,
                        currentStock: ingredient.totalStock,
                        minimumStock: ingredient.minimumStock
                    },
                    isGlobal: true,
                    link: '/ingredientes'
                });
                notifications.push(notification);
            }
        }

        res.json({
            message: `${notifications.length} nuevas alertas de stock bajo`,
            lowStockCount: ingredients.length,
            newNotifications: notifications.length
        });
    } catch (error) {
        console.error('Error checking low stock:', error);
        res.status(500).json({ message: 'Error al verificar stock' });
    }
};

// @desc    Create a notification (Admin)
// @route   POST /api/notifications
// @access  Private/Admin
const createNotification = async (req, res) => {
    try {
        const { type, title, message, userId, isGlobal, link } = req.body;

        const notification = await Notification.create({
            type: type || 'info',
            title,
            message,
            user: userId || null,
            isGlobal: isGlobal || !userId,
            link
        });

        res.status(201).json(notification);
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({ message: 'Error al crear notificación' });
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    checkLowStock,
    createNotification
};
