import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import PWAInstallPrompt from './PWAInstallPrompt';
import { ArrowLeft, Menu } from 'lucide-react';

const Layout = () => {
    // Initial state based on screen width - OPEN by default on desktop
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            // On desktop, default to open if it wasn't set, or maintain state
            if (!mobile && !isSidebarOpen) {
                // Optional: Force open on desktop resize? Or keep collapsed. 
                // Let's keep user preference or default to true for larger screens
                // setIsSidebarOpen(true);
            }
            // On mobile, force close default or keep user state? 
            // Usually valid to close on resize to mobile
            if (mobile) {
                setIsSidebarOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    // Hide back button on the main dashboard
    const showBackButton = location.pathname !== '/';

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 z-40 flex items-center px-4 shadow-sm border-b border-gray-100 dark:border-gray-700">
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 -ml-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <img src="/logo.png" alt="StockZavala" className="h-8 w-auto ml-3 object-contain" />
            </div>

            <Sidebar
                isOpen={isSidebarOpen}
                toggle={toggleSidebar}
                isMobile={isMobile}
                closeMobile={() => setIsSidebarOpen(false)}
            />

            {/* Overlay for mobile */}
            {isMobile && isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <main className={`flex-1 transition-all duration-300 p-4 md:p-8 pt-20 md:pt-8 ${isMobile
                ? 'ml-0 w-full'
                : isSidebarOpen ? 'ml-72' : 'ml-24'
                }`}>
                <div className="max-w-[1200px] mx-auto">
                    {showBackButton && (
                        <button
                            onClick={() => navigate(-1)}
                            className="mb-6 flex items-center text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors font-medium text-sm group"
                        >
                            <div className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-sm mr-3 group-hover:-translate-x-1 transition-transform border border-gray-100 dark:border-gray-700">
                                <ArrowLeft className="w-4 h-4" />
                            </div>
                            Regresar
                        </button>
                    )}
                    <Outlet />
                </div>
            </main>

            {/* PWA Install Prompt */}
            <PWAInstallPrompt />
        </div>
    );
};

export default Layout;
