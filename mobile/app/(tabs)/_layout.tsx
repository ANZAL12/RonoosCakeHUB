import { Tabs } from "expo-router";
import { Home, ShoppingCart, User, List, Cake } from "lucide-react-native";
import { useState, useEffect } from 'react';
import { api } from '../../lib/api';

export default function TabLayout() {
    const [isCustomCakeEnabled, setIsCustomCakeEnabled] = useState(true);

    useEffect(() => {
        // Fetch baker settings
        api.get('/users/baker-settings/')
            .then(res => {
                if (res.data.is_custom_build_enabled !== undefined) {
                    setIsCustomCakeEnabled(res.data.is_custom_build_enabled);
                }
            })
            .catch(err => console.error('Failed to fetch baker settings', err));
    }, []);

    return (
        <Tabs screenOptions={{ tabBarActiveTintColor: '#2563eb' }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    // @ts-ignore
                    tabBarIcon: ({ color }) => <Home size={24} color={color} />,
                }}
            />
            {isCustomCakeEnabled ? (
                <Tabs.Screen
                    name="custom-cake"
                    options={{
                        title: 'Build',
                        // @ts-ignore
                        tabBarIcon: ({ color }) => <Cake size={24} color={color} />,
                    }}
                />
            ) : (
                <Tabs.Screen
                    name="custom-cake"
                    options={{
                        href: null,
                    }}
                />
            )}
            <Tabs.Screen
                name="cart"
                options={{
                    title: 'Cart',
                    // @ts-ignore
                    tabBarIcon: ({ color }) => <ShoppingCart size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="orders"
                options={{
                    title: 'Orders',
                    // @ts-ignore
                    tabBarIcon: ({ color }) => <List size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    // @ts-ignore
                    tabBarIcon: ({ color }) => <User size={24} color={color} />,
                }}
            />
        </Tabs>
    );
}
