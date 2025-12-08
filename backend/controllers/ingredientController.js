const Ingredient = require('../models/Ingredient');
const xlsx = require('xlsx');

// @desc    Get all ingredients with pagination
// @route   GET /api/ingredients?page=1&limit=25&search=query
// @access  Private
const getIngredients = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 25;
        const search = req.query.search || '';

        // Build search query
        const query = search
            ? { name: { $regex: search, $options: 'i' } }
            : {};

        // Get total count for pagination
        const total = await Ingredient.countDocuments(query);

        // Get paginated results
        const ingredients = await Ingredient.find(query)
            .limit(limit)
            .skip((page - 1) * limit)
            .sort({ name: 1 });

        res.json({
            ingredients,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            itemsPerPage: limit
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching ingredients', error: error.message });
    }
};

// @desc    Add a new ingredient
// @route   POST /api/ingredients
// @access  Private
const addIngredient = async (req, res) => {
    const { name, detail, unit, cost } = req.body;

    // Generate QR Content - typically just the ID or unique string
    // We'll save the ingredient first to get the ID
    const ingredient = new Ingredient({
        name,
        detail,
        unit,
        cost,
        stocks: { almacen: 0, cocina: 0, ensalada: 0, isla: 0 }
    });

    const createdIngredient = await ingredient.save();

    // Update QR code with the ID
    createdIngredient.qrCode = createdIngredient._id.toString();
    await createdIngredient.save();

    res.status(201).json(createdIngredient);
};

// @desc    Update an ingredient
// @route   PUT /api/ingredients/:id
// @access  Private
const updateIngredient = async (req, res) => {
    const { name, detail, unit, cost } = req.body;
    const ingredient = await Ingredient.findById(req.params.id);

    if (ingredient) {
        ingredient.name = name || ingredient.name;
        ingredient.detail = detail || ingredient.detail;
        ingredient.unit = unit || ingredient.unit;
        ingredient.cost = cost !== undefined ? cost : ingredient.cost;

        const updatedIngredient = await ingredient.save();
        res.json(updatedIngredient);
    } else {
        res.status(404).json({ message: 'Ingredient not found' });
    }
};

// @desc    Upload ingredients from Excel
// @route   POST /api/ingredients/upload
// @access  Private
const uploadIngredients = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Please upload an Excel file' });
    }

    try {
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        // Expected columns: Name, Detail, Unit, Cost
        const createdIngredients = [];

        for (const row of data) {
            const { Name, Detail, Unit, Cost } = row; // Adjust keys based on Excel header

            // Basic validation
            if (!Name || !Unit || !Cost) continue;

            const validUnits = ['PIEZA', 'PAQUETE', 'MILILITRO', 'LITRO', 'GRAMO', 'KILO'];
            const normalizedUnit = validUnits.includes(Unit.toUpperCase()) ? Unit.toUpperCase() : 'PIEZA';

            const ingredient = await Ingredient.create({
                name: Name,
                detail: Detail || '',
                unit: normalizedUnit,
                cost: Number(Cost),
                qrCode: 'temp', // Will update
            });

            ingredient.qrCode = ingredient._id.toString();
            await ingredient.save();
            createdIngredients.push(ingredient);
        }

        res.status(201).json(createdIngredients);
    } catch (error) {
        res.status(500).json({ message: 'Error processing file', error: error.message });
    }
};

// @desc    Delete an ingredient
// @route   DELETE /api/ingredients/:id
// @access  Private
const deleteIngredient = async (req, res) => {
    try {
        const ingredient = await Ingredient.findById(req.params.id);

        if (ingredient) {
            await ingredient.deleteOne();
            res.json({ message: 'Ingredient removed' });
        } else {
            res.status(404).json({ message: 'Ingredient not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting ingredient', error: error.message });
    }
};

// @desc    Get low stock items
// @route   GET /api/ingredients/low-stock
// @access  Private
const getLowStockItems = async (req, res) => {
    try {
        const ingredients = await Ingredient.find({ active: true });

        const lowStockItems = [];

        ingredients.forEach(ingredient => {
            const areas = ['almacen', 'cocina', 'ensalada', 'isla'];

            areas.forEach(area => {
                const stock = ingredient.stocks?.[area] || 0;
                if (stock < ingredient.minStock) {
                    lowStockItems.push({
                        _id: ingredient._id,
                        name: ingredient.name,
                        area: area,
                        currentStock: stock,
                        minStock: ingredient.minStock,
                        unit: ingredient.unit,
                        severity: stock === 0 ? 'critical' : stock < ingredient.minStock / 2 ? 'high' : 'medium'
                    });
                }
            });
        });

        res.json(lowStockItems);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching low stock items', error: error.message });
    }
};

// @desc    Toggle ingredient active status
// @route   PATCH /api/ingredients/:id/toggle
// @access  Private
const toggleActive = async (req, res) => {
    try {
        const ingredient = await Ingredient.findById(req.params.id);

        if (ingredient) {
            ingredient.active = !ingredient.active;
            const updatedIngredient = await ingredient.save();
            res.json(updatedIngredient);
        } else {
            res.status(404).json({ message: 'Ingredient not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error toggling ingredient status', error: error.message });
    }
};

module.exports = {
    getIngredients,
    addIngredient,
    updateIngredient,
    uploadIngredients,
    deleteIngredient,
    getLowStockItems,
    toggleActive
};
