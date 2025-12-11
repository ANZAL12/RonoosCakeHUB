import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../lib/api';
import {
    List, PlusCircle, Settings, Package,
    ShoppingBag, TrendingUp, Clock, CheckCircle
} from 'lucide-react-native';

export default function BakerDashboard() {
    const router = useRouter();
    const { logout, user } = useAuthStore();
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        todayOrders: 0,
        pendingOrders: 0,
        activeProducts: 0
    });
    const [recentOrders, setRecentOrders] = useState<any[]>([]);

    // Local state for optimistic UI updates
    const [isToggleEnabled, setIsToggleEnabled] = useState(false);

    // Initialize toggle state from user prop
    React.useEffect(() => {
        if (user) {
            setIsToggleEnabled(user.is_custom_build_enabled ?? true);
        }
    }, [user]);

    const fetchData = async () => {
        try {
            const [ordersRes, productsRes] = await Promise.all([
                api.get('/orders/'),
                api.get('/catalog/baker/products/')
            ]);

            const orders = ordersRes.data;
            const products = productsRes.data;

            // Calculate Stats
            const today = new Date().toISOString().split('T')[0];
            const todayOrdersCount = orders.filter((o: any) => o.created_at?.startsWith(today)).length;
            const pendingOrdersCount = orders.filter((o: any) => o.status === 'pending').length;
            const activeProductsCount = products.filter((p: any) => p.is_active).length;

            setStats({
                todayOrders: todayOrdersCount,
                pendingOrders: pendingOrdersCount,
                activeProducts: activeProductsCount
            });

            // Get Recent Orders (Top 5)
            setRecentOrders(orders.slice(0, 5));

        } catch (error) {
            console.error('Error fetching dashboard data', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, []);



    const quickActions = [
        {
            title: 'Add New Product',
            icon: <PlusCircle size={24} color="#fff" />,
            route: '/baker/products/new',
            bgColor: 'bg-orange-600'
        },
        {
            title: 'View All Orders',
            icon: <ShoppingBag size={24} color="#fff" />,
            route: '/baker/orders',
            bgColor: 'bg-blue-600'
        },
        {
            title: 'View Analytics',
            icon: <TrendingUp size={24} color="#fff" />,
            route: '/baker/analytics',
            bgColor: 'bg-purple-600'
        },
        {
            title: 'Manage Products',
            icon: <Package size={24} color="#fff" />,
            route: '/baker/products',
            bgColor: 'bg-gray-600'
        },
    ];

    const cakeOptionActions = [
        { title: 'Bases', route: '/baker/manage-options?type=base' },
        { title: 'Flavours', route: '/baker/manage-options?type=flavour' },
        { title: 'Shapes', route: '/baker/manage-options?type=shape' },
        { title: 'Weights', route: '/baker/manage-options?type=weight' },
    ];

    if (loading && !refreshing) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50">
                <ActivityIndicator size="large" color="#ea580c" />
            </View>
        );
    }

    return (
        <ScrollView
            className="flex-1 bg-gray-50"
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <View className="p-6 bg-white mb-4">
                <Text className="text-2xl font-bold text-gray-800">Welcome, {user?.name}</Text>
                <Text className="text-gray-500">Here is your bakery overview</Text>
            </View>

            {/* Stats Grid */}
            <View className="px-4 mb-6 flex-row flex-wrap justify-between">
                <View className="w-[48%] bg-white p-4 rounded-xl shadow-sm mb-4">
                    <Text className="text-gray-500 text-xs mb-1">Orders Today</Text>
                    <Text className="text-2xl font-bold text-orange-600">{stats.todayOrders}</Text>
                    <View className="absolute right-2 top-2 bg-orange-100 p-2 rounded-full">
                        <Clock size={16} color="#ea580c" />
                    </View>
                </View>
                <View className="w-[48%] bg-white p-4 rounded-xl shadow-sm mb-4">
                    <Text className="text-gray-500 text-xs mb-1">Pending</Text>
                    <Text className="text-2xl font-bold text-blue-600">{stats.pendingOrders}</Text>
                    <View className="absolute right-2 top-2 bg-blue-100 p-2 rounded-full">
                        <ShoppingBag size={16} color="#2563eb" />
                    </View>
                </View>
                <View className="w-full bg-white p-4 rounded-xl shadow-sm">
                    <Text className="text-gray-500 text-xs mb-1">Active Products</Text>
                    <Text className="text-2xl font-bold text-green-600">{stats.activeProducts}</Text>
                    <View className="absolute right-2 top-2 bg-green-100 p-2 rounded-full">
                        <CheckCircle size={16} color="#16a34a" />
                    </View>
                </View>
            </View>

            {/* Store Settings */}
            <View className="px-4 mb-6">
                <Text className="text-lg font-bold text-gray-800 mb-3">Store Settings</Text>
                <View className="bg-white p-4 rounded-xl shadow-sm flex-row justify-between items-center">
                    <View>
                        <Text className="font-bold text-gray-800">Custom Cake Builder</Text>
                        <Text className="text-xs text-gray-500">Allow customers to build custom cakes</Text>
                    </View>
                    <TouchableOpacity
                        onPress={async () => {
                            const newValue = !isToggleEnabled;
                            // Optimistic update
                            setIsToggleEnabled(newValue);

                            try {
                                await api.patch('/users/me/', { is_custom_build_enabled: newValue });
                                // Silently sync logic if possible, or just trust the optimistic update for now.
                                // In a real app we might refetch user profile here.
                            } catch (error) {
                                console.error('Failed to update setting', error);
                                // Revert on failure
                                setIsToggleEnabled(!newValue);
                                alert('Failed to update setting');
                            }
                        }}
                        className={`w-12 h-7 rounded-full flex-row items-center px-1 ${isToggleEnabled ? 'bg-orange-600 justify-end' : 'bg-gray-300 justify-start'}`}
                    >
                        <View className="w-5 h-5 bg-white rounded-full shadow-sm" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Quick Actions */}
            < View className="px-4 mb-6" >
                <Text className="text-lg font-bold text-gray-800 mb-3">Quick Actions</Text>
                <View className="flex-row flex-wrap justify-between">
                    {quickActions.map((action, index) => (
                        <TouchableOpacity
                            key={index}
                            className={`${action.bgColor} w-[48%] p-4 rounded-xl mb-3 items-center justify-center`}
                            onPress={() => router.push(action.route)}
                        >
                            {action.icon}
                            <Text className="text-white font-semibold mt-2 text-center">{action.title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View >

            {/* Manage Cake Options (Compact) */}
            < View className="px-4 mb-6" >
                <Text className="text-lg font-bold text-gray-800 mb-3">Manage Custom Options</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {cakeOptionActions.map((action, index) => (
                        <TouchableOpacity
                            key={index}
                            className="bg-white px-6 py-3 rounded-xl mr-3 shadow-sm border border-gray-100"
                            onPress={() => router.push(action.route)}
                        >
                            <Text className="text-gray-700 font-semibold">{action.title}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View >

            {/* Recent Orders */}
            < View className="px-4 mb-8" >
                <Text className="text-lg font-bold text-gray-800 mb-3">Recent Orders</Text>
                {
                    recentOrders.length === 0 ? (
                        <Text className="text-gray-500 text-center py-4">No orders yet</Text>
                    ) : (
                        recentOrders.map((order) => (
                            <TouchableOpacity
                                key={order.id}
                                className="bg-white p-4 rounded-xl mb-3 shadow-sm flex-row justify-between items-center"
                                onPress={() => router.push(`/baker/orders/${order.id}`)}
                            >
                                <View>
                                    <Text className="font-semibold text-gray-800">Order #{order.id}</Text>
                                    <Text className={`text-xs ${order.status === 'pending' ? 'text-blue-600' :
                                        order.status === 'completed' ? 'text-green-600' : 'text-gray-500'
                                        }`}>
                                        {order.status.toUpperCase()}
                                    </Text>
                                </View>
                                <Text className="font-bold text-orange-600">₹{order.final_amount}</Text>
                            </TouchableOpacity>
                        ))
                    )
                }
            </View >



        </ScrollView >
    );
}
