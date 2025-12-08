import { Shield, Check, X } from 'lucide-react';

const Permissions = () => {
    // Mock roles
    const roles = [
        { name: 'Admin', access: ['all'] },
        { name: 'User', access: ['read', 'write_inventory'] },
    ];

    const permissionsList = [
        { id: 'view_dashboard', label: 'Ver Dashboard' },
        { id: 'manage_inventory', label: 'Gestionar Inventario' },
        { id: 'manage_users', label: 'Gestionar Usuarios' },
        { id: 'export_reports', label: 'Exportar Reportes' },
    ];

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
            </div>

            {/* Roles Grid */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden p-8">
                <div className="text-center py-10">
                    <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Configuración de Roles</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                        Próximamente podrás crear roles personalizados y asignar permisos granulares.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Permissions;
