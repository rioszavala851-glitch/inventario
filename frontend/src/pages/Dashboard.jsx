import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import {
    DollarSign, Package, AlertCircle, TrendingUp, Calendar,
    ArrowRight, Activity, Box, Filter, Plus, Scan, Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config/api';

const Dashboard = () => {
    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();

    // Data State
    const [stats, setStats] = useState({
        totalValue: 0,
        totalIngredients: 0,
        itemsInStock: 0,
        areaValues: { almacen: 0, cocina: 0, ensalada: 0, isla: 0 }
    });
    const [history, setHistory] = useState([]);
    const [roleIngredients, setRoleIngredients] = useState([]); // For role-based chart
    const [loading, setLoading] = useState(true);
    const [chartsReady, setChartsReady] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Filter State
    const [selectedArea, setSelectedArea] = useState('all');
    const [selectedPeriod, setSelectedPeriod] = useState('all'); // all, today, week, month

    // Determine user's area based on role
    const userArea = useMemo(() => {
        if (isAdmin()) return 'all';
        const role = user?.role;
        if (['almacen', 'cocina', 'ensalada', 'isla'].includes(role)) {
            return role;
        }
        return 'all';
    }, [user, isAdmin]);

    // Constants
    const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e'];
    const AREA_COLORS = {
        almacen: '#6366f1', // Indigo
        cocina: '#8b5cf6',  // Violet
        ensalada: '#ec4899', // Pink
        isla: '#f43f5e',    // Rose
    };

    useEffect(() => {
        // Clock timer for role dashboard
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Admin gets global stats
                if (isAdmin()) {
                    const [statsRes, historyRes] = await Promise.all([
                        axios.get(`${API_BASE_URL}/api/inventory/dashboard`),
                        axios.get(`${API_BASE_URL}/api/inventory/history`)
                    ]);
                    console.log('📊 Admin Dashboard - Stats received:', statsRes.data);
                    console.log('📊 Admin Dashboard - History received:', historyRes.data);
                    setStats(statsRes.data);
                    setHistory(historyRes.data);
                } else {
                    // Role users get ingredients to compute their own stats
                    const { data } = await axios.get(`${API_BASE_URL}/api/ingredients?limit=1000`);
                    const ingredients = data.ingredients || data;
                    console.log('📊 Role Dashboard - Ingredients received:', ingredients.length);
                    setRoleIngredients(ingredients);
                }

                setTimeout(() => setChartsReady(true), 300);
            } catch (error) {
                console.error("Error fetching dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [isAdmin]);

    // --- Role Based Logic ---
    const roleStats = useMemo(() => {
        if (!roleIngredients.length || userArea === 'all') return null;

        // Filter items that belong to this area (stock > 0)
        const capturedItems = roleIngredients.filter(item =>
            item.stocks && item.stocks[userArea] > 0
        );

        const totalCaptured = capturedItems.length;

        // Prepare chart data: Top 5 items by value in this area
        const chartData = capturedItems
            .map(item => ({
                name: item.name,
                value: (item.stocks[userArea] || 0) * item.cost,
                quantity: item.stocks[userArea]
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);

        return {
            totalCaptured,
            chartData
        };
    }, [roleIngredients, userArea]);


    const formatCurrency = (val) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val);
    const formatDate = (date) => date.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const formatTime = (date) => date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    const currentDate = formatDate(new Date());

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div></div>;

    // --- RENDER: ROLE-SPECIFIC DASHBOARD ---
    if (!isAdmin() && userArea !== 'all') {
        const areaColor = AREA_COLORS[userArea] || '#6366f1';

        return (
            <div className="space-y-8 animate-fade-in pb-10 max-w-lg mx-auto md:max-w-none">
                {/* Mobile/Role Header */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                    <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-${userArea === 'almacen' ? 'indigo' : userArea === 'cocina' ? 'violet' : userArea === 'ensalada' ? 'pink' : 'rose'}-500 to-primary-600 opacity-10 blur-3xl rounded-full -mr-16 -mt-16`} />

                    <div className="relative z-10">
                        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
                            Hola, {user?.name}
                        </h1>
                        <div className="flex flex-col gap-1 text-gray-500 dark:text-gray-400">
                            <p className="flex items-center gap-2 text-sm font-medium capitalize">
                                <Calendar className="w-4 h-4" />
                                {formatDate(currentTime)}
                            </p>
                            <p className="flex items-center gap-2 text-sm font-medium">
                                <Clock className="w-4 h-4" />
                                {formatTime(currentTime)}
                            </p>
                        </div>

                        <div className="mt-8">
                            <button
                                onClick={() => navigate(`/${userArea}`)}
                                className="w-full flex items-center justify-center px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-primary-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <Scan className="w-6 h-6 mr-3" />
                                Registrar en {userArea.charAt(0).toUpperCase() + userArea.slice(1)}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats & Chart Grid */}
                <div className="grid grid-cols-1 gap-6">
                    {/* Captured Count Card */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Ingredientes Capturados</p>
                            <h3 className="text-4xl font-extrabold text-gray-900 dark:text-white mt-1">
                                {roleStats?.totalCaptured || 0}
                            </h3>
                            <p className="text-xs text-green-500 font-semibold mt-1">En tu área actualmente</p>
                        </div>
                        <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                            <Package className={`w-8 h-8 text-${userArea === 'almacen' ? 'indigo' : userArea === 'cocina' ? 'violet' : userArea === 'ensalada' ? 'pink' : 'rose'}-500`} />
                        </div>
                    </div>

                    {/* Area Chart */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Top Productos por Valor</h3>
                        <div className="w-full h-64">
                            {chartsReady && roleStats?.chartData?.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={roleStats.chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                                        <Tooltip
                                            cursor={{ fill: 'transparent' }}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                            formatter={(value) => formatCurrency(value)}
                                        />
                                        <Bar dataKey="value" fill={areaColor} radius={[0, 4, 4, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                    <Box className="w-12 h-12 mb-2 opacity-20" />
                                    <p className="text-sm">Sin datos para mostrar</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- RENDER: ADMIN DASHBOARD (Original View) ---
    // Override selectedArea for non-admin logic (fallback)
    const effectiveArea = selectedArea;

    // Filter Stats for Admin View
    const filteredStats = (() => {
        if (selectedArea === 'all') return stats;
        const areaValue = stats.areaValues[selectedArea] || 0;
        return { ...stats, totalValue: areaValue };
    })();

    const chartData = [
        { name: 'Almacén', value: stats.areaValues.almacen, color: AREA_COLORS.almacen, key: 'almacen' },
        { name: 'Cocina', value: stats.areaValues.cocina, color: AREA_COLORS.cocina, key: 'cocina' },
        { name: 'Ensalada', value: stats.areaValues.ensalada, color: AREA_COLORS.ensalada, key: 'ensalada' },
        { name: 'Isla', value: stats.areaValues.isla, color: AREA_COLORS.isla, key: 'isla' },
    ];

    // Filter chart data if area selected
    const activeChartData = effectiveArea === 'all' ? chartData : chartData.filter(d => d.key === effectiveArea);
    const pieData = activeChartData.filter(item => item.value > 0);

    // Filter History
    const filteredHistory = history.filter(item => {
        const itemTime = new Date(item.createdAt).getTime();
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const startOfWeek = new Date(now.setDate(now.getDate() - 7)).getTime();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

        if (selectedPeriod === 'today') return itemTime >= startOfDay;
        if (selectedPeriod === 'week') return itemTime >= startOfWeek;
        if (selectedPeriod === 'month') return itemTime >= startOfMonth;
        return true;
    }).slice(0, 5);


    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Header Section */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        Hola, {user?.name || 'Admin'}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {currentDate.charAt(0).toUpperCase() + currentDate.slice(1)}
                    </p>
                </div>

                {/* Global Filters & Actions - Only for Admin */}
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Area Filter */}
                    <div className="relative">
                        <select
                            className="appearance-none pl-10 pr-8 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-medium text-gray-700 dark:text-gray-200 shadow-sm focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer"
                            value={selectedArea}
                            onChange={(e) => setSelectedArea(e.target.value)}
                        >
                            <option value="all">Todas las Áreas</option>
                            <option value="almacen">Almacén</option>
                            <option value="cocina">Cocina</option>
                            <option value="ensalada">Ensalada</option>
                            <option value="isla">Isla</option>
                        </select>
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>

                    <div className="h-px sm:h-auto sm:w-px bg-gray-200 dark:bg-gray-700 mx-1" />

                    <button
                        onClick={() => navigate('/ingredients')}
                        className="flex items-center justify-center px-5 py-2.5 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/30 whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4 mr-1.5" />
                        Nuevo Producto
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title={effectiveArea === 'all' ? "Valor Total" : `Valor (${effectiveArea.charAt(0).toUpperCase() + effectiveArea.slice(1)})`}
                    value={formatCurrency(filteredStats.totalValue)}
                    subtitle={effectiveArea === 'all' ? "+2.5% vs mes anterior" : "Valor actual en área"}
                    icon={DollarSign}
                    gradient="from-emerald-500 to-teal-500"
                />
                <StatCard
                    title="Ingredientes"
                    value={stats.totalIngredients}
                    subtitle="Total catálogo"
                    icon={Package}
                    gradient="from-blue-500 to-indigo-500"
                />
                <StatCard
                    title="En Existencia"
                    value={stats.itemsInStock}
                    subtitle="Items con stock > 0"
                    icon={Box}
                    gradient="from-violet-500 to-purple-500"
                />
                <StatCard
                    title="Alertas"
                    value="0"
                    subtitle="Stock bajo mínimo"
                    icon={AlertCircle}
                    gradient="from-rose-500 to-pink-500"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Charts */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Value Distribution Chart */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Distribución de Valor</h3>
                            {effectiveArea === 'all' && (
                                <div className="flex gap-2">
                                    {pieData.map((entry, idx) => (
                                        <div key={idx} className="flex items-center gap-1 text-xs text-gray-500">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                            {entry.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="w-full relative min-w-0" style={{ height: 300 }}>
                            {chartsReady && activeChartData.length > 0 && (
                                <ResponsiveContainer width="100%" height="100%" debounce={50}>
                                    <BarChart data={activeChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                                            tickFormatter={(val) => `$${val / 1000}k`}
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'transparent' }}
                                            contentStyle={{
                                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                borderRadius: '12px',
                                                border: 'none',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                            }}
                                            formatter={(value) => [formatCurrency(value), 'Valor']}
                                        />
                                        <Bar dataKey="value" radius={[8, 8, 8, 8]} barSize={50}>
                                            {activeChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Recent History & Actions */}
                <div className="space-y-8">
                    {/* Recent History */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 h-full">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Actividad Reciente</h3>
                            <button
                                onClick={() => navigate('/history')}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <ArrowRight className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {filteredHistory.length > 0 ? (
                                filteredHistory.map((item, idx) => (
                                    <div key={idx} className="relative pl-6 border-l-2 border-gray-100 dark:border-gray-700 pb-6 last:pb-0">
                                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary-100 dark:bg-primary-900 border-2 border-primary-500 ring-4 ring-white dark:ring-gray-800" />
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">{new Date(item.createdAt).toLocaleDateString()}</p>
                                            <p className="font-medium text-gray-800 dark:text-white">Snapshot Inventario</p>
                                            <p className="text-sm font-semibold text-primary-600 mt-1">
                                                {formatCurrency(item.totalInventoryValue)}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 text-gray-400">
                                    <Activity className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>No hay actividad en este periodo</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Reusable Professional Stat Card
const StatCard = ({ title, value, subtitle, icon: Icon, gradient }) => (
    <div className="relative group overflow-hidden bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 blur-2xl rounded-bl-full -mr-10 -mt-10 transition-opacity group-hover:opacity-20`} />

        <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg shadow-indigo-500/20 text-white`}>
                    <Icon className="w-6 h-6" />
                </div>
                <span className="flex items-center text-xs font-medium text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-full">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +2.5%
                </span>
            </div>

            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                <h3 className="text-3xl font-bold text-gray-800 dark:text-white mt-1 mb-1">{value}</h3>
                <p className="text-xs text-gray-400 font-medium">{subtitle}</p>
            </div>
        </div>
    </div>
);

export default Dashboard;
