const Inventory = require('../models/Inventory');
const Ingredient = require('../models/Ingredient');
const mongoose = require('mongoose');

// @desc    Get inventory summary report
// @route   GET /api/reports/summary
// @access  Private
const getSummaryReport = async (req, res) => {
    try {
        const { startDate, endDate, area } = req.query;

        // Build match query
        const matchQuery = {};

        if (startDate || endDate) {
            matchQuery.createdAt = {};
            if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
            if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
        }

        if (area) {
            matchQuery.area = area;
        }

        // Get total inventory value by area
        const areaStats = await Inventory.aggregate([
            { $match: matchQuery },
            {
                $lookup: {
                    from: 'ingredients',
                    localField: 'ingredient',
                    foreignField: '_id',
                    as: 'ingredientData'
                }
            },
            { $unwind: '$ingredientData' },
            {
                $group: {
                    _id: '$area',
                    totalQuantity: { $sum: '$quantity' },
                    totalValue: {
                        $sum: {
                            $multiply: ['$quantity', { $ifNull: ['$ingredientData.purchasePrice', 0] }]
                        }
                    },
                    itemCount: { $sum: 1 }
                }
            },
            { $sort: { totalValue: -1 } }
        ]);

        // Get top 10 most stocked items
        const topItems = await Inventory.aggregate([
            { $match: matchQuery },
            {
                $lookup: {
                    from: 'ingredients',
                    localField: 'ingredient',
                    foreignField: '_id',
                    as: 'ingredientData'
                }
            },
            { $unwind: '$ingredientData' },
            {
                $group: {
                    _id: '$ingredient',
                    name: { $first: '$ingredientData.name' },
                    unit: { $first: '$ingredientData.unit' },
                    totalQuantity: { $sum: '$quantity' },
                    price: { $first: '$ingredientData.purchasePrice' }
                }
            },
            {
                $addFields: {
                    totalValue: { $multiply: ['$totalQuantity', { $ifNull: ['$price', 0] }] }
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 10 }
        ]);

        // Get low stock items (below minimum)
        const lowStockItems = await Ingredient.aggregate([
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
                    minimumStock: { $ifNull: ['$minimumStock', 5] },
                    purchasePrice: 1
                }
            },
            { $limit: 20 }
        ]);

        // Get total counts
        const totalIngredients = await Ingredient.countDocuments();
        const totalInventoryRecords = await Inventory.countDocuments(matchQuery);

        // Calculate grand totals
        const grandTotals = areaStats.reduce((acc, area) => ({
            totalQuantity: acc.totalQuantity + area.totalQuantity,
            totalValue: acc.totalValue + area.totalValue,
            totalItems: acc.totalItems + area.itemCount
        }), { totalQuantity: 0, totalValue: 0, totalItems: 0 });

        res.json({
            summary: {
                totalIngredients,
                totalInventoryRecords,
                ...grandTotals
            },
            areaStats,
            topItems,
            lowStockItems
        });
    } catch (error) {
        console.error('Error generating summary report:', error);
        res.status(500).json({ message: 'Error al generar reporte' });
    }
};

// @desc    Get consumption report (comparing two dates)
// @route   GET /api/reports/consumption
// @access  Private
const getConsumptionReport = async (req, res) => {
    try {
        const { startDate, endDate, area } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'Se requieren fechas de inicio y fin' });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        // Get inventory at start date (latest record before start)
        const startInventory = await Inventory.aggregate([
            {
                $match: {
                    createdAt: { $lte: start },
                    ...(area && { area })
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $group: {
                    _id: { ingredient: '$ingredient', area: '$area' },
                    quantity: { $first: '$quantity' },
                    createdAt: { $first: '$createdAt' }
                }
            },
            {
                $lookup: {
                    from: 'ingredients',
                    localField: '_id.ingredient',
                    foreignField: '_id',
                    as: 'ingredientData'
                }
            },
            { $unwind: '$ingredientData' }
        ]);

        // Get inventory at end date
        const endInventory = await Inventory.aggregate([
            {
                $match: {
                    createdAt: { $lte: end },
                    ...(area && { area })
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $group: {
                    _id: { ingredient: '$ingredient', area: '$area' },
                    quantity: { $first: '$quantity' },
                    createdAt: { $first: '$createdAt' }
                }
            },
            {
                $lookup: {
                    from: 'ingredients',
                    localField: '_id.ingredient',
                    foreignField: '_id',
                    as: 'ingredientData'
                }
            },
            { $unwind: '$ingredientData' }
        ]);

        // Calculate consumption
        const consumptionMap = new Map();

        // Add start inventory
        startInventory.forEach(item => {
            const key = `${item._id.ingredient}-${item._id.area}`;
            consumptionMap.set(key, {
                ingredient: item._id.ingredient,
                name: item.ingredientData.name,
                unit: item.ingredientData.unit,
                area: item._id.area,
                startQuantity: item.quantity,
                endQuantity: 0,
                price: item.ingredientData.purchasePrice || 0
            });
        });

        // Add end inventory
        endInventory.forEach(item => {
            const key = `${item._id.ingredient}-${item._id.area}`;
            if (consumptionMap.has(key)) {
                consumptionMap.get(key).endQuantity = item.quantity;
            } else {
                consumptionMap.set(key, {
                    ingredient: item._id.ingredient,
                    name: item.ingredientData.name,
                    unit: item.ingredientData.unit,
                    area: item._id.area,
                    startQuantity: 0,
                    endQuantity: item.quantity,
                    price: item.ingredientData.purchasePrice || 0
                });
            }
        });

        // Calculate consumption for each item
        const consumption = Array.from(consumptionMap.values()).map(item => ({
            ...item,
            consumed: item.startQuantity - item.endQuantity,
            consumedValue: (item.startQuantity - item.endQuantity) * item.price
        })).filter(item => item.consumed !== 0)
            .sort((a, b) => b.consumedValue - a.consumedValue);

        // Summary by area
        const byArea = consumption.reduce((acc, item) => {
            if (!acc[item.area]) {
                acc[item.area] = { totalConsumed: 0, totalValue: 0, items: 0 };
            }
            acc[item.area].totalConsumed += item.consumed;
            acc[item.area].totalValue += item.consumedValue;
            acc[item.area].items += 1;
            return acc;
        }, {});

        res.json({
            period: { startDate: start, endDate: end },
            consumption: consumption.slice(0, 50), // Top 50
            byArea,
            totals: {
                totalItems: consumption.length,
                totalConsumedValue: consumption.reduce((sum, item) => sum + item.consumedValue, 0)
            }
        });
    } catch (error) {
        console.error('Error generating consumption report:', error);
        res.status(500).json({ message: 'Error al generar reporte de consumo' });
    }
};

