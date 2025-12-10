import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Upload, Search, QrCode, FileSpreadsheet, X, Pencil, Trash2, Download, Power, PowerOff } from 'lucide-react';
import QRCodeLib from 'qrcode';
import Pagination from '../components/Pagination';
import API_BASE_URL from '../config/api';

const Ingredients = () => {
    const [ingredients, setIngredients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [newIngredient, setNewIngredient] = useState({ name: '', detail: '', unit: 'PIEZA', cost: '', minStock: 10 });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(25);

    useEffect(() => {
        fetchIngredients();
    }, [currentPage, itemsPerPage, searchTerm]);

    const fetchIngredients = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: currentPage,
                limit: itemsPerPage,
                search: searchTerm
            });

            const { data } = await axios.get(`${API_BASE_URL}/api/ingredients?${params}`);

            setIngredients(data.ingredients);
            setTotalPages(data.totalPages);
            setTotalItems(data.totalItems);
            setCurrentPage(data.currentPage);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        console.log('📁 Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${userInfo?.token}`
                }
            };

            const response = await axios.post(`${API_BASE_URL}/api/ingredients/upload`, formData, config);

            console.log('✅ Upload successful:', response.data);

            const count = response.data.length;
            alert(`¡Éxito! Se importaron ${count} ingrediente(s) del archivo Excel.`);

            fetchIngredients();

            // Reset the file input
            e.target.value = '';
        } catch (error) {
            console.error('❌ Upload failed:', error);
            console.error('Error response:', error.response?.data);

            const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
            const errorDetails = error.response?.data?.error || '';

            alert(`Error al subir el archivo:\n${errorMessage}${errorDetails ? '\n\nDetalles: ' + errorDetails : ''}\n\nAsegúrate de que el Excel tenga las columnas: Name, Detail, Unit, Cost`);

            // Reset the file input
            e.target.value = '';
        }
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await axios.put(`${API_BASE_URL}/api/ingredients/${currentId}`, newIngredient);
            } else {
                await axios.post(`${API_BASE_URL}/api/ingredients`, newIngredient);
            }
            setShowModal(false);
            setNewIngredient({ name: '', detail: '', unit: 'PIEZA', cost: '', minStock: 10 });
            setIsEditing(false);
            setCurrentId(null);
            fetchIngredients();
        } catch (error) {
            console.error(error);
        }
    };

    const handleEdit = (item) => {
        setNewIngredient({
            name: item.name,
            detail: item.detail || '',
            unit: item.unit,
            cost: item.cost,
            minStock: item.minStock || 10
        });
        setCurrentId(item._id);
        setIsEditing(true);
        setShowModal(true);
    };

    const openNewModal = () => {
        setNewIngredient({ name: '', detail: '', unit: 'PIEZA', cost: '', minStock: 10 });
        setIsEditing(false);
        setCurrentId(null);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo?.token}`
                }
            };
            await axios.delete(`${API_BASE_URL}/api/ingredients/${id}`, config);
            fetchIngredients();
        } catch (error) {
            console.error('Error deleting ingredient:', error);
            alert('Error al eliminar el ingrediente');
        }
    };

    const handleToggleActive = async (id) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo?.token}`
                }
            };
            await axios.patch(`${API_BASE_URL}/api/ingredients/${id}/toggle`, {}, config);
            fetchIngredients();
        } catch (error) {
            console.error('Error toggling ingredient status:', error);
            alert('Error al cambiar el estado del ingrediente');
        }
    };

    const handleDownloadQR = async (item) => {
        try {
            const qrDataUrl = await QRCodeLib.toDataURL(item._id, {
                width: 300,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });

            const link = document.createElement('a');
            link.href = qrDataUrl;
            link.download = `QR_${item.name.replace(/\s+/g, '_')}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error generating QR code:', error);
            alert('Error al generar el código QR');
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
                        Catálogo de Ingredientes
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Gestiona los productos base, costos y unidades de medida.
                    </p>
                </div>
                <div className="flex gap-3 flex-wrap">
                    <a
                        href={`${API_BASE_URL}/api/ingredients/template`}
                        download="plantilla_ingredientes.xlsx"
                        className="flex items-center px-4 py-3 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/30 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all font-semibold shadow-sm"
                    >
                        <Download className="w-5 h-5 mr-2" />
                        Descargar Plantilla
                    </a>
                    <label className="flex items-center px-4 py-3 bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-900/30 rounded-xl cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/10 transition-all font-semibold shadow-sm">
                        <FileSpreadsheet className="w-5 h-5 mr-2" />
                        Importar Excel
                        <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileUpload} />
                    </label>
                    <button
                        onClick={openNewModal}
                        className="flex items-center px-5 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-all shadow-lg shadow-primary-500/30 font-bold"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Nuevo Producto
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-gray-100/50 dark:shadow-none border border-gray-100 dark:border-gray-700 overflow-hidden">
                {/* Search bar */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                    <div className="relative max-w-md">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre..."
                            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 outline-none transition-all dark:text-white"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Nombre</th>
                                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Detalle</th>
                                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Unidad</th>
                                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Costo</th>
                                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Estado</th>
                                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div></td>
                                        <td className="px-6 py-4"></td>
                                        <td className="px-6 py-4"></td>
                                    </tr>
                                ))
                            ) : ingredients.map((item) => (
                                <tr key={item._id} className="group hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-gray-800 dark:text-white block">{item.name}</span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm">{item.detail || '-'}</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                            {item.unit}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-gray-700 dark:text-gray-300">
                                        ${Number(item.cost).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {item.active !== false ? (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                                Activo
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                                Inactivo
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all"
                                                title="Editar"
                                            >
                                                <Pencil className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDownloadQR(item)}
                                                className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all"
                                                title="Descargar QR"
                                            >
                                                <Download className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleToggleActive(item._id)}
                                                className={`p-2 rounded-lg transition-all ${item.active !== false
                                                    ? 'text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                                                    : 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                                                    }`}
                                                title={item.active !== false ? 'Inactivar' : 'Activar'}
                                            >
                                                {item.active !== false ? <PowerOff className="w-5 h-5" /> : <Power className="w-5 h-5" />}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item._id)}
                                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && totalItems > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        onPageChange={(page) => setCurrentPage(page)}
                        onItemsPerPageChange={(limit) => {
                            setItemsPerPage(limit);
                            setCurrentPage(1);
                        }}
                    />
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => setShowModal(false)} />
                    <div className="relative bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden transform transition-all scale-100">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {isEditing ? 'Editar Ingrediente' : 'Nuevo Ingrediente'}
                                </h2>
                                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleAddSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nombre del Producto</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:text-white"
                                        placeholder="Ej. Jitomate Saladet"
                                        value={newIngredient.name}
                                        onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Detalle / Marca</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:text-white"
                                        placeholder="Ej. Supremo"
                                        value={newIngredient.detail}
                                        onChange={(e) => setNewIngredient({ ...newIngredient, detail: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Unidad</label>
                                        <select
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all appearance-none dark:text-white"
                                            value={newIngredient.unit}
                                            onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
                                        >
                                            <option value="PIEZA">PIEZA</option>
                                            <option value="PAQUETE">PAQUETE</option>
                                            <option value="MILILITRO">MILILITRO</option>
                                            <option value="LITRO">LITRO</option>
                                            <option value="GRAMO">GRAMO</option>
                                            <option value="KILO">KILO</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Costo ($)</label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            step="0.01"
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:text-white"
                                            placeholder="0.00"
                                            value={newIngredient.cost}
                                            onChange={(e) => setNewIngredient({ ...newIngredient, cost: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Stock Mínimo</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:text-white"
                                        placeholder="10"
                                        value={newIngredient.minStock}
                                        onChange={(e) => setNewIngredient({ ...newIngredient, minStock: e.target.value })}
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Cantidad mínima antes de recibir alerta</p>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/30 transition-all transform active:scale-95"
                                    >
                                        {isEditing ? 'Guardar Cambios' : 'Guardar Producto'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Ingredients;
