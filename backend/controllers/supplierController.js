const Supplier = require('../models/Supplier');

// Get all suppliers
const getSuppliers = async (req, res) => {
    try {
        const suppliers = await Supplier.find({ active: true }).sort({ name: 1 });
        res.json(suppliers);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener proveedores', error: error.message });
    }
};

// Get supplier by ID
const getSupplierById = async (req, res) => {
    try {
        const supplier = await Supplier.findById(req.params.id);
        if (!supplier) {
            return res.status(404).json({ message: 'Proveedor no encontrado' });
        }
        res.json(supplier);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener proveedor', error: error.message });
    }
};

// Create supplier
const createSupplier = async (req, res) => {
    try {
        const { name, contactName, email, phone, address, rfc, paymentTerms, deliveryTime, notes } = req.body;

        const supplier = await Supplier.create({
            name,
            contactName,
            email,
            phone,
            address,
            rfc,
            paymentTerms,
            deliveryTime,
            notes,
        });

        res.status(201).json(supplier);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear proveedor', error: error.message });
    }
};

// Update supplier
const updateSupplier = async (req, res) => {
    try {
        const { name, contactName, email, phone, address, rfc, paymentTerms, deliveryTime, notes, active } = req.body;

        const supplier = await Supplier.findById(req.params.id);
        if (!supplier) {
            return res.status(404).json({ message: 'Proveedor no encontrado' });
        }

        supplier.name = name || supplier.name;
        supplier.contactName = contactName !== undefined ? contactName : supplier.contactName;
        supplier.email = email !== undefined ? email : supplier.email;
        supplier.phone = phone !== undefined ? phone : supplier.phone;
        supplier.address = address !== undefined ? address : supplier.address;
        supplier.rfc = rfc !== undefined ? rfc : supplier.rfc;
        supplier.paymentTerms = paymentTerms || supplier.paymentTerms;
        supplier.deliveryTime = deliveryTime !== undefined ? deliveryTime : supplier.deliveryTime;
        supplier.notes = notes !== undefined ? notes : supplier.notes;
        supplier.active = active !== undefined ? active : supplier.active;

        const updatedSupplier = await supplier.save();
        res.json(updatedSupplier);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar proveedor', error: error.message });
    }
};

// Delete supplier (soft delete)
const deleteSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findById(req.params.id);
        if (!supplier) {
            return res.status(404).json({ message: 'Proveedor no encontrado' });
        }

        supplier.active = false;
        await supplier.save();

        res.json({ message: 'Proveedor eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar proveedor', error: error.message });
    }
};

module.exports = {
    getSuppliers,
    getSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier,
};
