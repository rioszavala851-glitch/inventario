import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Shield, Save, X, Palette } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

const Roles = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        displayName: '',
        permissions: [],
        color: '#6366f1',
        icon: 'Box'
    });

    const availablePermissions = [
        // Dashboard
        { value: 'view_dashboard', label: 'Ver Dashboard', category: 'Dashboard' },
        { value: 'view_analytics', label: 'Ver Análisis', category: 'Dashboard' },

        // Ingredientes
        { value: 'manage_ingredients', label: 'Gestionar Ingredientes (Legacy)', category: 'Ingredientes' },
        { value: 'create_ingredient', label: 'Crear Ingredientes', category: 'Ingredientes' },
        { value: 'edit_ingredient', label: 'Editar Ingredientes', category: 'Ingredientes' },
        { value: 'delete_ingredient', label: 'Eliminar Ingredientes', category: 'Ingredientes' },
        { value: 'import_ingredients', label: 'Importar Ingredientes', category: 'Ingredientes' },
        { value: 'export_ingredients', label: 'Exportar Ingredientes', category: 'Ingredientes' },
        { value: 'generate_qr_codes', label: 'Generar Códigos QR', category: 'Ingredientes' },

        // Inventario
        { value: 'capture_inventory', label: 'Capturar Inventario', category: 'Inventario' },
        { value: 'view_all_areas', label: 'Ver Todas las Áreas', category: 'Inventario' },
        { value: 'view_own_area', label: 'Ver Solo Su Área', category: 'Inventario' },
        { value: 'edit_inventory', label: 'Editar Inventario', category: 'Inventario' },
        { value: 'delete_inventory', label: 'Eliminar Inventario', category: 'Inventario' },
        { value: 'transfer_inventory', label: 'Transferir Inventario', category: 'Inventario' },
        { value: 'adjust_inventory', label: 'Ajustar Inventario', category: 'Inventario' },

        // Histórico
        { value: 'view_history', label: 'Ver Histórico', category: 'Histórico' },
        { value: 'create_snapshot', label: 'Crear Cierres', category: 'Histórico' },
        { value: 'delete_snapshot', label: 'Eliminar Cierres', category: 'Histórico' },
        { value: 'export_history', label: 'Exportar Histórico', category: 'Histórico' },
        { value: 'view_detailed_history', label: 'Ver Detalles de Histórico', category: 'Histórico' },

        // Reportes
        { value: 'view_reports', label: 'Ver Reportes', category: 'Reportes' },
        { value: 'generate_reports', label: 'Generar Reportes', category: 'Reportes' },
        { value: 'export_reports', label: 'Exportar Reportes', category: 'Reportes' },
        { value: 'schedule_reports', label: 'Programar Reportes', category: 'Reportes' },

        // Administración
        { value: 'manage_users', label: 'Gestionar Usuarios', category: 'Administración' },
        { value: 'manage_roles', label: 'Gestionar Roles', category: 'Administración' },
        { value: 'manage_permissions', label: 'Gestionar Permisos', category: 'Administración' },
        { value: 'view_audit_log', label: 'Ver Registro de Auditoría', category: 'Administración' },
        { value: 'manage_settings', label: 'Gestionar Configuración', category: 'Administración' },
        { value: 'backup_data', label: 'Respaldar Datos', category: 'Administración' },

        // Notificaciones
        { value: 'receive_alerts', label: 'Recibir Alertas', category: 'Notificaciones' },
        { value: 'manage_notifications', label: 'Gestionar Notificaciones', category: 'Notificaciones' },
        { value: 'send_notifications', label: 'Enviar Notificaciones', category: 'Notificaciones' }
    ];

    const availableIcons = ['Box', 'Archive', 'ChefHat', 'Salad', 'Utensils', 'Shield', 'ShieldCheck', 'Users'];
    const colorPresets = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4', '#6366f1'];

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo?.token}`
                }
            };

            if (editingRole) {
                await axios.put(`${API_BASE_URL}/api/roles/${editingRole._id}`, formData, config);
                alert('Rol actualizado exitosamente');
            } else {
                await axios.post(`${API_BASE_URL}/api/roles`, formData, config);
                alert('Rol creado exitosamente');
            }

            setShowModal(false);
            setEditingRole(null);
            setFormData({ name: '', displayName: '', permissions: [], color: '#6366f1', icon: 'Box' });
            fetchRoles();
        } catch (error) {
            alert(error.response?.data?.message || 'Error al guardar rol');
        }
    };

    const handleEdit = (role) => {
        setEditingRole(role);
        setFormData({
            name: role.name,
            displayName: role.displayName,
            permissions: role.permissions,
            color: role.color,
            icon: role.icon
        });
        setShowModal(true);
    };

    const handleDelete = async (id, roleName, isSystem) => {
        if (isSystem) {
            alert('No se pueden eliminar roles del sistema');
            return;
        }

        if (window.confirm(`¿Estás seguro de eliminar el rol "${roleName}"?`)) {
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                const config = {
                    headers: {
                        Authorization: `Bearer ${userInfo?.token}`
                    }
                };
                await axios.delete(`${API_BASE_URL}/api/roles/${id}`, config);
                fetchRoles();
                alert('Rol eliminado exitosamente');
            } catch (error) {
                alert(error.response?.data?.message || 'Error al eliminar rol');
            }
        }
    };

    const togglePermission = (permission) => {
        setFormData(prev => ({
            ...prev,
            permissions: prev.permissions.includes(permission)
                ? prev.permissions.filter(p => p !== permission)
                : [...prev.permissions, permission]
        }));
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
                        Gestión de Roles
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Crea y administra roles personalizados para el sistema.
                    </p>
                </div>
                <button
                    onClick={() => {
                        setEditingRole(null);
                        setFormData({ name: '', displayName: '', permissions: [], color: '#6366f1', icon: 'Box' });
                        setShowModal(true);
                    }}
                    className="flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-lg shadow-indigo-500/30 font-bold"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Nuevo Rol
                </button>
            </div>

            {/* Roles Grid */}
            {loading ? (
                <div className="text-center py-10 text-gray-400">Cargando roles...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {roles.map((role) => (
                        <div
                            key={role._id}
                            className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg"
                                        style={{ backgroundColor: role.color }}
                                    >
                                        <Shield className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white">{role.displayName}</h3>
                                        <p className="text-xs text-gray-500">{role.name}</p>
                                    </div>
                                </div>
                                {role.isSystem && (
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 text-xs font-semibold rounded-lg">
                                        Sistema
                                    </span>
                                )}
                            </div>

                            <div className="mb-4">
                                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Permisos</p>
                                <div className="flex flex-wrap gap-1">
                                    {role.permissions.length > 0 ? (
                                        role.permissions.map((perm, idx) => (
                                            <span
                                                key={idx}
                                                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-lg"
                                            >
                                                {availablePermissions.find(p => p.value === perm)?.label || perm}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-xs text-gray-400">Sin permisos</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(role)}
                                    className="flex-1 flex items-center justify-center px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl transition-all text-sm font-semibold"
                                >
                                    <Edit2 className="w-4 h-4 mr-1" />
                                    Editar
                                </button>
                                {!role.isSystem && (
                                    <button
                                        onClick={() => handleDelete(role._id, role.displayName, role.isSystem)}
                                        className="px-3 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden transform transition-all scale-100 animate-scale-in max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {editingRole ? 'Editar Rol' : 'Nuevo Rol'}
                                </h2>
                                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre Técnico</label>
                                        <input
                                            type="text"
                                            required
                                            disabled={editingRole?.isSystem}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white disabled:opacity-50"
                                            placeholder="ej. gerente"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value.toLowerCase() })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre para Mostrar</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white"
                                            placeholder="ej. Gerente"
                                            value={formData.displayName}
                                            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</label>
                                    <div className="flex gap-2">
                                        {colorPresets.map((color) => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, color })}
                                                className={`w-10 h-10 rounded-xl transition-all ${formData.color === color ? 'ring-4 ring-offset-2 ring-indigo-500' : ''}`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                        <input
                                            type="color"
                                            value={formData.color}
                                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                            className="w-10 h-10 rounded-xl cursor-pointer"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Permisos</label>
                                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                                        {/* Group permissions by category */}
                                        {['Dashboard', 'Ingredientes', 'Inventario', 'Histórico', 'Reportes', 'Administración', 'Notificaciones'].map((category) => {
                                            const categoryPerms = availablePermissions.filter(p => p.category === category);
                                            if (categoryPerms.length === 0) return null;

                                            return (
                                                <div key={category} className="border border-gray-200 dark:border-gray-700 rounded-xl p-3 bg-gray-50/50 dark:bg-gray-900/30">
                                                    <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">{category}</h4>
                                                    <div className="grid grid-cols-1 gap-2">
                                                        {categoryPerms.map((perm) => (
                                                            <label
                                                                key={perm.value}
                                                                className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={formData.permissions.includes(perm.value)}
                                                                    onChange={() => togglePermission(perm.value)}
                                                                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                                                />
                                                                <span className="text-sm text-gray-700 dark:text-gray-300">{perm.label}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 transition-all transform active:scale-95"
                                    >
                                        {editingRole ? 'Actualizar' : 'Crear'} Rol
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

export default Roles;
