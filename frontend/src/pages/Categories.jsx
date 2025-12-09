import { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { Plus, Edit2, Trash2, Package, Tag } from 'lucide-react';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        icon: 'Package',
        color: '#6366f1',
        subcategories: [],
    });
    const [newSubcategory, setNewSubcategory] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };

            const { data } = await axios.get(`${API_BASE_URL}/api/categories`, config);
            setCategories(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching categories:', error);
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

            if (editingCategory) {
                await axios.put(
                    `${API_BASE_URL}/api/categories/${editingCategory._id}`,
                    formData,
                    config
                );
            } else {
                await axios.post(`${API_BASE_URL}/api/categories`, formData, config);
            }

            fetchCategories();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving category:', error);
            alert(error.response?.data?.message || 'Error al guardar categoría');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar esta categoría?')) return;

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };

            await axios.delete(`${API_BASE_URL}/api/categories/${id}`, config);
            fetchCategories();
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('Error al eliminar categoría');
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description || '',
            icon: category.icon,
            color: category.color,
            subcategories: category.subcategories || [],
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingCategory(null);
        setFormData({
            name: '',
            description: '',
            icon: 'Package',
            color: '#6366f1',
            subcategories: [],
        });
        setNewSubcategory('');
    };

    const addSubcategory = () => {
        if (newSubcategory.trim()) {
            setFormData({
                ...formData,
                subcategories: [...formData.subcategories, newSubcategory.trim()],
            });
            setNewSubcategory('');
        }
    };

    const removeSubcategory = (index) => {
        setFormData({
            ...formData,
            subcategories: formData.subcategories.filter((_, i) => i !== index),
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
                        Categorías
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Gestiona las categorías de productos
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Nueva Categoría
                </button>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                    <div
                        key={category._id}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center"
                                style={{ backgroundColor: category.color + '20' }}
                            >
                                <Package className="w-6 h-6" style={{ color: category.color }} />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(category)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                </button>
                                <button
                                    onClick={() => handleDelete(category._id)}
                                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                </button>
                            </div>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                            {category.name}
                        </h3>
                        {category.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                {category.description}
                            </p>
                        )}

                        {category.subcategories && category.subcategories.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {category.subcategories.map((sub, idx) => (
                                    <span
                                        key={idx}
                                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-lg text-gray-700 dark:text-gray-300"
                                    >
                                        {sub}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                            {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
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
                                    Descripción
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Color
                                </label>
                                <input
                                    type="color"
                                    value={formData.color}
                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    className="w-full h-10 rounded-xl border border-gray-300 dark:border-gray-600"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Subcategorías
                                </label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={newSubcategory}
                                        onChange={(e) => setNewSubcategory(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubcategory())}
                                        placeholder="Agregar subcategoría"
                                        className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                    <button
                                        type="button"
                                        onClick={addSubcategory}
                                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.subcategories.map((sub, idx) => (
                                        <span
                                            key={idx}
                                            className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg flex items-center gap-2"
                                        >
                                            {sub}
                                            <button
                                                type="button"
                                                onClick={() => removeSubcategory(idx)}
                                                className="hover:text-red-600"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
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
                                    {editingCategory ? 'Actualizar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Categories;
