import { useState, useEffect } from 'react';
import {
    Database, Download, Upload, RefreshCw, HardDrive,
    Package, Users, Tag, Truck, FileText, CheckCircle,
    AlertTriangle, Clock
} from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

const Backup = () => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [importing, setImporting] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [importOptions, setImportOptions] = useState({
        clearExisting: false,
        skipUsers: true,
        skipRoles: true
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchStatus();
    }, []);

    const getAuthConfig = () => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        return {
            headers: { Authorization: `Bearer ${userInfo?.token}` }
        };
    };

    const fetchStatus = async () => {
        try {
            const { data } = await axios.get(`${API_BASE_URL}/api/backup/status`, getAuthConfig());
            setStatus(data);
        } catch (error) {
            console.error('Error fetching status:', error);
        }
        setLoading(false);
    };

    const handleExport = async () => {
        setExporting(true);
        setMessage({ type: '', text: '' });

        try {
            const { data } = await axios.get(`${API_BASE_URL}/api/backup/export`, getAuthConfig());

            // Create and download file
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `stockzavala_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setMessage({ type: 'success', text: 'Backup exportado correctamente' });
        } catch (error) {
            console.error('Error exporting:', error);
            setMessage({ type: 'error', text: 'Error al exportar backup' });
        }
        setExporting(false);
    };

    const handleImport = async () => {
        if (!importFile) {
            setMessage({ type: 'error', text: 'Selecciona un archivo para importar' });
            return;
        }

        setImporting(true);
        setMessage({ type: '', text: '' });

        try {
            const fileContent = await importFile.text();
            const backupData = JSON.parse(fileContent);

            const { data } = await axios.post(
                `${API_BASE_URL}/api/backup/import`,
                { data: backupData.data, options: importOptions },
                getAuthConfig()
            );

            setMessage({
                type: 'success',
                text: `Importación completada. Ingredientes: ${data.results.ingredients.imported}, Categorías: ${data.results.categories.imported}`
            });
            setImportFile(null);
            fetchStatus();
        } catch (error) {
            console.error('Error importing:', error);
            setMessage({ type: 'error', text: 'Error al importar. Verifica que el archivo sea válido.' });
        }
        setImporting(false);
    };

    const getCollectionIcon = (name) => {
        switch (name) {
            case 'ingredients': return <Package className="w-5 h-5 text-green-500" />;
            case 'users': return <Users className="w-5 h-5 text-blue-500" />;
            case 'categories': return <Tag className="w-5 h-5 text-purple-500" />;
            case 'suppliers': return <Truck className="w-5 h-5 text-orange-500" />;
            case 'inventory': return <Database className="w-5 h-5 text-indigo-500" />;
            case 'snapshots': return <FileText className="w-5 h-5 text-pink-500" />;
            case 'roles': return <Users className="w-5 h-5 text-teal-500" />;
            default: return <Database className="w-5 h-5 text-gray-500" />;
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                    <Database className="w-8 h-8 text-indigo-500" />
                    Backup y Restauración
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Exporta e importa los datos del sistema
                </p>
            </div>

            {/* Message */}
            {message.text && (
                <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success'
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800'
                        : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
                    }`}>
                    {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                    {message.text}
                </div>
            )}

            {/* Database Status */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <HardDrive className="w-5 h-5 text-indigo-500" />
                        Estado de la Base de Datos
                    </h2>
                    <button
                        onClick={fetchStatus}
                        disabled={loading}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                    >
                        <RefreshCw className={`w-5 h-5 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                    </div>
                ) : status ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-6 h-6 text-green-500" />
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">Base de Datos Conectada</p>
                                    <p className="text-sm text-gray-500">{status.database}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{status.totalDocuments}</p>
                                <p className="text-sm text-gray-500">Documentos totales</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {Object.entries(status.collections || {}).map(([name, count]) => (
                                <div key={name} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        {getCollectionIcon(name)}
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300 capitalize">{name}</span>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{count}</p>
                                </div>
                            ))}
                        </div>

                        <p className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Última verificación: {new Date(status.lastChecked).toLocaleString('es-MX')}
                        </p>
                    </div>
                ) : (
                    <p className="text-center text-gray-500 py-8">Error al obtener estado</p>
                )}
            </div>

            {/* Export Section */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-lg">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                    <Download className="w-5 h-5 text-green-500" />
                    Exportar Backup
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Descarga todos los datos del sistema en un archivo JSON. Incluye ingredientes, inventario, categorías, proveedores, roles y snapshots.
                </p>
                <button
                    onClick={handleExport}
                    disabled={exporting}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
                >
                    {exporting ? (
                        <>
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            Exportando...
                        </>
                    ) : (
                        <>
                            <Download className="w-5 h-5" />
                            Descargar Backup
                        </>
                    )}
                </button>
            </div>

            {/* Import Section */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-lg">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                    <Upload className="w-5 h-5 text-orange-500" />
                    Restaurar Backup
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Importa datos desde un archivo de backup JSON. Los registros duplicados serán omitidos automáticamente.
                </p>

                <div className="space-y-4">
                    {/* File Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Archivo de Backup
                        </label>
                        <input
                            type="file"
                            accept=".json"
                            onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-100 file:text-indigo-600 file:font-medium hover:file:bg-indigo-200"
                        />
                        {importFile && (
                            <p className="mt-2 text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                                <CheckCircle className="w-4 h-4" />
                                {importFile.name}
                            </p>
                        )}
                    </div>

                    {/* Options */}
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
                        <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-3 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            Opciones de Importación
                        </h4>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                <input
                                    type="checkbox"
                                    checked={importOptions.skipUsers}
                                    onChange={(e) => setImportOptions({ ...importOptions, skipUsers: e.target.checked })}
                                    className="w-4 h-4 text-indigo-600 rounded"
                                />
                                No importar usuarios (recomendado)
                            </label>
                            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                <input
                                    type="checkbox"
                                    checked={importOptions.skipRoles}
                                    onChange={(e) => setImportOptions({ ...importOptions, skipRoles: e.target.checked })}
                                    className="w-4 h-4 text-indigo-600 rounded"
                                />
                                No importar roles (recomendado)
                            </label>
                            <label className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                                <input
                                    type="checkbox"
                                    checked={importOptions.clearExisting}
                                    onChange={(e) => setImportOptions({ ...importOptions, clearExisting: e.target.checked })}
                                    className="w-4 h-4 text-red-600 rounded"
                                />
                                ⚠️ Borrar datos existentes antes de importar
                            </label>
                        </div>
                    </div>

                    <button
                        onClick={handleImport}
                        disabled={importing || !importFile}
                        className="flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
                    >
                        {importing ? (
                            <>
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                Importando...
                            </>
                        ) : (
                            <>
                                <Upload className="w-5 h-5" />
                                Restaurar Backup
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Backup;
