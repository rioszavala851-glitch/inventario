import { useState, useEffect } from 'react';
import {
    Clock, Plus, Trash2, Eye, Calendar, Package, DollarSign,
    Download, RefreshCw, ChevronDown, ChevronUp, AlertCircle,
    ArrowLeftRight, CheckCircle, FileText
} from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const History = () => {
    const [snapshots, setSnapshots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showCompareModal, setShowCompareModal] = useState(false);
    const [selectedSnapshot, setSelectedSnapshot] = useState(null);
    const [compareData, setCompareData] = useState(null);
    const [selectedForCompare, setSelectedForCompare] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        area: 'all'
    });
    const [creating, setCreating] = useState(false);

    const areas = [
        { value: 'all', label: 'Todas las áreas' },
        { value: 'almacen', label: 'Almacén' },
        { value: 'cocina', label: 'Cocina' },
        { value: 'ensalada', label: 'Ensalada' },
        { value: 'isla', label: 'Isla' }
    ];

    useEffect(() => {
        fetchSnapshots();
    }, []);

    const getAuthConfig = () => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        return {
            headers: { Authorization: `Bearer ${userInfo?.token}` }
        };
    };

    const fetchSnapshots = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${API_BASE_URL}/api/snapshots`, getAuthConfig());
            setSnapshots(data);
        } catch (error) {
            console.error('Error fetching snapshots:', error);
        }
        setLoading(false);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            alert('El nombre es requerido');
            return;
        }

        setCreating(true);
        try {
            await axios.post(`${API_BASE_URL}/api/snapshots`, formData, getAuthConfig());
            setShowCreateModal(false);
            setFormData({ name: '', description: '', area: 'all' });
            fetchSnapshots();
            alert('Cierre de inventario creado exitosamente');
        } catch (error) {
            console.error('Error creating snapshot:', error);
            alert('Error al crear cierre');
        }
        setCreating(false);
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`¿Estás seguro de eliminar el cierre "${name}"?`)) return;

        try {
            await axios.delete(`${API_BASE_URL}/api/snapshots/${id}`, getAuthConfig());
            fetchSnapshots();
            alert('Cierre eliminado');
        } catch (error) {
            console.error('Error deleting snapshot:', error);
            alert('Error al eliminar');
        }
    };

    const handleViewDetail = async (id) => {
        try {
            const { data } = await axios.get(`${API_BASE_URL}/api/snapshots/${id}`, getAuthConfig());
            setSelectedSnapshot(data);
            setShowDetailModal(true);
        } catch (error) {
            console.error('Error fetching snapshot detail:', error);
        }
    };

    const handleCompare = async () => {
        if (selectedForCompare.length !== 2) {
            alert('Selecciona exactamente 2 cierres para comparar');
            return;
        }

        try {
            const { data } = await axios.get(
                `${API_BASE_URL}/api/snapshots/compare/${selectedForCompare[0]}/${selectedForCompare[1]}`,
                getAuthConfig()
            );
            setCompareData(data);
            setShowCompareModal(true);
        } catch (error) {
            console.error('Error comparing snapshots:', error);
            alert('Error al comparar');
        }
    };

    const toggleCompareSelection = (id) => {
        setSelectedForCompare(prev => {
            if (prev.includes(id)) {
                return prev.filter(x => x !== id);
            }
            if (prev.length >= 2) {
                return [prev[1], id];
            }
            return [...prev, id];
        });
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(value || 0);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const exportToCSV = (snapshot) => {
        if (!snapshot || !snapshot.items) return;

        const rows = [
            ['Cierre de Inventario:', snapshot.name],
            ['Fecha:', formatDate(snapshot.createdAt)],
            ['Área:', snapshot.area === 'all' ? 'Todas' : snapshot.area],
            [''],
            ['Producto', 'SKU', 'Cantidad', 'Unidad', 'Precio', 'Valor Total'],
            ...snapshot.items.map(item => [
                item.name,
                item.sku,
                item.quantity,
                item.unit,
                item.purchasePrice,
                item.totalValue
            ]),
            [''],
            ['TOTALES'],
            ['Total Productos:', snapshot.summary.totalItems],
            ['Total Cantidad:', snapshot.summary.totalQuantity],
            ['Valor Total:', formatCurrency(snapshot.summary.totalValue)]
        ];

        const csvContent = rows.map(row => row.join(',')).join('\n');
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `cierre_${snapshot.name.replace(/\s/g, '_')}_${new Date(snapshot.createdAt).toISOString().split('T')[0]}.csv`;
        link.click();
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
                        Histórico de Inventario
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Cierres y capturas históricas del inventario
                    </p>
                </div>
                <div className="flex gap-3">
                    {selectedForCompare.length === 2 && (
                        <button
                            onClick={handleCompare}
                            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-colors"
                        >
                            <ArrowLeftRight className="w-4 h-4" />
                            Comparar ({selectedForCompare.length})
                        </button>
                    )}
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-indigo-500/30"
                    >
                        <Plus className="w-5 h-5" />
                        Nuevo Cierre
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                            <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{snapshots.length}</p>
                            <p className="text-sm text-gray-500">Total Cierres</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                            <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {snapshots.length > 0 ? formatDate(snapshots[0].createdAt).split(',')[0] : '-'}
                            </p>
                            <p className="text-sm text-gray-500">Último Cierre</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                            <Package className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {snapshots.length > 0 ? snapshots[0].summary?.totalItems || 0 : 0}
                            </p>
                            <p className="text-sm text-gray-500">Productos (Último)</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                            <DollarSign className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {snapshots.length > 0 ? formatCurrency(snapshots[0].summary?.totalValue) : '$0'}
                            </p>
                            <p className="text-sm text-gray-500">Valor (Último)</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Snapshots List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                </div>
            ) : snapshots.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-700">
                    <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        No hay cierres registrados
                    </h3>
                    <p className="text-gray-500 mb-6">
                        Crea tu primer cierre de inventario para comenzar a llevar un histórico
                    </p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Crear Primer Cierre
                    </button>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th className="px-4 py-4 text-left w-10">
                                        <input
                                            type="checkbox"
                                            disabled
                                            className="opacity-0"
                                        />
                                    </th>
                                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                                        Nombre
                                    </th>
                                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                                        Fecha
                                    </th>
                                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                                        Área
                                    </th>
                                    <th className="px-4 py-4 text-right text-xs font-semibold text-gray-500 uppercase">
                                        Productos
                                    </th>
                                    <th className="px-4 py-4 text-right text-xs font-semibold text-gray-500 uppercase">
                                        Valor Total
                                    </th>
                                    <th className="px-4 py-4 text-center text-xs font-semibold text-gray-500 uppercase">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {snapshots.map((snapshot) => (
                                    <tr key={snapshot._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="px-4 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedForCompare.includes(snapshot._id)}
                                                onChange={() => toggleCompareSelection(snapshot._id)}
                                                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                                            />
                                        </td>
                                        <td className="px-4 py-4">
                                            <div>
                                                <p className="font-semibold text-gray-900 dark:text-white">
                                                    {snapshot.name}
                                                </p>
                                                {snapshot.description && (
                                                    <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">
                                                        {snapshot.description}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                                {formatDate(snapshot.createdAt)}
                                            </p>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg capitalize">
                                                {snapshot.area === 'all' ? 'Todas' : snapshot.area}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {snapshot.summary?.totalItems || 0}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <span className="font-semibold text-green-600 dark:text-green-400">
                                                {formatCurrency(snapshot.summary?.totalValue)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => handleViewDetail(snapshot._id)}
                                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                    title="Ver detalle"
                                                >
                                                    <Eye className="w-4 h-4 text-gray-500" />
                                                </button>
                                                <button
                                                    onClick={() => exportToCSV(snapshot)}
                                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                    title="Exportar CSV"
                                                >
                                                    <Download className="w-4 h-4 text-gray-500" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(snapshot._id, snapshot.name)}
                                                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md shadow-2xl p-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                            Nuevo Cierre de Inventario
                        </h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Nombre del cierre *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="ej. Cierre Diciembre 2024"
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Descripción (opcional)
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Notas adicionales..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Área
                                </label>
                                <select
                                    value={formData.area}
                                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                >
                                    {areas.map(area => (
                                        <option key={area.value} value={area.value}>
                                            {area.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {creating ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            Creando...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-4 h-4" />
                                            Crear Cierre
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {showDetailModal && selectedSnapshot && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                        {selectedSnapshot.name}
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {formatDate(selectedSnapshot.createdAt)} • {selectedSnapshot.items?.length || 0} productos
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowDetailModal(false);
                                        setSelectedSnapshot(null);
                                    }}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1">
                            {/* Summary */}
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 text-center">
                                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                        {selectedSnapshot.summary?.totalItems || 0}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Productos</p>
                                </div>
                                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        {selectedSnapshot.summary?.totalQuantity?.toFixed(2) || 0}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Cantidad Total</p>
                                </div>
                                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 text-center">
                                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                        {formatCurrency(selectedSnapshot.summary?.totalValue)}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Valor Total</p>
                                </div>
                            </div>

                            {/* Items Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Producto</th>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">SKU</th>
                                            <th className="px-4 py-3 text-right font-semibold text-gray-600 dark:text-gray-300">Cantidad</th>
                                            <th className="px-4 py-3 text-center font-semibold text-gray-600 dark:text-gray-300">Unidad</th>
                                            <th className="px-4 py-3 text-right font-semibold text-gray-600 dark:text-gray-300">Precio</th>
                                            <th className="px-4 py-3 text-right font-semibold text-gray-600 dark:text-gray-300">Valor</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {(selectedSnapshot.items || []).map((item, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{item.name}</td>
                                                <td className="px-4 py-3 text-gray-500">{item.sku}</td>
                                                <td className="px-4 py-3 text-right text-gray-900 dark:text-white">{item.quantity?.toFixed(2)}</td>
                                                <td className="px-4 py-3 text-center text-gray-500">{item.unit}</td>
                                                <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">{formatCurrency(item.purchasePrice)}</td>
                                                <td className="px-4 py-3 text-right font-semibold text-green-600 dark:text-green-400">{formatCurrency(item.totalValue)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                            <button
                                onClick={() => exportToCSV(selectedSnapshot)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                Exportar CSV
                            </button>
                            <button
                                onClick={() => {
                                    setShowDetailModal(false);
                                    setSelectedSnapshot(null);
                                }}
                                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Compare Modal */}
            {showCompareModal && compareData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Comparación de Cierres
                            </h2>
                            <div className="flex items-center gap-4 mt-3 text-sm">
                                <div className="bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg">
                                    <span className="text-blue-600 dark:text-blue-400 font-medium">
                                        {compareData.snapshot1.name}
                                    </span>
                                </div>
                                <ArrowLeftRight className="w-4 h-4 text-gray-400" />
                                <div className="bg-purple-50 dark:bg-purple-900/20 px-3 py-1.5 rounded-lg">
                                    <span className="text-purple-600 dark:text-purple-400 font-medium">
                                        {compareData.snapshot2.name}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1">
                            {/* Summary Difference */}
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className={`rounded-xl p-4 text-center ${compareData.summaryDifference.items >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                                    <p className={`text-2xl font-bold ${compareData.summaryDifference.items >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {compareData.summaryDifference.items >= 0 ? '+' : ''}{compareData.summaryDifference.items}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Productos</p>
                                </div>
                                <div className={`rounded-xl p-4 text-center ${compareData.summaryDifference.quantity >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                                    <p className={`text-2xl font-bold ${compareData.summaryDifference.quantity >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {compareData.summaryDifference.quantity >= 0 ? '+' : ''}{compareData.summaryDifference.quantity?.toFixed(2)}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Cantidad</p>
                                </div>
                                <div className={`rounded-xl p-4 text-center ${compareData.summaryDifference.value >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                                    <p className={`text-2xl font-bold ${compareData.summaryDifference.value >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {compareData.summaryDifference.value >= 0 ? '+' : ''}{formatCurrency(compareData.summaryDifference.value)}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Valor</p>
                                </div>
                            </div>

                            {/* Comparison Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Producto</th>
                                            <th className="px-4 py-3 text-right font-semibold text-blue-600 dark:text-blue-400">Anterior</th>
                                            <th className="px-4 py-3 text-right font-semibold text-purple-600 dark:text-purple-400">Actual</th>
                                            <th className="px-4 py-3 text-right font-semibold text-gray-600 dark:text-gray-300">Diferencia</th>
                                            <th className="px-4 py-3 text-right font-semibold text-gray-600 dark:text-gray-300">%</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {(compareData.comparison || []).map((item, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{item.name}</td>
                                                <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">{item.snapshot1Quantity?.toFixed(2)} {item.unit}</td>
                                                <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">{item.snapshot2Quantity?.toFixed(2)} {item.unit}</td>
                                                <td className={`px-4 py-3 text-right font-semibold ${item.difference >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                    {item.difference >= 0 ? '+' : ''}{item.difference?.toFixed(2)}
                                                </td>
                                                <td className={`px-4 py-3 text-right ${item.difference >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                    {item.percentChange ? `${item.percentChange}%` : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {compareData.comparison?.length === 0 && (
                                    <div className="text-center py-8 text-gray-400">
                                        No hay diferencias entre los cierres
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                            <button
                                onClick={() => {
                                    setShowCompareModal(false);
                                    setCompareData(null);
                                    setSelectedForCompare([]);
                                }}
                                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default History;
