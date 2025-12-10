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

        // Get paginated results with populated references
        const ingredients = await Ingredient.find(query)
            .populate('category', 'name color icon')
            .populate('supplier', 'name contactName')
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
    const {
        name, detail, sku, barcode, unit,
        category, subcategory, brand, model, color, size, image,
        purchasePrice, salePrice, supplier
    } = req.body;

    try {
        // Calculate margin if both prices provided
        let margin = 0;
        if (purchasePrice && salePrice) {
            margin = ((salePrice - purchasePrice) / purchasePrice) * 100;
        }

        const ingredient = new Ingredient({
            name,
            detail,
            sku,
            barcode,
            unit,
            category,
            subcategory,
            brand,
            model,
            color,
            size,
            image,
            purchasePrice,
            salePrice,
            margin,
            cost: purchasePrice, // Keep for backward compatibility
            supplier,
            stocks: { almacen: 0, cocina: 0, ensalada: 0, isla: 0 }
        });

        const createdIngredient = await ingredient.save();

        // Update QR code with the ID
        createdIngredient.qrCode = createdIngredient._id.toString();
        await createdIngredient.save();

        // Populate references before sending response
        await createdIngredient.populate('category', 'name color icon');
        await createdIngredient.populate('supplier', 'name contactName');

        res.status(201).json(createdIngredient);
    } catch (error) {
        res.status(500).json({ message: 'Error creating ingredient', error: error.message });
    }
};

