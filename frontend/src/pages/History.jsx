import { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Download, Eye, ArrowRight, History as HistoryIcon, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../config/api';

const History = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const { data } = await axios.get(`${API_BASE_URL}/api/inventory/history`);
            setRecords(data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleSaveSnapshot = async () => {
        if (!window.confirm('¿Seguro que deseas guardar el cierre de inventario actual?')) return;
        try {
            await axios.post(`${API_BASE_URL}/api/inventory/save-snapshot`);
            fetchHistory(); // Refresh list
        } catch (error) {
            console.error(error);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return {
            full: date.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
            time: date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
            day: date.getDate(),
            month: date.toLocaleDateString('es-MX', { month: 'short' }).toUpperCase()
        };
    };

    const formatCurrency = (val) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val);

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
                        Historial de Cierres
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Consulta y descarga los reportes de inventarios pasados.
                    </p>
                </div>
                <button
                    onClick={handleSaveSnapshot}
                    className="flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-lg shadow-indigo-500/30 font-bold group"
                >
                    <SaveIcon className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                    Cerrar Inventario Actual
                </button>
            </div>

            {/* Timeline View */}
            <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent dark:before:via-gray-700">
                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4" />
                        <p className="text-gray-400">Cargando historial...</p>
                    </div>
                ) : records.map((record, index) => {
                    const dateObj = formatDate(record.date);
                    return (
                        <div key={record._id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">

                            {/* Icon Indicator */}
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-gray-900 bg-indigo-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 mx-auto md:mx-0">
                                <HistoryIcon className="w-5 h-5 text-white" />
                            </div>

                            {/* Card Content */}
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="text-center px-3 py-1 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600/50">
                                            <span className="block text-xs font-bold text-gray-400 uppercase">{dateObj.month}</span>
                                            <span className="block text-xl font-bold text-gray-800 dark:text-gray-200">{dateObj.day}</span>
                                        </div>
                                        <div>
                                            <time className="text-sm font-semibold text-indigo-500">{dateObj.time}</time>
                                            <h3 className="text-lg font-bold text-gray-800 dark:text-white capitalize">{dateObj.full}</h3>
                                        </div>
                                    </div>

                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-700/30">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Valor Total</p>
                                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                            ${record.totalInventoryValue.toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-700/30">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Artículos</p>
                                        <p className="text-lg font-bold text-gray-800 dark:text-white">
                                            {record.items.length}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <div className="flex gap-2">
                                        <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                            <Eye className="w-4 h-4 mr-2" />
                                            Ver Detalles
                                        </button>
                                        <button className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-lg transition-colors">
                                            <Download className="w-4 h-4 mr-2" />
                                            Excel
                                        </button>
                                    </div>
                                </div>
                            </div>

                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const SaveIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
    </svg>
);

export default History;
