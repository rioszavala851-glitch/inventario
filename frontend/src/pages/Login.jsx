import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight, LayoutDashboard } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await login(email, password);
        if (result.success) {
            navigate('/');
        } else {
            alert(result.message || 'Credenciales inválidas');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl translate-y-1/2" />

            <div className="relative w-full max-w-md p-6 animate-fade-in-up">
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 space-y-8">

                    {/* Header */}
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30 mb-4">
                            <LayoutDashboard className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            Bienvenido
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">
                            Sistema de Inventario
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all dark:text-white font-medium"
                                    placeholder="correo@ejemplo.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all dark:text-white font-medium"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all transform active:scale-95 flex items-center justify-center group"
                        >
                            <span>Iniciar Sesión</span>
                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>

                    {/* Footer / Helper Text */}
                    <div className="pt-6 border-t border-gray-100 dark:border-gray-700 text-center">
                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-2">Credenciales Demo</p>
                        <code className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-indigo-600 dark:text-indigo-400 font-mono">
                            admin@admin.com / admin1234
                        </code>
                    </div>
                </div>

                <p className="text-center text-xs text-gray-400 mt-6 max-w-xs mx-auto">
                    &copy; 2025 Inventario Pro. Todos los derechos reservados.
                </p>
            </div>
        </div>
    );
};

export default Login;
