import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Vibration, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/api';
import { Bell, X } from 'lucide-react-native';

interface NotificationManagerProps {
    children: React.ReactNode;
}

export const NotificationManager: React.FC<NotificationManagerProps> = ({ children }) => {
    const { user } = useAuthStore();
    const router = useRouter();
    const [lastOrderId, setLastOrderId] = useState<number | null>(null);
    const [notification, setNotification] = useState<{ id: number } | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (user?.role !== 'baker') {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return;
        }

        // Initial check
        checkLatestOrder(true);

        intervalRef.current = setInterval(() => {
            checkLatestOrder(false);
        }, 10000); // 10s polling for quick testing

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [user]);

    const checkLatestOrder = async (isInitial: boolean) => {
        try {
            const response = await api.get('/orders/?limit=1');
            if (response.data && response.data.length > 0) {
                const latestOrder = response.data[0];

                if (!isInitial) {
                    // If we have a lastOrderId and the new one is bigger OR
                    // if we had NO lastOrderId (null) but found one now (0 -> 1 case)
                    if ((lastOrderId && latestOrder.id > lastOrderId) || (lastOrderId === null)) {
                        triggerInAppNotification(latestOrder.id);
                    }
                }
                setLastOrderId(latestOrder.id);
            }
        } catch (error) {
            console.error('Error polling:', error);
        }
    };

    const triggerInAppNotification = (orderId: number) => {
        // Vibrate pattern: wait 0ms, vibrate 500ms, wait 200ms, vibrate 500ms
        Vibration.vibrate([0, 500, 200, 500]);
        setNotification({ id: orderId });

        // Auto hide after 10 seconds if not clicked
        setTimeout(() => {
            setNotification(prev => (prev?.id === orderId ? null : prev));
        }, 10000);
    };

    const handlePress = () => {
        if (notification) {
            router.push(`/baker/orders/${notification.id}`);
            setNotification(null);
        }
    };

    return (
        <View style={{ flex: 1 }}>
            {children}
            {notification && (
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.bannerContainer}>
                        <TouchableOpacity onPress={handlePress} style={styles.banner}>
                            <View style={styles.iconContainer}>
                                {/* @ts-ignore */}
                                <Bell color="#fff" size={24} />
                            </View>
                            <View style={styles.textContainer}>
                                <Text style={styles.title}>New Order Received! 🎂</Text>
                                <Text style={styles.message}>Order #{notification.id} placed just now.</Text>
                            </View>
                            <TouchableOpacity onPress={() => setNotification(null)} style={styles.closeButton}>
                                {/* @ts-ignore */}
                                <X color="#fff" size={20} />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
    },
    bannerContainer: {
        paddingTop: Platform.OS === 'android' ? 40 : 10, // Adjust for status bar
        paddingHorizontal: 10,
    },
    banner: {
        backgroundColor: '#ea580c', // Orange brand color
        padding: 15,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    iconContainer: {
        marginRight: 10,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    message: {
        color: 'white',
        fontSize: 14,
    },
    closeButton: {
        padding: 5,
    }
});
