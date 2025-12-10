const Ingredient = require('../models/Ingredient');
const Inventory = require('../models/Inventory');
const Activity = require('../models/Activity');

// @desc    Update stock for a specific ingredient in an area
// @route   PUT /api/inventory/update
// @access  Private
const updateStock = async (req, res) => {
    const { ingredientId, area, quantity } = req.body;

    // Valid areas
    const areas = ['almacen', 'cocina', 'ensalada', 'isla'];
    if (!areas.includes(area.toLowerCase())) {
        return res.status(400).json({ message: 'Invalid area' });
    }

    const ingredient = await Ingredient.findById(ingredientId);

    if (ingredient) {
        ingredient.stocks[area.toLowerCase()] = Number(quantity);
        await ingredient.save();
        res.json(ingredient);
    } else {
        res.status(404).json({ message: 'Ingredient not found' });
    }
};

// @desc    Save current state as a history record
// @route   POST /api/inventory/save-snapshot
// @access  Private
const saveSnapshot = async (req, res) => {
    const ingredients = await Ingredient.find({});

    let totalInventoryValue = 0;
    const items = ingredients.map(ing => {
        const totalQty = ing.stocks.almacen + ing.stocks.cocina + ing.stocks.ensalada + ing.stocks.isla;
        const totalVal = totalQty * ing.cost;
        totalInventoryValue += totalVal;

        return {
            ingredient: ing._id,
            name: ing.name,
            unit: ing.unit,
            cost: ing.cost,
            totalQuantity: totalQty,
            totalValue: totalVal,
            breakdown: {
                almacen: ing.stocks.almacen,
                cocina: ing.stocks.cocina,
                ensalada: ing.stocks.ensalada,
                isla: ing.stocks.isla,
            }
        };
    });

    const inventory = await Inventory.create({
        items,
        totalInventoryValue
    });

    // Log Activity
    try {
        await Activity.create({
            user: req.user?._id, // Assuming auth middleware populates user
            action: 'SNAPSHOT',
            description: 'Cierre de Inventario',
            details: {
                itemCount: items.length,
                totalValue: totalInventoryValue
            }
        });
    } catch (err) {
        console.error('Error logging snapshot activity:', err);
    }

    // Reset all area stocks to 0 after saving
    await Ingredient.updateMany({}, {
        $set: {
            "stocks.almacen": 0,
            "stocks.cocina": 0,
            "stocks.ensalada": 0,
            "stocks.isla": 0
        }
    });

    res.status(201).json(inventory);
};

// @desc    Get all history records
// @route   GET /api/inventory/history
// @access  Private
const getHistory = async (req, res) => {
    const history = await Inventory.find({}).sort({ createdAt: -1 });
    res.json(history);
};

// @desc    Get recent activity (Audit Log)
// @route   GET /api/inventory/activity
// @access  Private
const getRecentActivity = async (req, res) => {
    try {
        const activity = await Activity.find({})
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('user', 'name email role');
        res.json(activity);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching activity' });
    }
};

// @desc    Get Dashboard stats (Current state)
// @route   GET /api/inventory/dashboard
// @access  Private
const getDashboardStats = async (req, res) => {
    const ingredients = await Ingredient.find({});

    console.log('📊 Dashboard Stats - Total ingredients in DB:', ingredients.length);

    let totalValue = 0;
    let totalItems = 0; // Distinct ingredients or total units? Usually distinct ingredients in stock > 0

    ingredients.forEach(ing => {
        const totalQty = ing.stocks.almacen + ing.stocks.cocina + ing.stocks.ensalada + ing.stocks.isla;
        totalValue += (totalQty * ing.cost);
        if (totalQty > 0) {
            totalItems++;
        }
    });

    // Provide detailed breakdown for charts if needed
    // E.g. Value per Area
    let areaValues = { almacen: 0, cocina: 0, ensalada: 0, isla: 0 };
    ingredients.forEach(ing => {
        areaValues.almacen += ing.stocks.almacen * ing.cost;
        areaValues.cocina += ing.stocks.cocina * ing.cost;
        areaValues.ensalada += ing.stocks.ensalada * ing.cost;
        areaValues.isla += ing.stocks.isla * ing.cost;
    });

    console.log('📊 Dashboard Stats Result:', {
        totalValue,
        totalIngredients: ingredients.length,
        itemsInStock: totalItems,
        areaValues
    });

    res.json({
        totalValue,
        totalIngredients: ingredients.length,
        itemsInStock: totalItems,
        areaValues
    });
};

// @desc    Bulk update stock for multiple ingredients
// @route   POST /api/inventory/bulk-update
// @access  Private
const bulkUpdateStock = async (req, res) => {
    const { updates } = req.body; // Array of { ingredientId, area, quantity }

    if (!updates || !Array.isArray(updates)) {
        return res.status(400).json({ message: 'Invalid updates format' });
    }

    try {
        const operations = updates.map(({ ingredientId, area, quantity }) => {
            return {
                updateOne: {
                    filter: { _id: ingredientId },
                    update: { $set: { [`stocks.${area.toLowerCase()}`]: Number(quantity) } }
                }
            };
        });

        if (operations.length > 0) {
            await Ingredient.bulkWrite(operations);

            // Log Activity
            try {
                // Determine area from first update (assuming bulk update is per area)
                const area = updates[0]?.area || 'General';
                await Activity.create({
                    user: req.user?._id,
                    action: 'UPDATE',
                    description: `Actualización de Inventario: ${area}`,
                    details: {
                        area: area,
                        itemCount: updates.length
                    }
                });
            } catch (err) {
                console.error('Error logging update activity:', err);
            }
        }

        res.json({ message: 'Bulk update successful' });
    } catch (error) {
        console.error('Bulk update error:', error);
        res.status(500).json({ message: 'Server error during bulk update' });
    }
};

module.exports = { updateStock, saveSnapshot, getHistory, getDashboardStats, bulkUpdateStock, getRecentActivity };
