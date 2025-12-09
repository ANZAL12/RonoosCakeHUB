import React, { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/api';
import { useRouter } from 'expo-router';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

interface PushNotificationProviderProps {
    children: React.ReactNode;
}

export const PushNotificationProvider: React.FC<PushNotificationProviderProps> = ({ children }) => {
    const { user } = useAuthStore();
    const notificationListener = useRef<Notifications.Subscription>();
    const responseListener = useRef<Notifications.Subscription>();
    const router = useRouter();

    // Polling state for Expo Go fallback
    const [lastOrderId, setLastOrderId] = useState<number | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!user || user.role !== 'baker') {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return;
        }

        const register = async () => {
            try {
                const token = await registerForPushNotificationsAsync();
                if (token) {
                    // Send token to backend
                    api.patch('/users/me/', { expo_push_token: token }).catch(err => console.error("Failed to sync push token", err));
                } else {
                    // If no token (likely Expo Go), fail gracefully and start polling
                    console.log("No push token obtained, falling back to polling.");
                    startPolling();
                }
            } catch (error) {
                console.log("Error getting push token, falling back to polling:", error);
                startPolling();
            }
        };

        register();

        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            console.log("Notification Received:", notification);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            const data = response.notification.request.content.data;
            if (data?.order_id) {
                router.push(`/baker/orders/${data.order_id}`);
            }
        });

        return () => {
            if (notificationListener.current) notificationListener.current.remove();
            if (responseListener.current) responseListener.current.remove();
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [user]);

    const startPolling = () => {
        // Check immediately
        checkLatestOrder(true);
        // Then poll every 10s
        intervalRef.current = setInterval(() => {
            checkLatestOrder(false);
        }, 10000);
        console.log("Polling started for notifications (Expo Go Fallback)");
    };

    const checkLatestOrder = async (isInitial: boolean) => {
        try {
            const response = await api.get('/orders/?limit=1');
            if (response.data) {
                const results = Array.isArray(response.data) ? response.data : response.data.results;

                if (results && results.length > 0) {
                    const latestOrder = results[0];
                    if (lastOrderId === null) {
                        setLastOrderId(latestOrder.id);
                        return;
                    }

                    if (!isInitial && latestOrder.id > lastOrderId) {
                        await sendLocalNotification(latestOrder.id);
                        setLastOrderId(latestOrder.id);
                    } else if (isInitial) {
                        setLastOrderId(latestOrder.id);
                    }
                }
            }
        } catch (error) {
            console.error('Error polling:', error);
        }
    };

    const sendLocalNotification = async (orderId: number) => {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "New Order Received! 🎂",
                body: `Order #${orderId} has been placed.`,
                data: { order_id: orderId },
                sound: 'default',
            },
            trigger: null,
        });
    };

    return <>{children}</>;
};

async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    // Check Expo Go FIRST, before permissions or Device checks to fail safe
    const isExpoGo = Constants.executionEnvironment === 'storeClient' || Constants.appOwnership === 'expo';

    if (Device.isDevice || isExpoGo) {
        // Log for debugging
        console.log("Environment Check:", {
            executionEnvironment: Constants.executionEnvironment,
            appOwnership: Constants.appOwnership,
            isExpoGo
        });

        if (isExpoGo) {
            console.log("Detected Expo Go environment. Skipping push token registration and using polling fallback.");
            // Skipping permission request in Expo Go to avoid "removed functionality" errors.
            return null;
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            return;
        }

        try {
            const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
            if (!projectId) {
                token = (await Notifications.getExpoPushTokenAsync()).data;
            } else {
                token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
            }
        } catch (e: any) {
            console.warn("Failed to get push token (likely Expo Go):", e.message);
            return null; // Return null to trigger polling fallback
        }
    } else {
        // Not a physical device
    }

    return token;
}
