const express = require('express');
const router = express.Router();
const { getRoles, createRole, updateRole, deleteRole, grantAllPermissions } = require('../controllers/roleController');

router.get('/', getRoles);
router.post('/', createRole);
router.post('/grant-all-admin', grantAllPermissions);
router.put('/:id', updateRole);
router.delete('/:id', deleteRole);

module.exports = router;
