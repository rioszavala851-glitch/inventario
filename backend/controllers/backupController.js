const Ingredient = require('../models/Ingredient');
const Inventory = require('../models/Inventory');
const User = require('../models/User');
const Role = require('../models/Role');
const Category = require('../models/Category');
const Supplier = require('../models/Supplier');
const Snapshot = require('../models/Snapshot');

// @desc    Export all data as JSON backup
// @route   GET /api/backup/export
// @access  Private/Admin
const exportData = async (req, res) => {
    try {
        const { collections = 'all' } = req.query;

        const backup = {
            createdAt: new Date().toISOString(),
            version: '1.0.0',
            app: 'StockZavala',
            data: {}
        };

        const collectionsToExport = collections === 'all'
            ? ['ingredients', 'inventory', 'categories', 'suppliers', 'roles', 'users', 'snapshots']
            : collections.split(',');

        if (collectionsToExport.includes('ingredients')) {
            backup.data.ingredients = await Ingredient.find({}).lean();
        }

        if (collectionsToExport.includes('inventory')) {
            backup.data.inventory = await Inventory.find({}).lean();
        }

        if (collectionsToExport.includes('categories')) {
            backup.data.categories = await Category.find({}).lean();
        }

        if (collectionsToExport.includes('suppliers')) {
            backup.data.suppliers = await Supplier.find({}).lean();
        }

        if (collectionsToExport.includes('roles')) {
            backup.data.roles = await Role.find({}).lean();
        }

        if (collectionsToExport.includes('users')) {
            // Exclude passwords
            backup.data.users = await User.find({}).select('-password').lean();
        }

        if (collectionsToExport.includes('snapshots')) {
            backup.data.snapshots = await Snapshot.find({}).lean();
        }

        // Set headers for file download
        res.setHeader('Content-Type', 'application/json');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=stockzavala_backup_${new Date().toISOString().split('T')[0]}.json`
        );

        res.json(backup);
    } catch (error) {
        console.error('Error exporting data:', error);
        res.status(500).json({ message: 'Error al exportar datos' });
    }
};

// @desc    Import data from JSON backup
// @route   POST /api/backup/import
// @access  Private/Admin
const importData = async (req, res) => {
    try {
        const { data, options = {} } = req.body;
        const {
            clearExisting = false,
            skipUsers = true,
            skipRoles = true
        } = options;

        if (!data) {
            return res.status(400).json({ message: 'No se proporcionaron datos para importar' });
        }

        const results = {
            ingredients: { imported: 0, skipped: 0 },
            inventory: { imported: 0, skipped: 0 },
            categories: { imported: 0, skipped: 0 },
            suppliers: { imported: 0, skipped: 0 },
            roles: { imported: 0, skipped: 0 },
            users: { imported: 0, skipped: 0 },
            snapshots: { imported: 0, skipped: 0 }
        };

        // Categories
        if (data.categories && data.categories.length > 0) {
            if (clearExisting) {
                await Category.deleteMany({});
            }
            for (const category of data.categories) {
                try {
                    const existing = await Category.findOne({ name: category.name });
                    if (!existing) {
                        const { _id, ...categoryData } = category;
                        await Category.create(categoryData);
                        results.categories.imported++;
                    } else {
                        results.categories.skipped++;
                    }
                } catch (e) {
                    results.categories.skipped++;
                }
            }
        }

        // Suppliers
        if (data.suppliers && data.suppliers.length > 0) {
            if (clearExisting) {
                await Supplier.deleteMany({});
            }
            for (const supplier of data.suppliers) {
                try {
                    const existing = await Supplier.findOne({ name: supplier.name });
                    if (!existing) {
                        const { _id, ...supplierData } = supplier;
                        await Supplier.create(supplierData);
                        results.suppliers.imported++;
                    } else {
                        results.suppliers.skipped++;
                    }
                } catch (e) {
                    results.suppliers.skipped++;
                }
            }
        }

        // Ingredients
        if (data.ingredients && data.ingredients.length > 0) {
            if (clearExisting) {
                await Ingredient.deleteMany({});
            }
            for (const ingredient of data.ingredients) {
                try {
                    const existing = await Ingredient.findOne({
                        $or: [
                            { sku: ingredient.sku },
                            { name: ingredient.name }
                        ]
                    });
                    if (!existing) {
                        const { _id, category, supplier, ...ingredientData } = ingredient;

                        // Try to find matching category/supplier by name
                        if (category) {
                            const cat = await Category.findOne({ name: category.name || category });
                            if (cat) ingredientData.category = cat._id;
                        }
                        if (supplier) {
                            const sup = await Supplier.findOne({ name: supplier.name || supplier });
                            if (sup) ingredientData.supplier = sup._id;
                        }

                        await Ingredient.create(ingredientData);
                        results.ingredients.imported++;
                    } else {
                        results.ingredients.skipped++;
                    }
                } catch (e) {
                    results.ingredients.skipped++;
                }
            }
        }

        // Roles (if not skipped)
        if (!skipRoles && data.roles && data.roles.length > 0) {
            for (const role of data.roles) {
                try {
                    const existing = await Role.findOne({ name: role.name });
                    if (!existing) {
                        const { _id, ...roleData } = role;
                        await Role.create(roleData);
                        results.roles.imported++;
                    } else {
                        results.roles.skipped++;
                    }
                } catch (e) {
                    results.roles.skipped++;
                }
            }
        }

        res.json({
            message: 'Importación completada',
            results
        });
    } catch (error) {
        console.error('Error importing data:', error);
        res.status(500).json({ message: 'Error al importar datos' });
    }
};

// @desc    Get backup status/info
// @route   GET /api/backup/status
// @access  Private/Admin
const getBackupStatus = async (req, res) => {
    try {
        const counts = {
            ingredients: await Ingredient.countDocuments(),
            inventory: await Inventory.countDocuments(),
            categories: await Category.countDocuments(),
            suppliers: await Supplier.countDocuments(),
            roles: await Role.countDocuments(),
            users: await User.countDocuments(),
            snapshots: await Snapshot.countDocuments()
        };

        const totalDocuments = Object.values(counts).reduce((a, b) => a + b, 0);

        res.json({
            status: 'ok',
            database: 'MongoDB Atlas',
            collections: counts,
            totalDocuments,
            lastChecked: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error getting backup status:', error);
        res.status(500).json({ message: 'Error al obtener estado' });
    }
};

module.exports = {
    exportData,
    importData,
    getBackupStatus
};
