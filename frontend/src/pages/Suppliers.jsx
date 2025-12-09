import { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { Plus, Edit2, Trash2, Building2, Mail, Phone, MapPin } from 'lucide-react';

const Suppliers = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        contactName: '',
        email: '',
        phone: '',
        address: '',
        rfc: '',
        paymentTerms: 'Contado',
        deliveryTime: 0,
        notes: '',
    });

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };

            const { data } = await axios.get(`${API_BASE_URL}/api/suppliers`, config);
            setSuppliers(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching suppliers:', error);
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };

            if (editingSupplier) {
                await axios.put(
                    `${API_BASE_URL}/api/suppliers/${editingSupplier._id}`,
                    formData,
                    config
                );
            } else {
                await axios.post(`${API_BASE_URL}/api/suppliers`, formData, config);
            }

            fetchSuppliers();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving supplier:', error);
            alert(error.response?.data?.message || 'Error al guardar proveedor');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este proveedor?')) return;

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };

            await axios.delete(`${API_BASE_URL}/api/suppliers/${id}`, config);
            fetchSuppliers();
        } catch (error) {
            console.error('Error deleting supplier:', error);
            alert('Error al eliminar proveedor');
        }
    };

    const handleEdit = (supplier) => {
        setEditingSupplier(supplier);
        setFormData({
            name: supplier.name,
            contactName: supplier.contactName || '',
            email: supplier.email || '',
            phone: supplier.phone || '',
            address: supplier.address || '',
            rfc: supplier.rfc || '',
            paymentTerms: supplier.paymentTerms || 'Contado',
            deliveryTime: supplier.deliveryTime || 0,
            notes: supplier.notes || '',
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingSupplier(null);
        setFormData({
            name: '',
            contactName: '',
            email: '',
            phone: '',
            address: '',
            rfc: '',
            paymentTerms: 'Contado',
            deliveryTime: 0,
            notes: '',
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                        Proveedores
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Gestiona la información de tus proveedores
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Nuevo Proveedor
                </button>
            </div>

            {/* Suppliers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {suppliers.map((supplier) => (
                    <div
                        key={supplier._id}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(supplier)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                </button>
                                <button
                                    onClick={() => handleDelete(supplier._id)}
                                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                </button>
                            </div>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                            {supplier.name}
                        </h3>
                        {supplier.contactName && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                Contacto: {supplier.contactName}
                            </p>
                        )}

                        <div className="space-y-2">
                            {supplier.email && (
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <Mail className="w-4 h-4" />
                                    {supplier.email}
                                </div>
                            )}
                            {supplier.phone && (
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <Phone className="w-4 h-4" />
                                    {supplier.phone}
                                </div>
                            )}
                            {supplier.address && (
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <MapPin className="w-4 h-4" />
                                    {supplier.address}
                                </div>
                            )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                                {supplier.paymentTerms}
                            </span>
                            {supplier.deliveryTime > 0 && (
                                <span className="text-gray-600 dark:text-gray-400">
                                    {supplier.deliveryTime} días
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-6 my-8">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                            {editingSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Nombre *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Persona de Contacto
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.contactName}
                                        onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Teléfono
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        RFC
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.rfc}
                                        onChange={(e) => setFormData({ ...formData, rfc: e.target.value.toUpperCase() })}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Condiciones de Pago
                                    </label>
                                    <select
                                        value={formData.paymentTerms}
                                        onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="Contado">Contado</option>
                                        <option value="15 días">15 días</option>
                                        <option value="30 días">30 días</option>
                                        <option value="45 días">45 días</option>
                                        <option value="60 días">60 días</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Tiempo de Entrega (días)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.deliveryTime}
                                        onChange={(e) => setFormData({ ...formData, deliveryTime: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Dirección
                                </label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    rows={2}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Notas
                                </label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
                                >
                                    {editingSupplier ? 'Actualizar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Suppliers;
