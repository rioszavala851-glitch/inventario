import { useSubscription } from '../context/SubscriptionContext';
import { Calendar, CreditCard, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Subscription = () => {
    const { subscriptionStatus, loading } = useSubscription();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const getStatusBadge = () => {
        const status = subscriptionStatus?.status;
        if (status === 'trial') {
            return <span className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 rounded-full text-sm font-semibold">Prueba Gratis</span>;
        } else if (status === 'active') {
            return <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300 rounded-full text-sm font-semibold">Activa</span>;
        } else if (status === 'expired') {
            return <span className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300 rounded-full text-sm font-semibold">Expirada</span>;
        }
        return null;
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
                    Mi Suscripción
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Gestiona tu plan y facturación
                </p>
            </div>

            {/* Current Plan */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Plan Actual</h2>
                    {getStatusBadge()}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Status Info */}
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            {subscriptionStatus?.status === 'trial' || subscriptionStatus?.status === 'active' ? (
                                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                            ) : (
                                <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                            )}
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white">Estado</p>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {subscriptionStatus?.status === 'trial' && 'Período de prueba'}
                                    {subscriptionStatus?.status === 'active' && 'Suscripción activa'}
                                    {subscriptionStatus?.status === 'expired' && 'Suscripción expirada'}
                                </p>
                            </div>
                        </div>

                        {subscriptionStatus?.status === 'trial' && (
                            <div className="flex items-start gap-3">
                                <Calendar className="w-6 h-6 text-indigo-500 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">Días Restantes</p>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        {subscriptionStatus?.daysRemaining} día{subscriptionStatus?.daysRemaining !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>
                        )}

                        {subscriptionStatus?.status === 'active' && (
                            <div className="flex items-start gap-3">
                                <CreditCard className="w-6 h-6 text-indigo-500 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">Plan</p>
                                    <p className="text-gray-600 dark:text-gray-400 capitalize">
                                        {subscriptionStatus?.plan === 'monthly' ? 'Mensual' : 'Anual'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                        {(subscriptionStatus?.status === 'trial' || subscriptionStatus?.status === 'expired') && (
                            <Link
                                to="/pricing"
                                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-center hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/50"
                            >
                                Actualizar Plan
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Subscription;
