const Role = require('../models/Role');
const User = require('../models/User');

// @desc    Get all roles
// @route   GET /api/roles
// @access  Private (Admin only)
const getRoles = async (req, res) => {
    try {
        const roles = await Role.find({}).sort({ name: 1 });
        res.json(roles);
    } catch (error) {
        console.error('Error fetching roles:', error);
        res.status(500).json({ message: 'Error al obtener roles' });
    }
};

// @desc    Create new role
// @route   POST /api/roles
// @access  Private (Admin only)
const createRole = async (req, res) => {
    try {
        const { name, displayName, permissions, color, icon } = req.body;

        // Validate required fields
        if (!name || !displayName) {
            return res.status(400).json({ message: 'Nombre y nombre para mostrar son requeridos' });
        }

        // Check if role already exists
        const existingRole = await Role.findOne({ name: name.toLowerCase() });
        if (existingRole) {
            return res.status(400).json({ message: 'Ya existe un rol con ese nombre' });
        }

        const role = await Role.create({
            name: name.toLowerCase(),
            displayName,
            permissions: permissions || [],
            color: color || '#6366f1',
            icon: icon || 'Box',
            isSystem: false
        });

        res.status(201).json(role);
    } catch (error) {
        console.error('Error creating role:', error);
        res.status(500).json({ message: 'Error al crear rol' });
    }
};

// @desc    Update role
// @route   PUT /api/roles/:id
// @access  Private (Admin only)
const updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { displayName, permissions, color, icon } = req.body;

        const role = await Role.findById(id);

        if (!role) {
            return res.status(404).json({ message: 'Rol no encontrado' });
        }

        // Prevent editing system role name
        if (role.isSystem && req.body.name) {
            return res.status(403).json({ message: 'No se puede cambiar el nombre de un rol del sistema' });
        }

        // Update fields
        if (displayName) role.displayName = displayName;
        if (permissions) role.permissions = permissions;
        if (color) role.color = color;
        if (icon) role.icon = icon;

        await role.save();
        res.json(role);
    } catch (error) {
        console.error('Error updating role:', error);
        res.status(500).json({ message: 'Error al actualizar rol' });
    }
};

// @desc    Delete role
// @route   DELETE /api/roles/:id
// @access  Private (Admin only)
const deleteRole = async (req, res) => {
    try {
        const { id } = req.params;

        const role = await Role.findById(id);

        if (!role) {
            return res.status(404).json({ message: 'Rol no encontrado' });
        }

        // Prevent deleting system roles
        if (role.isSystem) {
            return res.status(403).json({ message: 'No se pueden eliminar roles del sistema' });
        }

        // Check if any users have this role
        const usersWithRole = await User.countDocuments({ role: id });
        if (usersWithRole > 0) {
            return res.status(400).json({
                message: `No se puede eliminar. Hay ${usersWithRole} usuario(s) con este rol`
            });
        }

        await Role.findByIdAndDelete(id);
        res.json({ message: 'Rol eliminado exitosamente' });
    } catch (error) {
        console.error('Error deleting role:', error);
        res.status(500).json({ message: 'Error al eliminar rol' });
    }
};

module.exports = {
    getRoles,
    createRole,
    updateRole,
    deleteRole
};
