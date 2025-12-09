import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const SubscriptionContext = createContext();

export const useSubscription = () => {
    const context = useContext(SubscriptionContext);
    if (!context) {
        throw new Error('useSubscription must be used within SubscriptionProvider');
    }
    return context;
};

export const SubscriptionProvider = ({ children }) => {
    const [subscriptionStatus, setSubscriptionStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchSubscriptionStatus = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            if (!userInfo) {
                setLoading(false);
                return;
            }

            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };

            const { data } = await axios.get(`${API_BASE_URL}/api/subscription/status`, config);
            setSubscriptionStatus(data);
        } catch (error) {
            console.error('Error fetching subscription status:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscriptionStatus();
    }, []);

    const isActive = () => {
        if (!subscriptionStatus) return false;
        return subscriptionStatus.status === 'trial' || subscriptionStatus.status === 'active';
    };

    const isTrial = () => {
        return subscriptionStatus?.status === 'trial';
    };

    const daysRemaining = () => {
        return subscriptionStatus?.daysRemaining || 0;
    };

    const value = {
        subscriptionStatus,
        loading,
        isActive,
        isTrial,
        daysRemaining,
        refreshStatus: fetchSubscriptionStatus,
    };

    return (
        <SubscriptionContext.Provider value={value}>
            {children}
        </SubscriptionContext.Provider>
    );
};
