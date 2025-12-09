const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    displayName: {
        type: String,
        required: true
    },
    permissions: [{
        type: String,
        enum: [
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
        ]
    }],
    color: {
        type: String,
        default: '#6366f1'
    },
    icon: {
        type: String,
        default: 'Box'
    },
    isSystem: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Role', roleSchema);
