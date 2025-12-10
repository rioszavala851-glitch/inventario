import { useState, useEffect } from 'react';
import { Shield, Check, X, Edit2, Eye, Users, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

const Permissions = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedRole, setExpandedRole] = useState(null);
    const [updating, setUpdating] = useState(false);

    // All available permissions organized by category
    const permissionCategories = {
        'Dashboard': [
            { value: 'view_dashboard', label: 'Ver Dashboard', description: 'Acceso al panel principal' },
            { value: 'view_analytics', label: 'Ver Análisis', description: 'Visualizar estadísticas y métricas' },
        ],
        'Ingredientes': [
            { value: 'manage_ingredients', label: 'Gestionar Ingredientes (Legacy)', description: 'Control completo de ingredientes' },
            { value: 'create_ingredient', label: 'Crear Ingredientes', description: 'Agregar nuevos ingredientes' },
            { value: 'edit_ingredient', label: 'Editar Ingredientes', description: 'Modificar ingredientes existentes' },
            { value: 'delete_ingredient', label: 'Eliminar Ingredientes', description: 'Eliminar ingredientes del sistema' },
            { value: 'import_ingredients', label: 'Importar Ingredientes', description: 'Importar desde Excel' },
            { value: 'export_ingredients', label: 'Exportar Ingredientes', description: 'Exportar a Excel' },
            { value: 'generate_qr_codes', label: 'Generar Códigos QR', description: 'Crear códigos QR para productos' },
        ],
        'Inventario': [
            { value: 'capture_inventory', label: 'Capturar Inventario', description: 'Registrar stock en las áreas' },
            { value: 'view_all_areas', label: 'Ver Todas las Áreas', description: 'Acceso a todas las áreas de inventario' },
            { value: 'view_own_area', label: 'Ver Solo Su Área', description: 'Acceso restringido a su área asignada' },
            { value: 'edit_inventory', label: 'Editar Inventario', description: 'Modificar registros de inventario' },
            { value: 'delete_inventory', label: 'Eliminar Inventario', description: 'Eliminar registros de inventario' },
            { value: 'transfer_inventory', label: 'Transferir Inventario', description: 'Mover stock entre áreas' },
            { value: 'adjust_inventory', label: 'Ajustar Inventario', description: 'Realizar ajustes de stock' },
        ],
        'Histórico': [
            { value: 'view_history', label: 'Ver Histórico', description: 'Acceso al historial de inventarios' },
            { value: 'create_snapshot', label: 'Crear Cierres', description: 'Generar cierres de inventario' },
            { value: 'delete_snapshot', label: 'Eliminar Cierres', description: 'Eliminar cierres de inventario' },
            { value: 'export_history', label: 'Exportar Histórico', description: 'Exportar historial a archivos' },
            { value: 'view_detailed_history', label: 'Ver Detalles de Histórico', description: 'Ver información detallada' },
        ],
        'Reportes': [
            { value: 'view_reports', label: 'Ver Reportes', description: 'Acceso a reportes del sistema' },
            { value: 'generate_reports', label: 'Generar Reportes', description: 'Crear nuevos reportes' },
            { value: 'export_reports', label: 'Exportar Reportes', description: 'Descargar reportes' },
            { value: 'schedule_reports', label: 'Programar Reportes', description: 'Automatizar generación de reportes' },
        ],
        'Administración': [
            { value: 'manage_users', label: 'Gestionar Usuarios', description: 'Crear, editar y eliminar usuarios' },
            { value: 'manage_roles', label: 'Gestionar Roles', description: 'Administrar roles del sistema' },
            { value: 'manage_permissions', label: 'Gestionar Permisos', description: 'Asignar permisos a roles' },
            { value: 'view_audit_log', label: 'Ver Registro de Auditoría', description: 'Revisar actividad del sistema' },
            { value: 'manage_settings', label: 'Gestionar Configuración', description: 'Modificar ajustes del sistema' },
            { value: 'backup_data', label: 'Respaldar Datos', description: 'Crear copias de seguridad' },
        ],
        'Notificaciones': [
            { value: 'receive_alerts', label: 'Recibir Alertas', description: 'Recibir notificaciones del sistema' },
            { value: 'manage_notifications', label: 'Gestionar Notificaciones', description: 'Configurar notificaciones' },
            { value: 'send_notifications', label: 'Enviar Notificaciones', description: 'Enviar alertas a usuarios' },
        ],
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo?.token}`
                }
            };
            const { data } = await axios.get(`${API_BASE_URL}/api/roles`, config);
            setRoles(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching roles:', error);
            setLoading(false);
        }
    };

    const togglePermission = async (roleId, permission) => {
        setUpdating(true);
        try {
            const role = roles.find(r => r._id === roleId);
            const newPermissions = role.permissions.includes(permission)
                ? role.permissions.filter(p => p !== permission)
                : [...role.permissions, permission];

            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo?.token}`
                }
            };

            await axios.put(`${API_BASE_URL}/api/roles/${roleId}`, {
                permissions: newPermissions
            }, config);

            // Update local state
            setRoles(prev => prev.map(r =>
                r._id === roleId ? { ...r, permissions: newPermissions } : r
            ));
        } catch (error) {
            console.error('Error updating permission:', error);
            alert('Error al actualizar permiso');
        }
        setUpdating(false);
    };

    const grantAllToAdmin = async () => {
        setUpdating(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo?.token}`
                }
            };

            await axios.post(`${API_BASE_URL}/api/roles/grant-all-admin`, {}, config);
            alert('Todos los permisos asignados al rol Administrativo');
            fetchRoles();
        } catch (error) {
            console.error('Error granting permissions:', error);
            alert('Error al asignar permisos');
        }
        setUpdating(false);
    };

    const getCategoryColor = (category) => {
        const colors = {
            'Dashboard': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
            'Ingredientes': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
            'Inventario': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
            'Histórico': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
            'Reportes': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
            'Administración': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
            'Notificaciones': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
        };
        return colors[category] || 'bg-gray-100 text-gray-700';
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
                        Permisos y Roles
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Define qué pueden hacer los usuarios en el sistema.
                    </p>
                </div>
                <button
                    onClick={grantAllToAdmin}
                    disabled={updating}
                    className="flex items-center px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all shadow-lg shadow-indigo-500/30 font-bold disabled:opacity-50"
                >
                    <RefreshCw className={`w-5 h-5 mr-2 ${updating ? 'animate-spin' : ''}`} />
                    Asignar Todo a Admin
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                            <Shield className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{roles.length}</p>
                            <p className="text-sm text-gray-500">Roles</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                            <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{Object.values(permissionCategories).flat().length}</p>
                            <p className="text-sm text-gray-500">Permisos</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                            <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{Object.keys(permissionCategories).length}</p>
                            <p className="text-sm text-gray-500">Categorías</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                            <Eye className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{roles.filter(r => r.isSystem).length}</p>
                            <p className="text-sm text-gray-500">Sistema</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Roles List */}
            {loading ? (
                <div className="text-center py-10 text-gray-400">Cargando roles...</div>
            ) : (
                <div className="space-y-4">
                    {roles.map((role) => (
                        <div
                            key={role._id}
                            className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
                        >
                            {/* Role Header */}
                            <div
                                className="p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                onClick={() => setExpandedRole(expandedRole === role._id ? null : role._id)}
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg"
                                        style={{ backgroundColor: role.color || '#6366f1' }}
                                    >
                                        <Shield className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                                                {role.displayName}
                                            </h3>
                                            {role.isSystem && (
                                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-semibold rounded-lg">
                                                    Sistema
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            {role.permissions.length} de {Object.values(permissionCategories).flat().length} permisos
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="hidden md:flex items-center gap-2">
                                        {/* Permission progress bar */}
                                        <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all"
                                                style={{ width: `${(role.permissions.length / Object.values(permissionCategories).flat().length) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-sm text-gray-500">
                                            {Math.round((role.permissions.length / Object.values(permissionCategories).flat().length) * 100)}%
                                        </span>
                                    </div>
                                    {expandedRole === role._id ? (
                                        <ChevronUp className="w-5 h-5 text-gray-400" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-gray-400" />
                                    )}
                                </div>
                            </div>

                            {/* Expanded Permissions */}
                            {expandedRole === role._id && (
                                <div className="border-t border-gray-100 dark:border-gray-700 p-6 bg-gray-50/50 dark:bg-gray-900/30">
                                    <div className="space-y-6">
                                        {Object.entries(permissionCategories).map(([category, permissions]) => (
                                            <div key={category}>
                                                <h4 className={`inline-flex px-3 py-1 rounded-lg text-sm font-bold mb-3 ${getCategoryColor(category)}`}>
                                                    {category}
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {permissions.map((perm) => {
                                                        const hasPermission = role.permissions.includes(perm.value);
                                                        return (
                                                            <label
                                                                key={perm.value}
                                                                className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all ${hasPermission
                                                                        ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800'
                                                                        : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                                    }`}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={hasPermission}
                                                                    onChange={() => togglePermission(role._id, perm.value)}
                                                                    disabled={updating}
                                                                    className="mt-1 w-4 h-4 text-green-600 rounded focus:ring-green-500 disabled:opacity-50"
                                                                />
                                                                <div className="flex-1">
                                                                    <p className={`font-medium ${hasPermission ? 'text-green-700 dark:text-green-300' : 'text-gray-700 dark:text-gray-300'}`}>
                                                                        {perm.label}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                                        {perm.description}
                                                                    </p>
                                                                </div>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Permissions;
