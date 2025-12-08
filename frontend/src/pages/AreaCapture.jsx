import { useState, useEffect } from 'react';
import axios from 'axios';
import { Scan, Save, Search, Minus, Plus, Box, Filter, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import QRScanner from '../components/QRScanner';
import API_BASE_URL from '../config/api';

const AreaCapture = ({ areaTitle, areaKey }) => {
    const { isAdmin } = useAuth();
    const [ingredients, setIngredients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [scanning, setScanning] = useState(false);
    const [highlightedId, setHighlightedId] = useState(null);

    // Gradient branding per area
    const AREA_THEMES = {
        almacen: 'from-blue-600 to-indigo-600',
        cocina: 'from-violet-600 to-purple-600',
        ensalada: 'from-pink-600 to-rose-600',
        isla: 'from-orange-500 to-red-500',
    };

    useEffect(() => {
        fetchIngredients();
    }, []);

    const fetchIngredients = async () => {
        try {
            const { data } = await axios.get(`${API_BASE_URL}/api/ingredients?limit=1000`);
            setIngredients(data.ingredients || data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleStockChange = (id, newQty) => {
        // Allow decimals: keep as is if string, verify valid format
        setIngredients(prev => prev.map(item =>
            item._id === id
                ? { ...item, stocks: { ...item.stocks, [areaKey]: newQty } }
                : item
        ));
    };

    const handleSave = async () => {
        try {
            const updates = ingredients.map(item => ({
                ingredientId: item._id,
                area: areaKey,
                quantity: item.stocks ? item.stocks[areaKey] || 0 : 0
            }));

            console.log('Saving updates to:', `${API_BASE_URL}/api/inventory/bulk-update`);
            await axios.post(`${API_BASE_URL}/api/inventory/bulk-update`, { updates });
            alert('Inventario guardado exitosamente!');
        } catch (error) {
            console.error('Failed to save inventory', error);
            const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
            alert(`Error al guardar el inventario: ${errorMessage}`);
        }
    };

    const formatCurrency = (val) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val);

    const filteredIngredients = (ingredients || []).filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalValue = filteredIngredients.reduce((acc, item) => {
        const stock = item.stocks ? Number(item.stocks[areaKey]) || 0 : 0;
        return acc + (stock * item.cost);
    }, 0);

    const handleQRScan = (decodedText) => {
        console.log('QR Scanned:', decodedText);
        setScanning(false);

        const ingredient = ingredients.find(item => item._id === decodedText);

        if (ingredient) {
            setHighlightedId(decodedText);
            setSearchTerm(ingredient.name);

            setTimeout(() => {
                const element = document.getElementById(`product-${decodedText}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);

            setTimeout(() => setHighlightedId(null), 3000);
        } else {
            alert('Producto no encontrado. Verifica el código QR.');
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Hero Section */}
            <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${AREA_THEMES[areaKey] || 'from-gray-700 to-gray-900'} p-8 text-white shadow-xl`}>
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 blur-3xl rounded-full" />

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <p className="text-blue-100 font-medium mb-1">Captura de Inventario</p>
                        <h1 className="text-4xl font-extrabold capitalize mb-2">{areaTitle}</h1>
                        <p className="text-white/80 text-sm max-w-md">
                            Administra y actualiza el stock de {areaTitle} en tiempo real.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setScanning(!scanning)}
                            className={`flex items-center px-5 py-3 rounded-xl font-bold transition-all shadow-lg backdrop-blur-md border border-white/20
                                ${scanning ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-white text-gray-900 hover:bg-gray-50'}`}
                        >
                            <Scan className="w-5 h-5 mr-2" />
                            {scanning ? 'Detener' : 'Escanear'}
                        </button>
                    </div>
                </div>
            </div>

            {/* QR Scanner Modal */}
            {scanning && (
                <QRScanner
                    onScan={handleQRScan}
                    onClose={() => setScanning(false)}
                />
            )}

            {/* Controls & Stats */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between sticky top-0 z-40 bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur-lg py-4 -mx-4 px-4 md:static md:bg-transparent md:p-0">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 transition-colors group-focus-within:text-primary-500" />
                    <input
                        type="text"
                        placeholder="Buscar producto..."
                        className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all shadow-sm dark:text-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {isAdmin() && searchTerm.trim() !== '' && (
                    <div className="flex items-center gap-4 bg-white dark:bg-gray-800 px-6 py-3 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="text-right">
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Valor Total</p>
                            <p className="text-xl font-bold text-gray-800 dark:text-white">{formatCurrency(totalValue)}</p>
                        </div>
                        <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
                            <Filter className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        </div>
                    </div>
                )}
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {loading ? (
                    [...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 rounded-3xl p-6 animate-pulse border border-gray-100 dark:border-gray-700">
                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                        </div>
                    ))
                ) : searchTerm.trim() === '' ? (
                    <div className="col-span-full text-center py-16">
                        <Search className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                        <h3 className="text-xl font-bold text-gray-400 dark:text-gray-500 mb-2">
                            Busca un producto para comenzar
                        </h3>
                        <p className="text-gray-400 dark:text-gray-600">
                            Usa el buscador o escanea un código QR
                        </p>
                    </div>
                ) : filteredIngredients.length === 0 ? (
                    <div className="col-span-full text-center py-16">
                        <Box className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                        <h3 className="text-xl font-bold text-gray-400 dark:text-gray-500 mb-2">
                            No se encontraron productos
                        </h3>
                        <p className="text-gray-400 dark:text-gray-600">
                            Intenta con otro término de búsqueda
                        </p>
                    </div>
                ) : filteredIngredients.map((item) => {
                    const stock = item.stocks ? item.stocks[areaKey] || 0 : 0;
                    const isHighlighted = item._id === highlightedId;
                    return (
                        <div
                            key={item._id}
                            id={`product-${item._id}`}
                            className={`bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-sm border transition-all ${isHighlighted
                                ? 'border-primary-500 ring-4 ring-primary-500/20 shadow-lg'
                                : 'border-gray-100 dark:border-gray-700 hover:shadow-md'
                                } flex flex-col justify-between group`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-start gap-4 flex-1">
                                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-2xl group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-colors">
                                        <Box className="w-6 h-6 text-gray-400 group-hover:text-primary-500 transition-colors" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-800 dark:text-white text-lg leading-tight mb-1">{item.name}</h3>
                                        {isAdmin() && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{item.unit} • ${item.cost}</p>
                                        )}
                                        {!isAdmin() && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{item.unit}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Low stock warning badge */}
                                {stock < (item.minStock || 10) && (
                                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${stock === 0
                                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                        : stock < (item.minStock || 10) / 2
                                            ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                                        }`}>
                                        <AlertTriangle className="w-3 h-3" />
                                        {stock === 0 ? 'Agotado' : 'Bajo'}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
                                    <button
                                        onClick={() => handleStockChange(item._id, Math.max(0, Number(stock) - 1))}
                                        className="p-2.5 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-xl transition-all shadow-sm border border-gray-200 dark:border-gray-700 active:scale-95"
                                    >
                                        <Minus className="w-5 h-5" />
                                    </button>
                                    <div className="text-center px-2 w-24">
                                        <input
                                            type="number"
                                            value={stock}
                                            onChange={(e) => handleStockChange(item._id, e.target.value)}
                                            step="0.001"
                                            className="w-full text-center text-3xl font-bold text-gray-800 dark:text-white bg-transparent border-none focus:ring-0 p-0 tabular-nums outline-none appearance-none"
                                            onFocus={(e) => e.target.select()}
                                        />
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">{item.unit}</p>
                                    </div>
                                    <button
                                        onClick={() => handleStockChange(item._id, Number(stock) + 1)}
                                        className="p-2.5 bg-white dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 rounded-xl transition-all shadow-sm border border-gray-200 dark:border-gray-700 active:scale-95"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>

                                {isAdmin() && (
                                    <div className="flex items-center justify-between px-4 py-2 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
                                        <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wide">Subtotal</span>
                                        <span className="text-sm font-bold text-primary-700 dark:text-primary-300">{formatCurrency(Number(stock) * item.cost)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Floating Save Button */}
            {searchTerm.trim() !== '' && filteredIngredients.length > 0 && (
                <div className="fixed bottom-8 right-8 z-50">
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-2xl shadow-2xl shadow-green-500/30 transition-all transform hover:scale-105 active:scale-95 font-bold text-lg"
                    >
                        <Save className="w-6 h-6" />
                        Guardar Inventario
                    </button>
                </div>
            )}
        </div>
    );
};

export default AreaCapture;
