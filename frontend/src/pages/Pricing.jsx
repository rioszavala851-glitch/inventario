import { useState } from 'react';
import { Check, Zap, Crown } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { useNavigate } from 'react-router-dom';

const Pricing = () => {
    const [loading, setLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const navigate = useNavigate();

    const plans = [
        {
            id: 'monthly',
            name: 'Mensual',
            price: 29,
            interval: 'mes',
            icon: Zap,
            color: 'indigo',
            features: [
                'Acceso completo a todas las funciones',
                'Gestión de inventario ilimitada',
                'Múltiples áreas (Almacén, Cocina, Ensalada, Isla)',
                'Histórico y reportes',
                'Gestión de usuarios y roles',
                'Soporte por email',
            ],
        },
        {
            id: 'annual',
            name: 'Anual',
            price: 290,
            interval: 'año',
            icon: Crown,
            color: 'purple',
            popular: true,
            savings: 'Ahorra $58 (2 meses gratis)',
            features: [
                'Todo lo del plan mensual',
                '2 meses gratis',
                'Soporte prioritario',
                'Actualizaciones anticipadas',
                'Sesiones de capacitación',
            ],
        },
    ];

    const handleSubscribe = async (planId) => {
        try {
            setLoading(true);
            setSelectedPlan(planId);

            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };

            const { data } = await axios.post(
                `${API_BASE_URL}/api/subscription/create-checkout`,
                { plan: planId },
                config
            );

            // Redirect to Stripe checkout
            window.location.href = data.url;
        } catch (error) {
            console.error('Error creating checkout session:', error);
            alert('Error al procesar el pago. Por favor intenta de nuevo.');
        } finally {
            setLoading(false);
            setSelectedPlan(null);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-20 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
                        Elige tu plan
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400">
                        Comienza con 14 días gratis. Sin tarjeta de crédito requerida.
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {plans.map((plan) => {
                        const Icon = plan.icon;
                        return (
                            <div
                                key={plan.id}
                                className={`relative bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden transition-all hover:scale-105 ${plan.popular ? 'ring-4 ring-purple-500' : ''
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-1 rounded-bl-2xl font-semibold text-sm">
                                        Más Popular
                                    </div>
                                )}

                                <div className="p-8">
                                    {/* Icon */}
                                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-${plan.color}-500 to-${plan.color}-600 flex items-center justify-center mb-6`}>
                                        <Icon className="w-8 h-8 text-white" />
                                    </div>

                                    {/* Plan Name */}
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                        {plan.name}
                                    </h3>

                                    {/* Price */}
                                    <div className="mb-6">
                                        <span className="text-5xl font-extrabold text-gray-900 dark:text-white">
                                            ${plan.price}
                                        </span>
                                        <span className="text-gray-600 dark:text-gray-400 ml-2">
                                            / {plan.interval}
                                        </span>
                                        {plan.savings && (
                                            <p className="text-green-600 dark:text-green-400 font-semibold mt-2">
                                                {plan.savings}
                                            </p>
                                        )}
                                    </div>

                                    {/* Features */}
                                    <ul className="space-y-4 mb-8">
                                        {plan.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-3">
                                                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                                <span className="text-gray-700 dark:text-gray-300">
                                                    {feature}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* CTA Button */}
                                    <button
                                        onClick={() => handleSubscribe(plan.id)}
                                        disabled={loading && selectedPlan === plan.id}
                                        className={`w-full py-4 rounded-xl font-bold text-lg transition-all transform active:scale-95 ${plan.popular
                                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/50'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                                            }`}
                                    >
                                        {loading && selectedPlan === plan.id ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Procesando...
                                            </span>
                                        ) : (
                                            'Comenzar Ahora'
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* FAQ or Additional Info */}
                <div className="mt-16 text-center">
                    <p className="text-gray-600 dark:text-gray-400">
                        ¿Tienes preguntas? <a href="mailto:support@inventario.com" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Contáctanos</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Pricing;
