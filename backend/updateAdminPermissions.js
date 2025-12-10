// Script to update the Administrativo role with all permissions
require('dotenv').config();
const mongoose = require('mongoose');
const Role = require('./models/Role');

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

const updateAdminRole = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        console.log('URI:', process.env.MONGO_URI ? 'Found' : 'Not found');

        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000
        });
        console.log('✅ Connected to MongoDB');

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
            console.log('✅ Administrativo role updated with ALL permissions!');
            console.log(`📋 Total permissions: ${result.permissions.length}`);
        } else {
            console.log('❌ Administrativo role not found. Creating it...');

            const newRole = await Role.create({
                name: 'administrativo',
                displayName: 'Administrador',
                permissions: ALL_PERMISSIONS,
                color: '#8b5cf6',
                icon: 'ShieldCheck',
                isSystem: true
            });

            console.log('✅ Administrativo role created with ALL permissions!');
            console.log(`📋 Total permissions: ${newRole.permissions.length}`);
        }

        await mongoose.disconnect();
        console.log('✅ Done!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

updateAdminRole();
