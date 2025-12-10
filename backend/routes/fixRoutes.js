const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Role = require('../models/Role');

// Temporary endpoint to fix admin user role
router.post('/fix-admin-role', async (req, res) => {
    try {
        // Find the administrativo role
        const adminRole = await Role.findOne({ name: 'administrativo' });

        if (!adminRole) {
            return res.status(404).json({
                message: 'Role "administrativo" not found. Please seed roles first.'
            });
        }

        // Find and update the admin user
        const adminUser = await User.findOne({ email: 'admin@admin.com' });

        if (!adminUser) {
            return res.status(404).json({
                message: 'User admin@admin.com not found'
            });
        }

        // Check current role
        const currentRole = adminUser.role;
        const isString = typeof currentRole === 'string';

        // Update role to ObjectId
        adminUser.role = adminRole._id;
        await adminUser.save();

        // Populate to verify
        await adminUser.populate('role', 'name');

        res.json({
            message: 'Admin user role fixed successfully!',
            user: {
                email: adminUser.email,
                name: adminUser.name,
                oldRole: currentRole,
                oldRoleWasString: isString,
                newRole: adminUser.role.name,
                newRoleId: adminRole._id
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error fixing admin role',
            error: error.message
        });
    }
});

module.exports = router;
