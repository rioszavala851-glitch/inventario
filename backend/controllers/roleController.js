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
        const { name, displayName, permissions, color, icon } = req.body;

        const role = await Role.findById(id);

        if (!role) {
            return res.status(404).json({ message: 'Rol no encontrado' });
        }

        // Update fields - all roles are now fully editable
        if (name) role.name = name.toLowerCase();
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

// @desc    Grant all permissions to administrativo role
// @route   POST /api/roles/grant-all-admin
// @access  Private (Admin only)
const grantAllPermissions = async (req, res) => {
    try {
        // All available permissions
        const ALL_PERMISSIONS = [
            // Dashboard
            'view_dashboard', 'view_analytics',
            // Ingredientes
            'manage_ingredients', 'create_ingredient', 'edit_ingredient', 'delete_ingredient',
            'import_ingredients', 'export_ingredients', 'generate_qr_codes',
            // Inventario
            'capture_inventory', 'view_all_areas', 'view_own_area', 'edit_inventory',
            'delete_inventory', 'transfer_inventory', 'adjust_inventory',
            // Histórico
            'view_history', 'create_snapshot', 'delete_snapshot', 'export_history', 'view_detailed_history',
            // Reportes
            'view_reports', 'generate_reports', 'export_reports', 'schedule_reports',
            // Administración
            'manage_users', 'manage_roles', 'manage_permissions', 'view_audit_log',
            'manage_settings', 'backup_data',
            // Notificaciones
            'receive_alerts', 'manage_notifications', 'send_notifications'
        ];

        // Find and update the administrativo role
        const result = await Role.findOneAndUpdate(
            { name: 'administrativo' },
            {
                $set: {
                    permissions: ALL_PERMISSIONS,
                    isSystem: true
                }
            },
            { new: true }
        );

        if (result) {
            res.json({
                message: 'Permisos de administrador actualizados',
                permissions: result.permissions.length,
                role: result
            });
        } else {
            // Create if doesn't exist
            const newRole = await Role.create({
                name: 'administrativo',
                displayName: 'Administrador',
                permissions: ALL_PERMISSIONS,
                color: '#8b5cf6',
                icon: 'ShieldCheck',
                isSystem: true
            });

            res.status(201).json({
                message: 'Rol de administrador creado con todos los permisos',
                permissions: newRole.permissions.length,
                role: newRole
            });
        }
    } catch (error) {
        console.error('Error granting permissions:', error);
        res.status(500).json({ message: 'Error al otorgar permisos' });
    }
};

module.exports = {
    getRoles,
    createRole,
    updateRole,
    deleteRole,
    grantAllPermissions
};
