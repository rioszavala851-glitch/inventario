const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Role = require('../models/Role');
const User = require('../models/User');

dotenv.config();

const seedRoles = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected');

        // Define system roles with expanded permissions
        const systemRoles = [
            {
                name: 'administrativo',
                displayName: 'Administrativo',
                permissions: [
                    // Dashboard
                    'view_dashboard', 'view_analytics',
                    // Ingredientes
                    'manage_ingredients', 'create_ingredient', 'edit_ingredient', 'delete_ingredient',
                    'import_ingredients', 'export_ingredients', 'generate_qr_codes',
                    // Inventario
                    'capture_inventory', 'view_all_areas', 'edit_inventory', 'delete_inventory',
                    'transfer_inventory', 'adjust_inventory',
                    // Histórico
                    'view_history', 'create_snapshot', 'delete_snapshot', 'export_history', 'view_detailed_history',
                    // Reportes
                    'view_reports', 'generate_reports', 'export_reports', 'schedule_reports',
                    // Administración
                    'manage_users', 'manage_roles', 'manage_permissions', 'view_audit_log',
                    'manage_settings', 'backup_data',
                    // Notificaciones
                    'receive_alerts', 'manage_notifications', 'send_notifications'
                ],
                color: '#8b5cf6',
                icon: 'ShieldCheck',
                isSystem: true
            },
            {
                name: 'gerente',
                displayName: 'Gerente',
                permissions: [
                    // Dashboard
                    'view_dashboard', 'view_analytics',
                    // Ingredientes
                    'create_ingredient', 'edit_ingredient', 'import_ingredients', 'export_ingredients',
                    // Inventario
                    'view_all_areas', 'transfer_inventory', 'adjust_inventory',
                    // Histórico
                    'view_history', 'create_snapshot', 'export_history', 'view_detailed_history',
                    // Reportes
                    'view_reports', 'generate_reports', 'export_reports',
                    // Notificaciones
                    'receive_alerts', 'send_notifications'
                ],
                color: '#3b82f6',
                icon: 'Briefcase',
                isSystem: true
            },
            {
                name: 'auditor',
                displayName: 'Auditor',
                permissions: [
                    // Dashboard
                    'view_dashboard', 'view_analytics',
                    // Ingredientes (solo lectura)
                    'export_ingredients',
                    // Inventario (solo lectura)
                    'view_all_areas',
                    // Histórico
                    'view_history', 'export_history', 'view_detailed_history',
                    // Reportes
                    'view_reports', 'export_reports',
                    // Administración
                    'view_audit_log',
                    // Notificaciones
                    'receive_alerts'
                ],
                color: '#10b981',
                icon: 'FileSearch',
                isSystem: true
            },
            {
                name: 'almacen',
                displayName: 'Almacén',
                permissions: [
                    'view_dashboard', 'export_ingredients', 'capture_inventory',
                    'view_own_area', 'edit_inventory', 'view_history', 'receive_alerts'
                ],
                color: '#6366f1',
                icon: 'Archive',
                isSystem: true
            },
            {
                name: 'cocina',
                displayName: 'Cocina',
                permissions: [
                    'view_dashboard', 'export_ingredients', 'capture_inventory',
                    'view_own_area', 'edit_inventory', 'view_history', 'receive_alerts'
                ],
                color: '#f59e0b',
                icon: 'ChefHat',
                isSystem: true
            },
            {
                name: 'ensalada',
                displayName: 'Ensalada',
                permissions: [
                    'view_dashboard', 'export_ingredients', 'capture_inventory',
                    'view_own_area', 'edit_inventory', 'view_history', 'receive_alerts'
                ],
                color: '#ec4899',
                icon: 'Salad',
                isSystem: true
            },
            {
                name: 'isla',
                displayName: 'Isla',
                permissions: [
                    'view_dashboard', 'export_ingredients', 'capture_inventory',
                    'view_own_area', 'edit_inventory', 'view_history', 'receive_alerts'
                ],
                color: '#f43f5e',
                icon: 'Utensils',
                isSystem: true
            }
        ];

        console.log('🌱 Seeding roles...');

        // Create or update roles
        for (const roleData of systemRoles) {
            const existingRole = await Role.findOne({ name: roleData.name });

            if (existingRole) {
                console.log(`  ⚠️  Role "${roleData.name}" already exists, updating...`);
                await Role.findByIdAndUpdate(existingRole._id, roleData);
            } else {
                console.log(`  ✅ Creating role "${roleData.name}"`);
                await Role.create(roleData);
            }
        }

        console.log('✅ Roles seeded successfully');

        // Optional: Migrate existing users to reference roles
        console.log('🔄 Migrating existing users...');

        const users = await User.find({});
        let migratedCount = 0;

        for (const user of users) {
            // Check if user.role is a string (old format)
            if (typeof user.role === 'string') {
                const role = await Role.findOne({ name: user.role.toLowerCase() });

                if (role) {
                    user.role = role._id;
                    await user.save();
                    migratedCount++;
                    console.log(`  ✅ Migrated user "${user.name}" to role "${role.name}"`);
                } else {
                    console.log(`  ⚠️  No matching role found for user "${user.name}" with role "${user.role}"`);
                }
            }
        }

        console.log(`✅ Migrated ${migratedCount} users`);
        console.log('🎉 Seed completed successfully!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding roles:', error);
        process.exit(1);
    }
};

seedRoles();
