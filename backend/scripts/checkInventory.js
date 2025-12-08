const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Ingredient = require('../models/Ingredient');

dotenv.config();

const checkInventory = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected\n');

        const ingredients = await Ingredient.find({});

        console.log(`📦 Total ingredients in database: ${ingredients.length}\n`);

        console.log('=== INGREDIENTS WITH STOCK ===');
        let totalWithStock = 0;
        let totalValue = 0;

        ingredients.forEach(ing => {
            const stocks = ing.stocks || {};
            const totalQty = (stocks.almacen || 0) + (stocks.cocina || 0) + (stocks.ensalada || 0) + (stocks.isla || 0);

            if (totalQty > 0) {
                totalWithStock++;
                const value = totalQty * ing.cost;
                totalValue += value;

                console.log(`\n📌 ${ing.name}`);
                console.log(`   Cost: $${ing.cost}`);
                console.log(`   Stocks:`);
                console.log(`     - Almacén: ${stocks.almacen || 0}`);
                console.log(`     - Cocina: ${stocks.cocina || 0}`);
                console.log(`     - Ensalada: ${stocks.ensalada || 0}`);
                console.log(`     - Isla: ${stocks.isla || 0}`);
                console.log(`   Total Qty: ${totalQty}`);
                console.log(`   Total Value: $${value.toFixed(2)}`);
            }
        });

        console.log(`\n=== SUMMARY ===`);
        console.log(`Total ingredients with stock: ${totalWithStock}`);
        console.log(`Total inventory value: $${totalValue.toFixed(2)}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

checkInventory();
