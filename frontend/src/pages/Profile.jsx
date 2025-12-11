import { useState, useEffect } from 'react';
import {
    User, Mail, Lock, Eye, EyeOff, Save, Camera, Shield,
    Calendar, Bell, Moon, Sun, Check, X, RefreshCw
} from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showPasswordFields, setShowPasswordFields] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [preferences, setPreferences] = useState({
        darkMode: localStorage.theme === 'dark',
        notifications: true,
        emailAlerts: false
    });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || '',
                email: user.email || ''
            }));
        }
    }, [user]);

    const getAuthConfig = () => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        return {
            headers: { Authorization: `Bearer ${userInfo?.token}` }
        };
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const { data } = await axios.put(
                `${API_BASE_URL}/api/users/profile`,
                { name: formData.name, email: formData.email },
                getAuthConfig()
            );

            // Update local storage
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            userInfo.name = data.name;
            userInfo.email = data.email;
            localStorage.setItem('userInfo', JSON.stringify(userInfo));

            if (updateUser) {
                updateUser(data);
            }

            setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Error al actualizar perfil'
            });
        }
        setLoading(false);
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
            return;
        }

        if (formData.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await axios.put(
                `${API_BASE_URL}/api/users/password`,
                {
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                },
                getAuthConfig()
            );

            setMessage({ type: 'success', text: 'Contraseña actualizada correctamente' });
            setFormData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }));
            setShowPasswordFields(false);
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Error al cambiar contraseña'
            });
        }
        setLoading(false);
    };

    const toggleDarkMode = () => {
        const newMode = !preferences.darkMode;
        setPreferences(prev => ({ ...prev, darkMode: newMode }));

        if (newMode) {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
                    Mi Perfil
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Administra tu información personal y preferencias
                </p>
            </div>

            {/* Message */}
            {message.text && (
                <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success'
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800'
                        : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
                    }`}>
                    {message.type === 'success' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                    {message.text}
                </div>
            )}

            {/* Profile Card */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-lg">
                {/* Avatar Section */}
                <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-100 dark:border-gray-700">
                    <div className="relative">
                        <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                            {formData.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <button className="absolute -bottom-2 -right-2 p-2 bg-white dark:bg-gray-700 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                            <Camera className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                        </button>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {formData.name}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400">{formData.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-medium rounded-lg capitalize">
                                {user?.role || 'Usuario'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Profile Form */}
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <User className="w-5 h-5 text-indigo-500" />
                        Información Personal
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Nombre completo
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white"
                                    placeholder="Tu nombre"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Correo electrónico
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white"
                                    placeholder="tu@email.com"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
                    >
                        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Guardar Cambios
                    </button>
                </form>
            </div>

            {/* Password Change */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Lock className="w-5 h-5 text-indigo-500" />
                        Seguridad
                    </h3>
                    <button
                        onClick={() => setShowPasswordFields(!showPasswordFields)}
                        className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm font-medium"
                    >
                        {showPasswordFields ? 'Cancelar' : 'Cambiar contraseña'}
                    </button>
                </div>

                {showPasswordFields && (
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Contraseña actual
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    value={formData.currentPassword}
                                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                    className="w-full pl-12 pr-12 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all dark:text-white"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Nueva contraseña
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        value={formData.newPassword}
                                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                        className="w-full pl-12 pr-12 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all dark:text-white"
                                        placeholder="••••••••"
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Confirmar contraseña
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all dark:text-white"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
                        >
                            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                            Actualizar Contraseña
                        </button>
                    </form>
                )}

                {!showPasswordFields && (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Tu contraseña fue actualizada por última vez hace más de 30 días. Te recomendamos cambiarla regularmente.
                    </p>
                )}
            </div>

            {/* Preferences */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                    <Bell className="w-5 h-5 text-indigo-500" />
                    Preferencias
                </h3>

                <div className="space-y-4">
                    {/* Dark Mode */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <div className="flex items-center gap-3">
                            {preferences.darkMode ? <Moon className="w-5 h-5 text-indigo-500" /> : <Sun className="w-5 h-5 text-yellow-500" />}
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">Modo Oscuro</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Cambiar apariencia de la aplicación</p>
                            </div>
                        </div>
                        <button
                            onClick={toggleDarkMode}
                            className={`relative w-14 h-8 rounded-full transition-colors ${preferences.darkMode ? 'bg-indigo-600' : 'bg-gray-300'
                                }`}
                        >
                            <span className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${preferences.darkMode ? 'left-7' : 'left-1'
                                }`} />
                        </button>
                    </div>

                    {/* Notifications */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <div className="flex items-center gap-3">
                            <Bell className="w-5 h-5 text-indigo-500" />
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">Notificaciones</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Recibir alertas de stock bajo</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setPreferences(prev => ({ ...prev, notifications: !prev.notifications }))}
                            className={`relative w-14 h-8 rounded-full transition-colors ${preferences.notifications ? 'bg-indigo-600' : 'bg-gray-300'
                                }`}
                        >
                            <span className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${preferences.notifications ? 'left-7' : 'left-1'
                                }`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Account Info */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                    <Calendar className="w-5 h-5 text-indigo-500" />
                    Información de la Cuenta
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <p className="text-gray-500 dark:text-gray-400">Rol</p>
                        <p className="font-semibold text-gray-900 dark:text-white capitalize">{user?.role || 'Usuario'}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <p className="text-gray-500 dark:text-gray-400">Estado</p>
                        <p className="font-semibold text-green-600 dark:text-green-400">Activo</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <p className="text-gray-500 dark:text-gray-400">Miembro desde</p>
                        <p className="font-semibold text-gray-900 dark:text-white">Diciembre 2024</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <p className="text-gray-500 dark:text-gray-400">Último acceso</p>
                        <p className="font-semibold text-gray-900 dark:text-white">Hoy</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
