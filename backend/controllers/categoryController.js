const Category = require('../models/Category');

// Get all categories
const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({ active: true }).sort({ name: 1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener categorías', error: error.message });
    }
};

// Get category by ID
const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }
        res.json(category);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener categoría', error: error.message });
    }
};

// Create category
const createCategory = async (req, res) => {
    try {
        const { name, description, icon, color, subcategories } = req.body;

        // Check if category already exists
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({ message: 'La categoría ya existe' });
        }

        const category = await Category.create({
            name,
            description,
            icon,
            color,
            subcategories,
        });

        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear categoría', error: error.message });
    }
};

// Update category
const updateCategory = async (req, res) => {
    try {
        const { name, description, icon, color, subcategories, active } = req.body;

        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }

        // Check if new name already exists (excluding current category)
        if (name && name !== category.name) {
            const existingCategory = await Category.findOne({ name });
            if (existingCategory) {
                return res.status(400).json({ message: 'Ya existe una categoría con ese nombre' });
            }
        }

        category.name = name || category.name;
        category.description = description !== undefined ? description : category.description;
        category.icon = icon || category.icon;
        category.color = color || category.color;
        category.subcategories = subcategories || category.subcategories;
        category.active = active !== undefined ? active : category.active;

        const updatedCategory = await category.save();
        res.json(updatedCategory);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar categoría', error: error.message });
    }
};

// Delete category (soft delete)
const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }

        category.active = false;
        await category.save();

        res.json({ message: 'Categoría eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar categoría', error: error.message });
    }
};

module.exports = {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
};
