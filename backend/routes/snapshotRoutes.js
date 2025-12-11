const express = require('express');
const router = express.Router();
const {
    getSnapshots,
    getSnapshotById,
    createSnapshot,
    deleteSnapshot,
    compareSnapshots
} = require('../controllers/snapshotController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// Routes
router.get('/', getSnapshots);
router.get('/compare/:id1/:id2', compareSnapshots);
router.get('/:id', getSnapshotById);
router.post('/', createSnapshot);
router.delete('/:id', deleteSnapshot);

module.exports = router;
