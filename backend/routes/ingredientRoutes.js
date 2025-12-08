const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getIngredients, addIngredient, updateIngredient, uploadIngredients, deleteIngredient, toggleActive, getLowStockItems } = require('../controllers/ingredientController');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.route('/').get(getIngredients).post(addIngredient);
router.route('/upload').post(upload.single('file'), uploadIngredients);
router.route('/low-stock').get(getLowStockItems);
router.route('/:id').put(updateIngredient).delete(deleteIngredient);
router.route('/:id/toggle').patch(toggleActive);

module.exports = router;
