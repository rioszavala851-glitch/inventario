import { useState, useEffect } from 'react';
import {
    Bell, Check, Trash2, RefreshCw, AlertTriangle, Info,
    CheckCircle, X, Clock, Package, ExternalLink
} from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { useNavigate } from 'react-router-dom';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [checkingStock, setCheckingStock] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotifications();
    }, []);

    const getAuthConfig = () => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        return {
            headers: { Authorization: `Bearer ${userInfo?.token}` }
        };
    };

    const fetchNotifications = async () => {
        try {
            const { data } = await axios.get(`${API_BASE_URL}/api/notifications`, getAuthConfig());
            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount || 0);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
        setLoading(false);
    };

    const checkLowStock = async () => {
        setCheckingStock(true);
        try {
            const { data } = await axios.post(
                `${API_BASE_URL}/api/notifications/check-stock`,
                {},
                getAuthConfig()
            );
            alert(`${data.message}\nProductos con stock bajo: ${data.lowStockCount}`);
            fetchNotifications();
        } catch (error) {
            console.error('Error checking stock:', error);
            alert('Error al verificar stock');
        }
        setCheckingStock(false);
    };

    const markAsRead = async (id) => {
        try {
            await axios.put(`${API_BASE_URL}/api/notifications/${id}/read`, {}, getAuthConfig());
            setNotifications(prev =>
                prev.map(n => n._id === id ? { ...n, read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.put(`${API_BASE_URL}/api/notifications/read-all`, {}, getAuthConfig());
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const deleteNotification = async (id) => {
        try {
            await axios.delete(`${API_BASE_URL}/api/notifications/${id}`, getAuthConfig());
            setNotifications(prev => prev.filter(n => n._id !== id));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const clearAll = async () => {
        if (!window.confirm('¿Eliminar todas las notificaciones?')) return;
        try {
            await axios.delete(`${API_BASE_URL}/api/notifications`, getAuthConfig());
            setNotifications([]);
            setUnreadCount(0);
        } catch (error) {
            console.error('Error clearing notifications:', error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'low_stock':
                return <AlertTriangle className="w-5 h-5 text-orange-500" />;
            case 'warning':
                return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
            case 'success':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'info':
            default:
                return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    const getTypeStyles = (type) => {
        switch (type) {
            case 'low_stock':
                return 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/10';
            case 'warning':
                return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10';
            case 'success':
                return 'border-l-green-500 bg-green-50 dark:bg-green-900/10';
            case 'info':
            default:
                return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10';
        }
    };

    const formatTime = (date) => {
        const now = new Date();
        const notifDate = new Date(date);
        const diffMs = now - notifDate;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Ahora';
        if (diffMins < 60) return `Hace ${diffMins} min`;
        if (diffHours < 24) return `Hace ${diffHours}h`;
        if (diffDays < 7) return `Hace ${diffDays}d`;
        return notifDate.toLocaleDateString('es-MX');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                        <Bell className="w-8 h-8 text-indigo-500" />
                        Notificaciones
                        {unreadCount > 0 && (
                            <span className="px-2.5 py-0.5 bg-red-500 text-white text-sm font-bold rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Centro de alertas y notificaciones del sistema
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={checkLowStock}
                        disabled={checkingStock}
                        className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
                    >
                        {checkingStock ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                            <Package className="w-4 h-4" />
                        )}
                        Verificar Stock
                    </button>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors"
                        >
                            <Check className="w-4 h-4" />
                            Marcar todo leído
                        </button>
                    )}
                    {notifications.length > 0 && (
                        <button
                            onClick={clearAll}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            Limpiar
                        </button>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                            <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{notifications.length}</p>
                            <p className="text-sm text-gray-500">Total</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{unreadCount}</p>
                            <p className="text-sm text-gray-500">Sin leer</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                            <Package className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {notifications.filter(n => n.type === 'low_stock').length}
                            </p>
                            <p className="text-sm text-gray-500">Stock Bajo</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {notifications.filter(n => n.read).length}
                            </p>
                            <p className="text-sm text-gray-500">Leídas</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notifications List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                </div>
            ) : notifications.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-700">
                    <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        No hay notificaciones
                    </h3>
                    <p className="text-gray-500 mb-6">
                        Las alertas de stock bajo y otras notificaciones aparecerán aquí
                    </p>
                    <button
                        onClick={checkLowStock}
                        disabled={checkingStock}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold transition-colors"
                    >
                        <Package className="w-5 h-5" />
                        Verificar Stock Bajo
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {notifications.map((notification) => (
                        <div
                            key={notification._id}
                            className={`bg-white dark:bg-gray-800 rounded-xl border-l-4 p-4 flex items-start gap-4 transition-all ${getTypeStyles(notification.type)
                                } ${!notification.read ? 'shadow-md' : 'opacity-75'}`}
                        >
                            <div className="flex-shrink-0 mt-0.5">
                                {getIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <h4 className={`font-semibold ${notification.read
                                                ? 'text-gray-600 dark:text-gray-400'
                                                : 'text-gray-900 dark:text-white'
                                            }`}>
                                            {notification.title}
                                        </h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            {notification.message}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {formatTime(notification.createdAt)}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mt-3">
                                    {!notification.read && (
                                        <button
                                            onClick={() => markAsRead(notification._id)}
                                            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                                        >
                                            <Check className="w-3 h-3" />
                                            Marcar como leída
                                        </button>
                                    )}
                                    {notification.link && (
                                        <button
                                            onClick={() => navigate(notification.link)}
                                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                        >
                                            <ExternalLink className="w-3 h-3" />
                                            Ver más
                                        </button>
                                    )}
                                    <button
                                        onClick={() => deleteNotification(notification._id)}
                                        className="text-xs text-red-500 hover:underline flex items-center gap-1 ml-auto"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Notifications;