// @desc    Get inventory trends (daily/weekly/monthly)
// @route   GET /api/reports/trends
// @access  Private
const getTrendsReport = async (req, res) => {
    try {
        const { days = 30, area, ingredient } = req.query;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        const matchQuery = {
            createdAt: { $gte: startDate }
        };

        if (area) matchQuery.area = area;
        if (ingredient) matchQuery.ingredient = new mongoose.Types.ObjectId(ingredient);

        // Get daily inventory totals
        const trends = await Inventory.aggregate([
            { $match: matchQuery },
            {
                $lookup: {
                    from: 'ingredients',
                    localField: 'ingredient',
                    foreignField: '_id',
                    as: 'ingredientData'
                }
            },
            { $unwind: '$ingredientData' },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        area: '$area'
                    },
                    totalQuantity: { $sum: '$quantity' },
                    totalValue: {
                        $sum: {
                            $multiply: ['$quantity', { $ifNull: ['$ingredientData.purchasePrice', 0] }]
                        }
                    },
                    recordCount: { $sum: 1 }
                }
            },
            { $sort: { '_id.date': 1 } }
        ]);

        // Format for chart
        const chartData = trends.reduce((acc, item) => {
            const existing = acc.find(d => d.date === item._id.date);
            if (existing) {
                existing[item._id.area] = item.totalQuantity;
                existing[`${item._id.area}Value`] = item.totalValue;
                existing.totalValue += item.totalValue;
            } else {
                acc.push({
                    date: item._id.date,
                    [item._id.area]: item.totalQuantity,
                    [`${item._id.area}Value`]: item.totalValue,
                    totalValue: item.totalValue
                });
            }
            return acc;
        }, []);

        res.json({
            period: { days: parseInt(days), startDate },
            trends: chartData
        });
    } catch (error) {
        console.error('Error generating trends report:', error);
        res.status(500).json({ message: 'Error al generar reporte de tendencias' });
    }
};

// @desc    Get category breakdown report
// @route   GET /api/reports/categories
// @access  Private
const getCategoryReport = async (req, res) => {
    try {
        const categoryStats = await Ingredient.aggregate([
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'categoryData'
                }
            },
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
                    totalStock: { $sum: '$inventory.quantity' },
                    categoryName: { $arrayElemAt: ['$categoryData.name', 0] }
                }
            },
            {
                $group: {
                    _id: '$category',
                    categoryName: { $first: '$categoryName' },
                    itemCount: { $sum: 1 },
                    totalStock: { $sum: '$totalStock' },
                    totalValue: {
                        $sum: {
                            $multiply: ['$totalStock', { $ifNull: ['$purchasePrice', 0] }]
                        }
                    }
                }
            },
            { $sort: { totalValue: -1 } }
        ]);

        res.json({
            categories: categoryStats.map(cat => ({
                ...cat,
                categoryName: cat.categoryName || 'Sin categoría'
            }))
        });
    } catch (error) {
        console.error('Error generating category report:', error);
        res.status(500).json({ message: 'Error al generar reporte por categorías' });
    }
};

module.exports = {
    getSummaryReport,
    getConsumptionReport,
    getTrendsReport,
    getCategoryReport
};
