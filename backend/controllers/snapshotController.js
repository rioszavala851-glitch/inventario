const Snapshot = require('../models/Snapshot');
const Inventory = require('../models/Inventory');
const Ingredient = require('../models/Ingredient');

// @desc    Get all snapshots
// @route   GET /api/snapshots
// @access  Private
const getSnapshots = async (req, res) => {
    try {
        const { area, limit = 50 } = req.query;
        const query = area && area !== 'all' ? { area } : {};

        const snapshots = await Snapshot.find(query)
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .select('-items'); // Don't send all items for list view

        res.json(snapshots);
    } catch (error) {
        console.error('Error fetching snapshots:', error);
        res.status(500).json({ message: 'Error al obtener cierres' });
    }
};

// @desc    Get single snapshot with full details
// @route   GET /api/snapshots/:id
// @access  Private
const getSnapshotById = async (req, res) => {
    try {
        const snapshot = await Snapshot.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('items.ingredient', 'name sku unit');

        if (!snapshot) {
            return res.status(404).json({ message: 'Cierre no encontrado' });
        }

        res.json(snapshot);
    } catch (error) {
        console.error('Error fetching snapshot:', error);
        res.status(500).json({ message: 'Error al obtener cierre' });
    }
};

// @desc    Create new snapshot (inventory closure)
// @route   POST /api/snapshots
// @access  Private
const createSnapshot = async (req, res) => {
    try {
        const { name, description, area = 'all' } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'El nombre del cierre es requerido' });
        }

        // Get current inventory for the specified area
        const inventoryQuery = area !== 'all' ? { area } : {};
        const inventoryItems = await Inventory.find(inventoryQuery)
            .populate('ingredient', 'name sku unit purchasePrice');

        // Group by ingredient and calculate totals
        const itemsMap = new Map();

        inventoryItems.forEach(inv => {
            if (!inv.ingredient) return;

            const key = inv.ingredient._id.toString();
            if (itemsMap.has(key)) {
                const existing = itemsMap.get(key);
                existing.quantity += inv.quantity;
                existing.totalValue = existing.quantity * existing.purchasePrice;
            } else {
                itemsMap.set(key, {
                    ingredient: inv.ingredient._id,
                    name: inv.ingredient.name,
                    sku: inv.ingredient.sku,
                    unit: inv.ingredient.unit,
                    quantity: inv.quantity,
                    purchasePrice: inv.ingredient.purchasePrice || 0,
                    totalValue: inv.quantity * (inv.ingredient.purchasePrice || 0)
                });
            }
        });

        const items = Array.from(itemsMap.values());

        // Calculate summary
        const summary = {
            totalItems: items.length,
            totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
            totalValue: items.reduce((sum, item) => sum + item.totalValue, 0)
        };

        // Create snapshot
        const snapshot = await Snapshot.create({
            name,
            description,
            area,
            items,
            summary,
            createdBy: req.user._id,
            status: 'final'
        });

        // Populate and return
        await snapshot.populate('createdBy', 'name email');

        res.status(201).json(snapshot);
    } catch (error) {
        console.error('Error creating snapshot:', error);
        res.status(500).json({ message: 'Error al crear cierre' });
    }
};

// @desc    Delete snapshot
// @route   DELETE /api/snapshots/:id
// @access  Private (Admin)
const deleteSnapshot = async (req, res) => {
    try {
        const snapshot = await Snapshot.findById(req.params.id);

        if (!snapshot) {
            return res.status(404).json({ message: 'Cierre no encontrado' });
        }

        await Snapshot.findByIdAndDelete(req.params.id);
        res.json({ message: 'Cierre eliminado exitosamente' });
    } catch (error) {
        console.error('Error deleting snapshot:', error);
        res.status(500).json({ message: 'Error al eliminar cierre' });
    }
};

// @desc    Compare two snapshots
// @route   GET /api/snapshots/compare/:id1/:id2
// @access  Private
const compareSnapshots = async (req, res) => {
    try {
        const { id1, id2 } = req.params;

        const [snapshot1, snapshot2] = await Promise.all([
            Snapshot.findById(id1),
            Snapshot.findById(id2)
        ]);

        if (!snapshot1 || !snapshot2) {
            return res.status(404).json({ message: 'Uno o ambos cierres no encontrados' });
        }

        // Create maps for comparison
        const map1 = new Map(snapshot1.items.map(item => [item.ingredient.toString(), item]));
        const map2 = new Map(snapshot2.items.map(item => [item.ingredient.toString(), item]));

        const comparison = [];
        const allIngredients = new Set([...map1.keys(), ...map2.keys()]);

        allIngredients.forEach(ingredientId => {
            const item1 = map1.get(ingredientId);
            const item2 = map2.get(ingredientId);

            const quantity1 = item1?.quantity || 0;
            const quantity2 = item2?.quantity || 0;
            const difference = quantity2 - quantity1;

            if (difference !== 0) {
                comparison.push({
                    ingredient: ingredientId,
                    name: item1?.name || item2?.name,
                    unit: item1?.unit || item2?.unit,
                    snapshot1Quantity: quantity1,
                    snapshot2Quantity: quantity2,
                    difference,
                    percentChange: quantity1 > 0 ? ((difference / quantity1) * 100).toFixed(1) : null
                });
            }
        });

        // Sort by absolute difference
        comparison.sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference));

        res.json({
            snapshot1: {
                _id: snapshot1._id,
                name: snapshot1.name,
                createdAt: snapshot1.createdAt,
                summary: snapshot1.summary
            },
            snapshot2: {
                _id: snapshot2._id,
                name: snapshot2.name,
                createdAt: snapshot2.createdAt,
                summary: snapshot2.summary
            },
            comparison,
            summaryDifference: {
                items: snapshot2.summary.totalItems - snapshot1.summary.totalItems,
                quantity: snapshot2.summary.totalQuantity - snapshot1.summary.totalQuantity,
                value: snapshot2.summary.totalValue - snapshot1.summary.totalValue
            }
        });
    } catch (error) {
        console.error('Error comparing snapshots:', error);
        res.status(500).json({ message: 'Error al comparar cierres' });
    }
};

module.exports = {
    getSnapshots,
    getSnapshotById,
    createSnapshot,
    deleteSnapshot,
    compareSnapshots
};
