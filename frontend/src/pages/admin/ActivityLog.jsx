import { useState, useEffect } from 'react';
import {
    Activity, RefreshCw, Filter, User, Calendar,
    LogIn, LogOut, Plus, Edit, Trash2, Download, Upload,
    Package, Users, Shield, FileText, Clock
} from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

const ActivityLog = () => {
    const [logs, setLogs] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        action: '',
        entity: '',
        days: 7
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 50,
        total: 0,
        pages: 0
    });

    useEffect(() => {
        fetchLogs();
        fetchSummary();
    }, [filters, pagination.page]);

    const getAuthConfig = () => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        return {
            headers: { Authorization: `Bearer ${userInfo?.token}` }
        };
    };

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: pagination.page,
                limit: pagination.limit
            });

            if (filters.action) params.append('action', filters.action);
            if (filters.entity) params.append('entity', filters.entity);

            const { data } = await axios.get(
                `${API_BASE_URL}/api/activity?${params.toString()}`,
                getAuthConfig()
            );

            setLogs(data.logs || []);
            setPagination(prev => ({
                ...prev,
                total: data.pagination?.total || 0,
                pages: data.pagination?.pages || 0
            }));
        } catch (error) {
            console.error('Error fetching logs:', error);
        }
        setLoading(false);
    };

    const fetchSummary = async () => {
        try {
            const { data } = await axios.get(
                `${API_BASE_URL}/api/activity/summary?days=${filters.days}`,
                getAuthConfig()
            );
            setSummary(data);
        } catch (error) {
            console.error('Error fetching summary:', error);
        }
    };

    const getActionIcon = (action) => {
        switch (action) {
            case 'login': return <LogIn className="w-4 h-4 text-green-500" />;
            case 'logout': return <LogOut className="w-4 h-4 text-gray-500" />;
            case 'create': return <Plus className="w-4 h-4 text-blue-500" />;
            case 'update': return <Edit className="w-4 h-4 text-orange-500" />;
            case 'delete': return <Trash2 className="w-4 h-4 text-red-500" />;
            case 'import': return <Upload className="w-4 h-4 text-purple-500" />;
            case 'export': return <Download className="w-4 h-4 text-indigo-500" />;
            default: return <Activity className="w-4 h-4 text-gray-500" />;
        }
    };

    const getEntityIcon = (entity) => {
        switch (entity) {
            case 'user': return <Users className="w-4 h-4 text-blue-500" />;
            case 'role': return <Shield className="w-4 h-4 text-purple-500" />;
            case 'ingredient': return <Package className="w-4 h-4 text-green-500" />;
            case 'inventory': return <FileText className="w-4 h-4 text-orange-500" />;
            default: return <Activity className="w-4 h-4 text-gray-500" />;
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString('es-MX', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const actions = [
        { value: '', label: 'Todas las acciones' },
        { value: 'login', label: 'Inicio de sesión' },
        { value: 'create', label: 'Crear' },
        { value: 'update', label: 'Actualizar' },
        { value: 'delete', label: 'Eliminar' },
        { value: 'import', label: 'Importar' },
        { value: 'export', label: 'Exportar' }
    ];

    const entities = [
        { value: '', label: 'Todas las entidades' },
        { value: 'user', label: 'Usuarios' },
        { value: 'role', label: 'Roles' },
        { value: 'ingredient', label: 'Ingredientes' },
        { value: 'inventory', label: 'Inventario' },
        { value: 'snapshot', label: 'Cierres' },
        { value: 'category', label: 'Categorías' },
        { value: 'supplier', label: 'Proveedores' }
    ];

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                        <Activity className="w-8 h-8 text-indigo-500" />
                        Registro de Actividad
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Historial de acciones en el sistema
                    </p>
                </div>
                <button
                    onClick={() => { fetchLogs(); fetchSummary(); }}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Actualizar
                </button>
            </div>

            {/* Summary Stats */}
            {summary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                                <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.totalCount}</p>
                                <p className="text-sm text-gray-500">Actividades ({filters.days}d)</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                                <Plus className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {summary.byAction?.find(a => a._id === 'create')?.count || 0}
                                </p>
                                <p className="text-sm text-gray-500">Creaciones</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                                <Edit className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {summary.byAction?.find(a => a._id === 'update')?.count || 0}
                                </p>
                                <p className="text-sm text-gray-500">Actualizaciones</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {summary.byAction?.find(a => a._id === 'delete')?.count || 0}
                                </p>
                                <p className="text-sm text-gray-500">Eliminaciones</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 flex flex-wrap gap-4 items-center">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                    value={filters.action}
                    onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                    className="px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                >
                    {actions.map(a => (
                        <option key={a.value} value={a.value}>{a.label}</option>
                    ))}
                </select>
                <select
                    value={filters.entity}
                    onChange={(e) => setFilters({ ...filters, entity: e.target.value })}
                    className="px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                >
                    {entities.map(e => (
                        <option key={e.value} value={e.value}>{e.label}</option>
                    ))}
                </select>
                <select
                    value={filters.days}
                    onChange={(e) => setFilters({ ...filters, days: Number(e.target.value) })}
                    className="px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                >
                    <option value={7}>Últimos 7 días</option>
                    <option value={30}>Últimos 30 días</option>
                    <option value={90}>Últimos 90 días</option>
                </select>
            </div>

            {/* Activity List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                </div>
            ) : logs.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-700">
                    <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        No hay actividad registrada
                    </h3>
                    <p className="text-gray-500">
                        Las acciones del sistema aparecerán aquí
                    </p>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {logs.map((log) => (
                            <div key={log._id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 p-2 bg-gray-100 dark:bg-gray-700 rounded-xl">
                                        {getActionIcon(log.action)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {log.description}
                                                </p>
                                                <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <User className="w-3 h-3" />
                                                        {log.user?.name || 'Sistema'}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        {getEntityIcon(log.entity)}
                                                        {log.entity}
                                                    </span>
                                                    {log.entityName && (
                                                        <span className="text-gray-400">
                                                            "{log.entityName}"
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-400 flex items-center gap-1 flex-shrink-0">
                                                <Clock className="w-3 h-3" />
                                                {formatDate(log.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                            <p className="text-sm text-gray-500">
                                Página {pagination.page} de {pagination.pages} ({pagination.total} registros)
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))}
                                    disabled={pagination.page === 1}
                                    className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-medium disabled:opacity-50"
                                >
                                    Anterior
                                </button>
                                <button
                                    onClick={() => setPagination(p => ({ ...p, page: Math.min(p.pages, p.page + 1) }))}
                                    disabled={pagination.page === pagination.pages}
                                    className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-medium disabled:opacity-50"
                                >
                                    Siguiente
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ActivityLog;
