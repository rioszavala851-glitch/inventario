import { useState, useEffect } from 'react';
import { Plus, Search, MoreVertical, Trash2, Edit2, User, X, Check, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

const Users = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'almacen' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));

            console.log('🔐 User Info from localStorage:', userInfo ? 'Found' : 'NOT FOUND');
            console.log('🔑 Token exists:', !!userInfo?.token);

            if (!userInfo?.token) {
                console.error('❌ No token found, redirecting to login');
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
            setUsers(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching users:', error);
            // Handle authentication errors
            if (error.response?.status === 401) {
                console.error('❌ Authentication failed, clearing session and redirecting to login');
                localStorage.removeItem('userInfo');
                navigate('/login');
                return;
            }
            setLoading(false);
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));

            if (!userInfo?.token) {
                alert('Sesión expirada. Por favor inicia sesión de nuevo.');
                localStorage.removeItem('userInfo');
                navigate('/login');
                return;
            }

            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`
                }
            };
            await axios.post(`${API_BASE_URL}/api/users`, newUser, config);
            setShowModal(false);
            setNewUser({ name: '', email: '', password: '', role: 'almacen' });
            fetchUsers();
            alert('Usuario creado exitosamente');
        } catch (error) {
            console.error('Error creating user:', error);

            // Handle authentication errors
            if (error.response?.status === 401) {
                alert('Sesión expirada. Por favor inicia sesión de nuevo.');
                localStorage.removeItem('userInfo');
                navigate('/login');
                return;
            }

            alert(error.response?.data?.message || 'Error creating user');
        }
    };

    const handleDeleteUser = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));

                if (!userInfo?.token) {
                    alert('Sesión expirada. Por favor inicia sesión de nuevo.');
                    localStorage.removeItem('userInfo');
                    navigate('/login');
                    return;
                }

                const config = {
                    headers: {
                        Authorization: `Bearer ${userInfo.token}`
                    }
                };
                await axios.delete(`${API_BASE_URL}/api/users/${id}`, config);
                fetchUsers();
            } catch (error) {
                console.error('Error deleting user:', error);

                // Handle authentication errors
                if (error.response?.status === 401) {
                    alert('Sesión expirada. Por favor inicia sesión de nuevo.');
                    localStorage.removeItem('userInfo');
                    navigate('/login');
                    return;
                }

                alert(error.response?.data?.message || 'Error eliminando usuario');
            }
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
                        Usuarios
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Gestiona el acceso al sistema.
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-lg shadow-indigo-500/30 font-bold"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Nuevo Usuario
                </button>
            </div>

            {/* List */}
            {loading ? (
                <div className="text-center py-10 text-gray-400">Cargando usuarios...</div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                                    <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Usuario</th>
                                    <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Rol</th>
                                    <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {users.length > 0 ? (
                                    users.map((user) => (
                                        <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">
                                            <td className="px-8 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold uppercase">
                                                        {user.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 dark:text-white">{user.name}</p>
                                                        <p className="text-sm text-gray-500">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-4">
                                                {(() => {
                                                    // Handle role as either string or populated object
                                                    const roleName = typeof user.role === 'object' && user.role !== null
                                                        ? user.role.name
                                                        : user.role;
                                                    return (
                                                        <div className="flex items-center gap-2">
                                                            <Shield className="w-4 h-4 text-gray-400" />
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${roleName === 'administrativo'
                                                                ? 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800'
                                                                : roleName === 'almacen'
                                                                    ? 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'
                                                                    : roleName === 'cocina'
                                                                        ? 'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800'
                                                                        : roleName === 'ensalada'
                                                                            ? 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
                                                                            : roleName === 'isla'
                                                                                ? 'bg-teal-50 text-teal-700 border-teal-100 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-800'
                                                                                : 'bg-gray-50 text-gray-700 border-gray-100 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800'
                                                                }`}>
                                                                {roleName}
                                                            </span>
                                                        </div>
                                                    );
                                                })()}
                                            </td>
                                            <td className="px-8 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleDeleteUser(user._id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="px-8 py-8 text-center text-gray-500">
                                            No hay usuarios registrados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all scale-100 animate-scale-in">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Nuevo Usuario</h2>
                                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleAddUser} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre Completo</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white"
                                        placeholder="Ej. Juan Pérez"
                                        value={newUser.name}
                                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Correo Electrónico</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white"
                                        placeholder="correo@ejemplo.com"
                                        value={newUser.email}
                                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contraseña</label>
                                    <input
                                        type="password"
                                        required
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white"
                                        placeholder="••••••••"
                                        value={newUser.password}
                                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rol</label>
                                    <select
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white appearance-none"
                                        value={newUser.role}
                                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                    >
                                        <option value="administrativo">Administrativo</option>
                                        <option value="almacen">Almacén</option>
                                        <option value="cocina">Cocina</option>
                                        <option value="ensalada">Ensalada</option>
                                        <option value="isla">Isla</option>
                                    </select>
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
                                        Crear Usuario
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

export default Users;
