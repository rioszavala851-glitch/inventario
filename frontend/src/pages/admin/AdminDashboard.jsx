import { Link, useNavigate } from 'react-router-dom';
import {
    Users, ShieldCheck, ArrowRight, UserPlus, Shield,
    Archive, ChefHat, Salad, Utensils, Lock, CheckCircle,
    RefreshCw, Clock, AlertTriangle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import API_BASE_URL from '../../config/api';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalUsers: 0,
        roleBreakdown: {
            administrativo: 0,
            almacen: 0,
            cocina: 0,
            ensalada: 0,
            isla: 0
        }
    });
    const [loading, setLoading] = useState(true);
    const [closingArea, setClosingArea] = useState(null);
    const [closeSuccess, setCloseSuccess] = useState(null);
    const [showCloseModal, setShowCloseModal] = useState(false);
    const [selectedArea, setSelectedArea] = useState('');
    const [closeName, setCloseName] = useState('');
    const [closeDescription, setCloseDescription] = useState('');

    useEffect(() => {
        fetchStats();
    }, []);

    const getAuthConfig = () => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        return {
            headers: { Authorization: `Bearer ${userInfo?.token}` }
        };
    };

    const fetchStats = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));

            if (!userInfo?.token) {
                console.error('No token found, redirecting to login');
                localStorage.removeItem('userInfo');
                navigate('/login');
                return;
            }

            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`
                }
            };

            const { data } = await axios.get(`${API_BASE_URL}/api/users`, config);

            const breakdown = {
                administrativo: 0,
                almacen: 0,
                cocina: 0,
                ensalada: 0,
                isla: 0
            };

            data.forEach(user => {
                const roleName = typeof user.role === 'object' && user.role !== null
                    ? user.role.name
                    : user.role;

                if (roleName && breakdown.hasOwnProperty(roleName)) {
                    breakdown[roleName]++;
                }
            });

            setStats({
                totalUsers: data.length,
                roleBreakdown: breakdown
            });
            setLoading(false);
        } catch (error) {
            console.error('Error fetching admin stats:', error);

            if (error.response?.status === 401) {
                console.error('Authentication failed, redirecting to login');
                localStorage.removeItem('userInfo');
                navigate('/login');
                return;
            }

            setLoading(false);
        }
    };

    const openCloseModal = (area) => {
        setSelectedArea(area);
        const now = new Date();
        const dateStr = now.toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        setCloseName(`Cierre ${area === 'all' ? 'General' : areaNames[area]} - ${dateStr}`);
        setCloseDescription('');
        setShowCloseModal(true);
    };

    const handleCloseInventory = async () => {
        if (!closeName.trim()) {
            alert('Por favor ingresa un nombre para el cierre');
            return;
        }

        setClosingArea(selectedArea);
        setCloseSuccess(null);
        setShowCloseModal(false);

        try {
            await axios.post(
                `${API_BASE_URL}/api/snapshots`,
                {
                    name: closeName,
                    description: closeDescription || `Cierre de inventario ${selectedArea === 'all' ? 'general' : `área ${areaNames[selectedArea]}`}`,
                    area: selectedArea === 'all' ? undefined : selectedArea
                },
                getAuthConfig()
            );

            setCloseSuccess(selectedArea);
            setTimeout(() => setCloseSuccess(null), 3000);
        } catch (error) {
            console.error('Error closing inventory:', error);
            alert('Error al cerrar inventario: ' + (error.response?.data?.message || 'Error desconocido'));
        }
        setClosingArea(null);
    };

    const roleColors = {
        administrativo: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300',
        almacen: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
        cocina: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300',
        ensalada: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300',
        isla: 'bg-teal-100 text-teal-700 dark:bg-teal-900/20 dark:text-teal-300'
    };

    const roleNames = {
        administrativo: 'Administrativo',
        almacen: 'Almacén',
        cocina: 'Cocina',
        ensalada: 'Ensalada',
        isla: 'Isla'
    };

    const areaNames = {
        almacen: 'Almacén',
        cocina: 'Cocina',
        ensalada: 'Ensalada',
        isla: 'Isla'
    };

    const areaIcons = {
        almacen: Archive,
        cocina: ChefHat,
        ensalada: Salad,
        isla: Utensils
    };

    const areaColors = {
        almacen: 'from-blue-500 to-blue-600',
        cocina: 'from-orange-500 to-orange-600',
        ensalada: 'from-green-500 to-green-600',
        isla: 'from-teal-500 to-teal-600'
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
                        Panel Administrativo
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Gestiona usuarios, roles y cierres de inventario.
                    </p>
                </div>
                <Link
                    to="/admin/users"
                    className="flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-lg shadow-indigo-500/30 font-bold"
                >
                    <UserPlus className="w-5 h-5 mr-2" />
                    Nuevo Usuario
                </Link>
            </div>

            {/* Inventory Closure Section */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 shadow-xl text-white">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <Lock className="w-6 h-6" />
                            Cerrar Inventario
                        </h3>
                        <p className="text-indigo-200 text-sm mt-1">
                            Crea un snapshot del inventario actual para guardar el estado
                        </p>
                    </div>
                    <button
                        onClick={() => openCloseModal('all')}
                        disabled={closingArea === 'all'}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl font-semibold transition-all disabled:opacity-50"
                    >
                        {closingArea === 'all' ? (
                            <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : closeSuccess === 'all' ? (
                            <CheckCircle className="w-5 h-5 text-green-300" />
                        ) : (
                            <Lock className="w-5 h-5" />
                        )}
                        {closingArea === 'all' ? 'Cerrando...' : closeSuccess === 'all' ? '¡Cerrado!' : 'Cerrar Todo'}
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(areaNames).map(([area, name]) => {
                        const Icon = areaIcons[area];
                        const isClosing = closingArea === area;
                        const isClosed = closeSuccess === area;

                        return (
                            <div
                                key={area}
                                className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 flex flex-col items-center justify-center gap-3"
                            >
                                <div className={`p-3 rounded-xl bg-gradient-to-br ${areaColors[area]}`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                                <span className="font-semibold">{name}</span>
                                <button
                                    onClick={() => openCloseModal(area)}
                                    disabled={isClosing}
                                    className={`w-full py-2 px-4 rounded-lg font-medium text-sm transition-all ${isClosed
                                            ? 'bg-green-500/30 text-green-200'
                                            : 'bg-white/20 hover:bg-white/30'
                                        } disabled:opacity-50`}
                                >
                                    {isClosing ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            Cerrando...
                                        </span>
                                    ) : isClosed ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <CheckCircle className="w-4 h-4" />
                                            ¡Cerrado!
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            <Lock className="w-4 h-4" />
                                            Cerrar
                                        </span>
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-4 flex items-center gap-2 text-indigo-200 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>Los cierres se guardan en Histórico para consulta posterior</span>
                    <Link to="/historico" className="text-white underline ml-2 hover:text-indigo-100">
                        Ver histórico →
                    </Link>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg text-white">
                            <Users className="w-6 h-6" />
                        </div>
                    </div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Usuarios</p>
                    <h3 className="text-3xl font-bold text-gray-800 dark:text-white mt-1">
                        {loading ? '...' : stats.totalUsers}
                    </h3>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg text-white">
                            <Shield className="w-6 h-6" />
                        </div>
                    </div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Roles Activos</p>
                    <h3 className="text-3xl font-bold text-gray-800 dark:text-white mt-1">5</h3>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 shadow-lg text-white">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                    </div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Administradores</p>
                    <h3 className="text-3xl font-bold text-gray-800 dark:text-white mt-1">
                        {loading ? '...' : stats.roleBreakdown.administrativo}
                    </h3>
                </div>
            </div>

            {/* Role Breakdown */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Distribución por Roles</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {Object.entries(stats.roleBreakdown).map(([role, count]) => (
                        <div key={role} className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mb-2 ${roleColors[role]}`}>
                                {roleNames[role]}
                            </div>
                            <p className="text-2xl font-bold text-gray-800 dark:text-white">{loading ? '...' : count}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">usuarios</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Manage Users Card */}
                <Link
                    to="/admin/users"
                    className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-500 opacity-10 blur-3xl rounded-bl-full -mr-10 -mt-10 transition-opacity group-hover:opacity-20" />

                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl">
                                <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                        </div>

                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Gestionar Usuarios</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            Administra cuentas de usuario y asigna roles
                        </p>

                        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
                            <span>Ver todos</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </Link>

                {/* Manage Roles Card */}
                <Link
                    to="/admin/roles"
                    className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 opacity-10 blur-3xl rounded-bl-full -mr-10 -mt-10 transition-opacity group-hover:opacity-20" />

                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-2xl">
                                <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
                        </div>

                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Gestionar Roles</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            Crea y administra roles personalizados
                        </p>

                        <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-semibold text-sm">
                            <span>Configurar</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </Link>

                {/* Permissions Card */}
                <Link
                    to="/admin/permissions"
                    className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500 to-teal-500 opacity-10 blur-3xl rounded-bl-full -mr-10 -mt-10 transition-opacity group-hover:opacity-20" />

                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
                                <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                        </div>

                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Permisos</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            Configura permisos y accesos del sistema
                        </p>

                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                            <span>Administrar</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </Link>

                {/* Activity Log Card */}
                <Link
                    to="/admin/activity"
                    className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500 to-red-500 opacity-10 blur-3xl rounded-bl-full -mr-10 -mt-10 transition-opacity group-hover:opacity-20" />

                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-2xl">
                                <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors" />
                        </div>

                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Auditoría</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            Historial de acciones del sistema
                        </p>

                        <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-semibold text-sm">
                            <span>Ver registros</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </Link>

                {/* Backup Card */}
                <Link
                    to="/admin/backup"
                    className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500 to-blue-500 opacity-10 blur-3xl rounded-bl-full -mr-10 -mt-10 transition-opacity group-hover:opacity-20" />

                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-2xl">
                                <Shield className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors" />
                        </div>

                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Backup</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            Exportar e importar datos del sistema
                        </p>

                        <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-semibold text-sm">
                            <span>Gestionar</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </Link>

                {/* Historical Card */}
                <Link
                    to="/historico"
                    className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-500 to-rose-500 opacity-10 blur-3xl rounded-bl-full -mr-10 -mt-10 transition-opacity group-hover:opacity-20" />

                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-pink-50 dark:bg-pink-900/20 rounded-2xl">
                                <Lock className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors" />
                        </div>

                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Histórico</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            Ver cierres de inventario pasados
                        </p>

                        <div className="flex items-center gap-2 text-pink-600 dark:text-pink-400 font-semibold text-sm">
                            <span>Ver cierres</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </Link>
            </div>

            {/* Close Inventory Modal */}
            {showCloseModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-fade-in">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl">
                                <Lock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Cerrar Inventario
                                </h3>
                                <p className="text-sm text-gray-500">
                                    {selectedArea === 'all' ? 'Todas las áreas' : areaNames[selectedArea]}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Nombre del Cierre *
                                </label>
                                <input
                                    type="text"
                                    value={closeName}
                                    onChange={(e) => setCloseName(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none dark:text-white"
                                    placeholder="Ej: Cierre Diciembre 2024"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Descripción (opcional)
                                </label>
                                <textarea
                                    value={closeDescription}
                                    onChange={(e) => setCloseDescription(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none dark:text-white"
                                    placeholder="Notas adicionales..."
                                />
                            </div>

                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3 rounded-xl flex items-start gap-2">
                                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                    Se guardará un snapshot del inventario actual. Esta acción no afecta los datos actuales.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowCloseModal(false)}
                                className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCloseInventory}
                                className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                            >
                                <Lock className="w-4 h-4" />
                                Cerrar Inventario
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
