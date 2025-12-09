import { useSubscription } from '../context/SubscriptionContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const SubscriptionGuard = ({ children }) => {
    const { isActive, loading, subscriptionStatus } = useSubscription();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !isActive()) {
            navigate('/pricing');
        }
    }, [loading, isActive, navigate]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Verificando suscripción...</p>
                </div>
            </div>
        );
    }

    if (!isActive()) {
        return null; // Will redirect to pricing
    }

    return <>{children}</>;
};

export default SubscriptionGuard;
