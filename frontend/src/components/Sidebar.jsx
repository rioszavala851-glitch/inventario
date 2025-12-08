import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Package, ChefHat, Salad, Utensils,
    Archive, Clock, LogOut, Sun, Moon, ChevronRight, ChevronLeft, ShieldCheck, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

const Sidebar = ({ isOpen, toggle, isMobile, closeMobile }) => {
    const { pathname } = useLocation();
    const { logout, user } = useAuth();
    const [darkMode, setDarkMode] = useState(() => {
        // Initialize from localStorage or system preference
        if (localStorage.theme === 'dark') {
            return true;
        } else if (localStorage.theme === 'light') {
            return false;
        } else {
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
    });

    useEffect(() => {
        // Apply dark mode class on mount and when darkMode changes
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
        }
    }, [darkMode]);

    const toggleTheme = () => {
        setDarkMode(prev => !prev);
    };

    const handleItemClick = () => {
        if (isMobile && closeMobile) {
            closeMobile();
        }
    };

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/', roles: ['administrativo', 'almacen', 'cocina', 'ensalada', 'isla'] },
        { name: 'Ingredientes', icon: Package, path: '/ingredientes', roles: ['administrativo'] },
        { name: 'Almacén', icon: Archive, path: '/almacen', roles: ['administrativo', 'almacen'] },
        { name: 'Cocina', icon: ChefHat, path: '/cocina', roles: ['administrativo', 'cocina'] },
        { name: 'Ensalada', icon: Salad, path: '/ensalada', roles: ['administrativo', 'ensalada'] },
        { name: 'Isla', icon: Utensils, path: '/isla', roles: ['administrativo', 'isla'] },
        { name: 'Histórico', icon: Clock, path: '/historico', roles: ['administrativo'] },
        { name: 'Administrativo', icon: ShieldCheck, path: '/admin', roles: ['administrativo'] },
    ];

    // Filter menu items based on user role
    const isAdminUser = user?.role === 'administrativo' || user?.role === 'admin';
    const visibleMenuItems = isAdminUser
        ? menuItems
        : menuItems.filter(item => item.roles.includes(user?.role));

    // Determine sidebar classes based on mobile state
    const sidebarClasses = isMobile
        ? `fixed inset-y-0 left-0 h-full z-50 p-4 transition-transform duration-300 w-72 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`
        : `fixed left-0 top-0 h-screen p-4 z-50 transition-all duration-300 ${isOpen ? 'w-72' : 'w-24'}`;

    return (
        <aside className={sidebarClasses}>
            <div className="h-full flex flex-col bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300">

                {/* Header */}
                <div className={`p-8 pb-4 flex items-center justify-between transition-all`}>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-primary-500/30 flex-shrink-0">
                            I
                        </div>
                        {(isOpen || isMobile) && (
                            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent whitespace-nowrap overflow-hidden">
                                Inventario
                            </h1>
                        )}
                    </div>
                    {/* Close button for mobile */}
                    {isMobile && (
                        <button onClick={closeMobile} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
                            <X className="w-6 h-6" />
                        </button>
                    )}
                </div>

                {(isOpen || isMobile) && (
                    <p className="text-xs font-medium text-gray-400 dark:text-gray-500 ml-11 mb-2 whitespace-nowrap overflow-hidden">
                        Bienvenido, <span className="text-gray-600 dark:text-gray-300">{user?.name}</span>
                    </p>
                )}

                {/* Navigation */}
                <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto no-scrollbar">
                    {visibleMenuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={handleItemClick}
                                className={`relative group flex items-center ${(isOpen || isMobile) ? 'justify-between px-4' : 'justify-center px-2'} py-3.5 rounded-2xl transition-all duration-300 ${isActive
                                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:translate-x-1'
                                    }`}
                                title={(!isOpen && !isMobile) ? item.name : ''}
                            >
                                <div className={`flex items-center gap-3.5 ${(!isOpen && !isMobile) && 'justify-center'}`}>
                                    <Icon className={`w-5 h-5 transition-colors flex-shrink-0 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
                                    {(isOpen || isMobile) && <span className="font-semibold text-sm whitespace-nowrap">{item.name}</span>}
                                </div>
                                {isActive && (isOpen || isMobile) && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary-600 dark:bg-primary-400 shadow-[0_0_8px_rgba(79,70,229,0.6)]" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer Actions */}
                <div className="p-4 mt-auto space-y-3">
                    <button
                        onClick={toggleTheme}
                        className="flex items-center justify-between w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-2xl text-gray-600 dark:text-gray-300 transition-all duration-200 border border-gray-100 dark:border-gray-700/30"
                    >
                        <div className={`flex items-center ${(isOpen || isMobile) ? 'gap-3' : 'justify-center'}`}>
                            <div className="p-1.5 rounded-lg bg-white dark:bg-gray-700 shadow-sm flex-shrink-0">
                                {darkMode ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                            </div>
                            {(isOpen || isMobile) && <span className="text-sm font-semibold">{darkMode ? 'Oscuro' : 'Claro'}</span>}
                        </div>
                    </button>

                    <button
                        onClick={() => {
                            logout();
                            handleItemClick();
                        }}
                        className={`flex items-center relative ${(isOpen || isMobile) ? 'justify-center w-full px-4' : 'justify-center px-0'} py-3.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-all duration-200 font-semibold text-sm group`}
                        title={(!isOpen && !isMobile) ? "Cerrar Sesión" : ""}
                    >
                        <LogOut className={`w-5 h-5 transition-transform group-hover:-translate-x-1 ${(isOpen || isMobile) ? 'mr-2' : ''}`} />
                        {(isOpen || isMobile) && "Cerrar Sesión"}
                    </button>

                    {!isMobile && (
                        <button
                            onClick={toggle}
                            className="flex items-center justify-center w-full py-2 mt-2 hover:bg-gray-100 dark:bg-transparent dark:hover:bg-gray-800 rounded-xl transition-colors text-gray-400"
                        >
                            {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                        </button>
                    )}

                    {(isOpen || isMobile) && <p className="text-center text-[10px] text-gray-300 dark:text-gray-600 pb-2">v1.2.0 • Pro Edition</p>}
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
