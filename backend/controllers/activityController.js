const ActivityLog = require('../models/ActivityLog');

// @desc    Get activity logs
// @route   GET /api/activity
// @access  Private/Admin
const getActivityLogs = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 50,
            user,
            action,
            entity,
            startDate,
            endDate
        } = req.query;

        const query = {};

        if (user) query.user = user;
        if (action) query.action = action;
        if (entity) query.entity = entity;

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [logs, total] = await Promise.all([
            ActivityLog.find(query)
                .populate('user', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            ActivityLog.countDocuments(query)
        ]);

        res.json({
            logs,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching activity logs:', error);
        res.status(500).json({ message: 'Error al obtener registros de actividad' });
    }
};

// @desc    Get activity summary
// @route   GET /api/activity/summary
// @access  Private/Admin
const getActivitySummary = async (req, res) => {
    try {
        const { days = 7 } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        // Get activity by action type
        const byAction = await ActivityLog.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            { $group: { _id: '$action', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Get activity by entity
        const byEntity = await ActivityLog.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            { $group: { _id: '$entity', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Get activity by user (top 10)
        const byUser = await ActivityLog.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            { $group: { _id: '$user', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userData'
                }
            },
            { $unwind: '$userData' },
            {
                $project: {
                    _id: 1,
                    count: 1,
                    userName: '$userData.name',
                    userEmail: '$userData.email'
                }
            }
        ]);

        // Get daily activity
        const daily = await ActivityLog.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Total count
        const totalCount = await ActivityLog.countDocuments({ createdAt: { $gte: startDate } });

        res.json({
            period: { days: parseInt(days), startDate },
            totalCount,
            byAction,
            byEntity,
            byUser,
            daily
        });
    } catch (error) {
        console.error('Error fetching activity summary:', error);
        res.status(500).json({ message: 'Error al obtener resumen de actividad' });
    }
};

// @desc    Get activity for a specific entity
// @route   GET /api/activity/entity/:entityType/:entityId
// @access  Private/Admin
const getEntityActivity = async (req, res) => {
    try {
        const { entityType, entityId } = req.params;
        const { limit = 20 } = req.query;

        const logs = await ActivityLog.find({
            entity: entityType,
            entityId: entityId
        })
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        res.json(logs);
    } catch (error) {
        console.error('Error fetching entity activity:', error);
        res.status(500).json({ message: 'Error al obtener actividad de entidad' });
    }
};

// Helper function to log activity (to be used in other controllers)
const logActivity = async (req, action, entity, entityId, entityName, description, details = {}) => {
    try {
        await ActivityLog.log({
            user: req.user._id,
            action,
            entity,
            entityId,
            entityName,
            description,
            details,
            ipAddress: req.ip || req.connection?.remoteAddress,
            userAgent: req.get('User-Agent')
        });
    } catch (error) {
        console.error('Error logging activity:', error);
    }
};

module.exports = {
    getActivityLogs,
    getActivitySummary,
    getEntityActivity,
    logActivity
};
