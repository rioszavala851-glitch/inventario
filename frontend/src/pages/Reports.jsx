import { useState, useEffect } from 'react';
import {
    BarChart3, TrendingUp, TrendingDown, Package, DollarSign,
    Calendar, Download, RefreshCw, AlertTriangle, ArrowUp, ArrowDown,
    PieChart, Filter
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart as RechartsPie, Pie, Cell, LineChart, Line, Legend, AreaChart, Area
} from 'recharts';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const Reports = () => {
    const [loading, setLoading] = useState(true);
    const [summaryData, setSummaryData] = useState(null);
    const [trendsData, setTrendsData] = useState(null);
    const [categoryData, setCategoryData] = useState(null);
    const [selectedPeriod, setSelectedPeriod] = useState(30);
    const [selectedArea, setSelectedArea] = useState('');

    const areas = ['almacen', 'cocina', 'ensalada', 'isla'];
    const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4'];

    useEffect(() => {
        fetchAllReports();
    }, [selectedPeriod, selectedArea]);

    const fetchAllReports = async () => {
        setLoading(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: { Authorization: `Bearer ${userInfo?.token}` }
            };

            const areaQuery = selectedArea ? `&area=${selectedArea}` : '';

            const [summary, trends, categories] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/reports/summary?${areaQuery}`, config),
                axios.get(`${API_BASE_URL}/api/reports/trends?days=${selectedPeriod}${areaQuery}`, config),
                axios.get(`${API_BASE_URL}/api/reports/categories`, config)
            ]);

            setSummaryData(summary.data);
            setTrendsData(trends.data);
            setCategoryData(categories.data);
        } catch (error) {
            console.error('Error fetching reports:', error);
        }
        setLoading(false);
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(value || 0);
    };

    const formatNumber = (value) => {
        return new Intl.NumberFormat('es-MX').format(value || 0);
    };

    const exportToCSV = () => {
        if (!summaryData) return;

        const rows = [
            ['Reporte de Inventario StockZavala'],
            ['Generado:', new Date().toLocaleString('es-MX')],
            [''],
            ['RESUMEN GENERAL'],
            ['Total Ingredientes', summaryData.summary.totalIngredients],
            ['Total Registros', summaryData.summary.totalInventoryRecords],
            ['Valor Total', formatCurrency(summaryData.summary.totalValue)],
            [''],
            ['INVENTARIO POR ÁREA'],
            ['Área', 'Cantidad', 'Valor', 'Items'],
            ...summaryData.areaStats.map(area => [
                area._id,
                area.totalQuantity,
                formatCurrency(area.totalValue),
                area.itemCount
            ]),
            [''],
            ['TOP 10 PRODUCTOS'],
            ['Producto', 'Cantidad', 'Unidad', 'Valor'],
            ...summaryData.topItems.map(item => [
                item.name,
                item.totalQuantity,
                item.unit,
                formatCurrency(item.totalValue)
            ])
        ];

        const csvContent = rows.map(row => row.join(',')).join('\n');
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `reporte_stockzavala_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <RefreshCw className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Generando reportes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
                        Reportes
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Análisis y métricas del inventario
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    {/* Period Filter */}
                    <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(Number(e.target.value))}
                        className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none"
                    >
                        <option value={7}>Últimos 7 días</option>
                        <option value={30}>Últimos 30 días</option>
                        <option value={90}>Últimos 90 días</option>
                        <option value={365}>Último año</option>
                    </select>

                    {/* Area Filter */}
                    <select
                        value={selectedArea}
                        onChange={(e) => setSelectedArea(e.target.value)}
                        className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none"
                    >
                        <option value="">Todas las áreas</option>
                        {areas.map(area => (
                            <option key={area} value={area}>
                                {area.charAt(0).toUpperCase() + area.slice(1)}
                            </option>
                        ))}
                    </select>

                    {/* Export Button */}
                    <button
                        onClick={exportToCSV}
                        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-indigo-500/30"
                    >
                        <Download className="w-4 h-4" />
                        Exportar CSV
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                            <Package className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <span className="text-xs text-green-500 font-semibold flex items-center">
                            <ArrowUp className="w-3 h-3 mr-0.5" />
                            Activo
                        </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatNumber(summaryData?.summary?.totalIngredients)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Ingredientes</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
                            <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(summaryData?.summary?.totalValue)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Valor Total</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                            <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatNumber(summaryData?.summary?.totalItems)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Registros</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                            <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {summaryData?.lowStockItems?.length || 0}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Stock Bajo</p>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Inventory by Area */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                        Inventario por Área
                    </h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={summaryData?.areaStats || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                                <XAxis
                                    dataKey="_id"
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                    tickFormatter={(value) => value?.charAt(0).toUpperCase() + value?.slice(1)}
                                />
                                <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1f2937',
                                        border: 'none',
                                        borderRadius: '12px',
                                        color: '#fff'
                                    }}
                                    formatter={(value, name) => [
                                        name === 'totalValue' ? formatCurrency(value) : formatNumber(value),
                                        name === 'totalValue' ? 'Valor' : 'Cantidad'
                                    ]}
                                />
                                <Bar dataKey="totalQuantity" fill="#6366f1" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category Distribution */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                        Distribución por Categoría
                    </h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsPie>
                                <Pie
                                    data={categoryData?.categories || []}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={2}
                                    dataKey="totalValue"
                                    nameKey="categoryName"
                                    label={({ categoryName, percent }) =>
                                        `${categoryName?.slice(0, 10)}${categoryName?.length > 10 ? '..' : ''} ${(percent * 100).toFixed(0)}%`
                                    }
                                    labelLine={false}
                                >
                                    {(categoryData?.categories || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1f2937',
                                        border: 'none',
                                        borderRadius: '12px',
                                        color: '#fff'
                                    }}
                                    formatter={(value) => formatCurrency(value)}
                                />
                            </RechartsPie>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Trends Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Tendencia de Inventario ({selectedPeriod} días)
                </h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendsData?.trends || []}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                            <XAxis
                                dataKey="date"
                                tick={{ fill: '#9ca3af', fontSize: 11 }}
                                tickFormatter={(value) => {
                                    const date = new Date(value);
                                    return `${date.getDate()}/${date.getMonth() + 1}`;
                                }}
                            />
                            <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1f2937',
                                    border: 'none',
                                    borderRadius: '12px',
                                    color: '#fff'
                                }}
                                labelFormatter={(label) => new Date(label).toLocaleDateString('es-MX')}
                                formatter={(value) => formatCurrency(value)}
                            />
                            <Legend />
                            <Area
                                type="monotone"
                                dataKey="totalValue"
                                name="Valor Total"
                                stroke="#6366f1"
                                fillOpacity={1}
                                fill="url(#colorValue)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Items & Low Stock */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Items */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                        Top 10 Productos
                    </h3>
                    <div className="space-y-3">
                        {(summaryData?.topItems || []).map((item, index) => (
                            <div
                                key={item._id}
                                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="w-6 h-6 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center text-xs font-bold">
                                        {index + 1}
                                    </span>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                                            {item.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {formatNumber(item.totalQuantity)} {item.unit}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                                    {formatCurrency(item.totalValue)}
                                </span>
                            </div>
                        ))}
                        {(!summaryData?.topItems || summaryData.topItems.length === 0) && (
                            <p className="text-center text-gray-400 py-8">No hay datos disponibles</p>
                        )}
                    </div>
                </div>

                {/* Low Stock Alert */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                        Alertas de Stock Bajo
                    </h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {(summaryData?.lowStockItems || []).map((item) => (
                            <div
                                key={item._id}
                                className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl"
                            >
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                                        {item.name}
                                    </p>
                                    <p className="text-xs text-orange-600 dark:text-orange-400">
                                        Stock: {formatNumber(item.totalStock)} / Mín: {item.minimumStock} {item.unit}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                                    <TrendingDown className="w-4 h-4" />
                                    <span className="text-xs font-semibold">Bajo</span>
                                </div>
                            </div>
                        ))}
                        {(!summaryData?.lowStockItems || summaryData.lowStockItems.length === 0) && (
                            <div className="text-center py-8">
                                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                                </div>
                                <p className="text-gray-500">¡Todo el inventario está en niveles óptimos!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
