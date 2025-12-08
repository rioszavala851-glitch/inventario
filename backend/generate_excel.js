const XLSX = require('xlsx');

// Datos de ejemplo para ingredientes
const ingredientes = [
    { Name: 'Jitomate', Detail: 'Saladet', Unit: 'KILO', Cost: 25.50 },
    { Name: 'Lechuga', Detail: 'Romana', Unit: 'PIEZA', Cost: 15.00 },
    { Name: 'Cebolla', Detail: 'Blanca', Unit: 'KILO', Cost: 18.00 },
    { Name: 'Aguacate', Detail: 'Hass', Unit: 'KILO', Cost: 65.00 },
    { Name: 'Limón', Detail: '', Unit: 'KILO', Cost: 22.00 },
    { Name: 'Cilantro', Detail: '', Unit: 'PAQUETE', Cost: 8.00 },
    { Name: 'Chile Jalapeño', Detail: '', Unit: 'KILO', Cost: 35.00 },
    { Name: 'Queso Panela', Detail: 'Lala', Unit: 'KILO', Cost: 95.00 },
    { Name: 'Aceite Vegetal', Detail: 'Nutrioli', Unit: 'LITRO', Cost: 42.00 },
    { Name: 'Sal', Detail: 'La Fina', Unit: 'KILO', Cost: 12.00 },
    { Name: 'Pimienta Negra', Detail: '', Unit: 'GRAMO', Cost: 0.80 },
    { Name: 'Tortillas', Detail: 'Maíz', Unit: 'PAQUETE', Cost: 18.00 },
    { Name: 'Frijoles', Detail: 'Negros', Unit: 'KILO', Cost: 28.00 },
    { Name: 'Arroz', Detail: 'Blanco', Unit: 'KILO', Cost: 22.00 },
    { Name: 'Pollo', Detail: 'Pechuga', Unit: 'KILO', Cost: 85.00 }
];

// Crear un nuevo libro de trabajo
const wb = XLSX.utils.book_new();

// Convertir los datos a una hoja de cálculo
const ws = XLSX.utils.json_to_sheet(ingredientes);

// Agregar la hoja al libro
XLSX.utils.book_append_sheet(wb, ws, 'Ingredientes');

// Guardar el archivo
XLSX.writeFile(wb, 'ingredientes_ejemplo.xlsx');

console.log('✅ Archivo Excel creado: ingredientes_ejemplo.xlsx');
