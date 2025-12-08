import { Link } from 'react-router-dom';
import { Users, ShieldCheck, ArrowRight, UserPlus, Shield } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import API_BASE_URL from '../../config/api';

const AdminDashboard = () => {
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

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo?.token}`
                }
            };

            const { data } = await axios.get(`${API_BASE_URL}/api/users`, config);

            // Calculate role breakdown
            const breakdown = {
                administrativo: 0,
                almacen: 0,
                cocina: 0,
                ensalada: 0,
                isla: 0
            };

            data.forEach(user => {
                if (breakdown.hasOwnProperty(user.role)) {
                    breakdown[user.role]++;
                }
            });

            setStats({
                totalUsers: data.length,
                roleBreakdown: breakdown
            });
            setLoading(false);
        } catch (error) {
            console.error('Error fetching admin stats:', error);
            setLoading(false);
        }
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

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
                        Panel Administrativo
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Gestiona usuarios, roles y permisos del sistema.
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
            </div>
        </div>
    );
};

export default AdminDashboard;
