import { useSubscription } from '../context/SubscriptionContext';
import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const TrialBanner = () => {
    const { isTrial, daysRemaining } = useSubscription();
    const [dismissed, setDismissed] = useState(false);

    if (!isTrial() || dismissed) return null;

    const days = daysRemaining();
    const isUrgent = days <= 3;

    return (
        <div className={`fixed top-0 left-0 right-0 z-50 ${isUrgent ? 'bg-red-600' : 'bg-indigo-600'} text-white shadow-lg`}>
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5" />
                    <p className="text-sm font-medium">
                        {days > 0 ? (
                            <>
                                Te quedan <span className="font-bold">{days} día{days !== 1 ? 's' : ''}</span> de prueba gratis.
                            </>
                        ) : (
                            <>Tu período de prueba expira hoy.</>
                        )}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        to="/pricing"
                        className="px-4 py-1.5 bg-white text-indigo-600 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors"
                    >
                        Actualizar Ahora
                    </Link>
                    <button
                        onClick={() => setDismissed(true)}
                        className="p-1 hover:bg-white/20 rounded transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TrialBanner;