// @desc    Update an ingredient
// @route   PUT /api/ingredients/:id
// @access  Private
const updateIngredient = async (req, res) => {
    const {
        name, detail, sku, barcode, unit,
        category, subcategory, brand, model, color, size, image,
        purchasePrice, salePrice, supplier
    } = req.body;

    try {
        const ingredient = await Ingredient.findById(req.params.id);

        if (ingredient) {
            ingredient.name = name || ingredient.name;
            ingredient.detail = detail !== undefined ? detail : ingredient.detail;
            ingredient.sku = sku || ingredient.sku;
            ingredient.barcode = barcode !== undefined ? barcode : ingredient.barcode;
            ingredient.unit = unit || ingredient.unit;
            ingredient.category = category !== undefined ? category : ingredient.category;
            ingredient.subcategory = subcategory !== undefined ? subcategory : ingredient.subcategory;
            ingredient.brand = brand !== undefined ? brand : ingredient.brand;
            ingredient.model = model !== undefined ? model : ingredient.model;
            ingredient.color = color !== undefined ? color : ingredient.color;
            ingredient.size = size !== undefined ? size : ingredient.size;
            ingredient.image = image !== undefined ? image : ingredient.image;
            ingredient.purchasePrice = purchasePrice !== undefined ? purchasePrice : ingredient.purchasePrice;
            ingredient.salePrice = salePrice !== undefined ? salePrice : ingredient.salePrice;
            ingredient.supplier = supplier !== undefined ? supplier : ingredient.supplier;

            // Recalculate margin
            if (ingredient.purchasePrice && ingredient.salePrice) {
                ingredient.margin = ((ingredient.salePrice - ingredient.purchasePrice) / ingredient.purchasePrice) * 100;
            }

            // Update cost for backward compatibility
            ingredient.cost = ingredient.purchasePrice;

            const updatedIngredient = await ingredient.save();

            // Populate references
            await updatedIngredient.populate('category', 'name color icon');
            await updatedIngredient.populate('supplier', 'name contactName');

            res.json(updatedIngredient);
        } else {
            res.status(404).json({ message: 'Ingredient not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error updating ingredient', error: error.message });
    }
};

// @desc    Upload ingredients from Excel
// @route   POST /api/ingredients/upload
// @access  Private
const uploadIngredients = async (req, res) => {
    console.log('📤 Received upload request');

    if (!req.file) {
        console.log('❌ No file in request');
        return res.status(400).json({ message: 'Por favor sube un archivo Excel (.xlsx o .xls)' });
    }

    console.log('📁 File received:', req.file.originalname, 'Size:', req.file.size);

    try {
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        console.log('📊 Parsed Excel data:', data.length, 'rows');
        console.log('📋 First row keys:', data[0] ? Object.keys(data[0]) : 'No data');

        if (data.length === 0) {
            return res.status(400).json({ message: 'El archivo Excel está vacío o no tiene datos válidos' });
        }

        // Helper function to find column value (case-insensitive, supports multiple names)
        const getColumnValue = (row, possibleNames) => {
            for (const name of possibleNames) {
                // Check exact match or case-insensitive match
                const key = Object.keys(row).find(k =>
                    k.toLowerCase() === name.toLowerCase() ||
                    k.toLowerCase().replace(/\s+/g, '') === name.toLowerCase().replace(/\s+/g, '')
                );
                if (key && row[key] !== undefined && row[key] !== null && row[key] !== '') {
                    return row[key];
                }
            }
            return null;
        };

        const createdIngredients = [];
        const errors = [];

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const rowNum = i + 2; // Excel rows start at 1, plus header row

            // Try multiple possible column names (Spanish and English)
            const name = getColumnValue(row, ['Name', 'Nombre', 'NOMBRE', 'NAME', 'Producto', 'PRODUCTO']);
            const detail = getColumnValue(row, ['Detail', 'Detalle', 'DETALLE', 'DETAIL', 'Descripcion', 'Descripción', 'DESCRIPCION', 'Marca', 'MARCA']);
            const unit = getColumnValue(row, ['Unit', 'Unidad', 'UNIDAD', 'UNIT', 'Unidades']);
            const cost = getColumnValue(row, ['Cost', 'Costo', 'COSTO', 'COST', 'Precio', 'PRECIO', 'PrecioCompra', 'Precio Compra']);
            const sku = getColumnValue(row, ['SKU', 'Sku', 'sku', 'Codigo', 'CODIGO', 'Código', 'Code', 'CODE']);

            console.log(`📝 Row ${rowNum}:`, { name, detail, unit, cost, sku });

            // Basic validation
            if (!name) {
                errors.push(`Fila ${rowNum}: Falta el nombre del producto`);
                continue;
            }

            // Default values for missing fields
            const normalizedUnit = unit ?
                (['PIEZA', 'PAQUETE', 'MILILITRO', 'LITRO', 'GRAMO', 'KILO'].includes(unit.toUpperCase())
                    ? unit.toUpperCase()
                    : 'PIEZA')
                : 'PIEZA';

            const parsedCost = cost ? Number(cost) : 0;

            // Generate SKU if not provided: First 3 letters of name + timestamp + row number
            const generateSku = () => {
                const prefix = String(name).trim().substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X');
                const timestamp = Date.now().toString(36).toUpperCase();
                return `${prefix}-${timestamp}-${rowNum}`;
            };

            const finalSku = sku ? String(sku).trim().toUpperCase() : generateSku();

            try {
                const ingredient = await Ingredient.create({
                    name: String(name).trim(),
                    detail: detail ? String(detail).trim() : '',
                    sku: finalSku,
                    unit: normalizedUnit,
                    cost: isNaN(parsedCost) ? 0 : parsedCost,
                    purchasePrice: isNaN(parsedCost) ? 0 : parsedCost,
                    qrCode: 'temp',
                    stocks: { almacen: 0, cocina: 0, ensalada: 0, isla: 0 }
                });

                ingredient.qrCode = ingredient._id.toString();
                await ingredient.save();
                createdIngredients.push(ingredient);
                console.log(`✅ Created ingredient: ${ingredient.name} (SKU: ${ingredient.sku})`);
            } catch (createError) {
                console.error(`❌ Error creating ingredient from row ${rowNum}:`, createError.message);
                errors.push(`Fila ${rowNum}: ${createError.message}`);
            }
        }

        console.log(`📊 Summary: Created ${createdIngredients.length} ingredients, ${errors.length} errors`);

        if (createdIngredients.length === 0 && errors.length > 0) {
            return res.status(400).json({
                message: 'No se pudo importar ningún ingrediente',
                errors: errors.slice(0, 10) // Limit to first 10 errors
            });
        }

        res.status(201).json({
            message: `Se importaron ${createdIngredients.length} ingrediente(s)`,
            count: createdIngredients.length,
            ingredients: createdIngredients,
            errors: errors.length > 0 ? errors.slice(0, 5) : undefined,
            length: createdIngredients.length // For backward compatibility
        });
    } catch (error) {
        console.error('❌ Error processing Excel file:', error);
        res.status(500).json({
            message: 'Error al procesar el archivo Excel',
            error: error.message
        });
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

// @desc    Download Excel template for ingredient upload
// @route   GET /api/ingredients/template
// @access  Public
const downloadTemplate = async (req, res) => {
    try {
        // Create template data with example rows
        const templateData = [
            {
                Nombre: 'Jitomate',
                Detalle: 'Saladet',
                Unidad: 'KILO',
                Costo: 25.50,
                SKU: 'JIT-001'
            },
            {
                Nombre: 'Lechuga',
                Detalle: 'Romana',
                Unidad: 'PIEZA',
                Costo: 15.00,
                SKU: 'LEC-001'
            },
            {
                Nombre: 'Cebolla',
                Detalle: 'Blanca',
                Unidad: 'KILO',
                Costo: 18.00,
                SKU: 'CEB-001'
            },
            {
                Nombre: 'Aguacate',
                Detalle: 'Hass',
                Unidad: 'KILO',
                Costo: 65.00,
                SKU: '' // Empty to show it's optional
            },
            {
                Nombre: 'Limón',
                Detalle: '',
                Unidad: 'KILO',
                Costo: 22.00,
                SKU: '' // Empty to show it's optional
            },
        ];

        // Create workbook and worksheet
        const workbook = xlsx.utils.book_new();
        const worksheet = xlsx.utils.json_to_sheet(templateData);

        // Set column widths for better readability
        worksheet['!cols'] = [
            { wch: 20 }, // Nombre
            { wch: 15 }, // Detalle
            { wch: 12 }, // Unidad
            { wch: 10 }, // Costo
            { wch: 12 }, // SKU
        ];

        xlsx.utils.book_append_sheet(workbook, worksheet, 'Ingredientes');

        // Generate buffer
        const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        // Set headers for file download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=plantilla_ingredientes.xlsx');
        res.setHeader('Content-Length', buffer.length);

        res.send(buffer);
    } catch (error) {
        console.error('Error generating template:', error);
        res.status(500).json({ message: 'Error al generar la plantilla', error: error.message });
    }
};

module.exports = {
    getIngredients,
    addIngredient,
    updateIngredient,
    uploadIngredients,
    deleteIngredient,
    getLowStockItems,
    toggleActive,
    downloadTemplate
};
