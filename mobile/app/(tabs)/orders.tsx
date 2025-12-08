import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'expo-router';

interface OrderItem {
    product_name: string;
    quantity: number;
    price: string;
}

interface Order {
    id: number;
    created_at: string;
    status: string;
    final_amount: string;
    items: OrderItem[];
}

export default function OrdersScreen() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { user } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (user) {
            fetchOrders();
        } else {
            setIsLoading(false);
        }
    }, [user]);

    const fetchOrders = async () => {
        try {
            const response = await api.get('/orders/');
            setOrders(response.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchOrders();
    };

    const renderItem = ({ item }: { item: Order }) => (
        <TouchableOpacity
            className="bg-white p-4 mb-3 rounded-lg shadow-sm"
            onPress={() => router.push(`/orders/${item.id}`)}
        >
            <View className="flex-row justify-between mb-2">
                <Text className="font-bold text-gray-800">Order #{item.id}</Text>
                <Text className={`font-bold ${item.status === 'completed' ? 'text-green-600' :
                    item.status === 'pending' ? 'text-yellow-600' : 'text-gray-600'
                    }`}>
                    {item.status.toUpperCase()}
                </Text>
            </View>

            <Text className="text-gray-500 text-sm mb-2">
                {new Date(item.created_at).toLocaleDateString()}
            </Text>

            <View className="border-t border-gray-100 pt-2 mt-2">
                <Text className="font-bold text-right text-lg text-blue-600">
                    Total: ₹{item.final_amount || '0.00'}
                </Text>
            </View>
        </TouchableOpacity>
    );

    if (!user) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <Text className="text-gray-500 mb-4">Please login to view your orders</Text>
            </View>
        );
    }

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50 px-4 pt-4">
            <FlatList
                data={orders}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View className="items-center justify-center mt-10">
                        <Text className="text-gray-500">No orders found</Text>
                    </View>
                }
            />
        </View>
    );
}
