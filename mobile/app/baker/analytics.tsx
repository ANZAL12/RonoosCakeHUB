import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, ActivityIndicator, Dimensions } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { api } from '../../lib/api';
// Importing LineChart from 'react-native-chart-kit' would be ideal but requires install.
// We will simply display stats cards for now to avoid package dependency issues unless requested.

export default function AnalyticsScreen() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchAnalytics = async () => {
        try {
            const response = await api.get('/orders/analytics/');
            setData(response.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchAnalytics();
        }, [])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchAnalytics();
    }, []);

    if (loading && !refreshing) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#ea580c" />
            </View>
        );
    }

    if (!data) {
        return (
            <View className="flex-1 justify-center items-center">
                <Text>No analytics data available</Text>
            </View>
        );
    }

    return (
        <ScrollView
            className="flex-1 bg-gray-50 p-4"
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <Text className="text-2xl font-bold text-gray-800 mb-6">Analytics Overview</Text>

            {/* Key Metrics */}
            <View className="flex-row flex-wrap justify-between mb-6">
                <View className="w-[48%] bg-white p-4 rounded-xl shadow-sm mb-4">
                    <Text className="text-gray-500 text-sm mb-1">Total Revenue</Text>
                    <Text className="text-2xl font-bold text-green-600">₹{parseFloat(data.total_revenue).toFixed(2)}</Text>
                </View>
                <View className="w-[48%] bg-white p-4 rounded-xl shadow-sm mb-4">
                    <Text className="text-gray-500 text-sm mb-1">Total Orders</Text>
                    <Text className="text-2xl font-bold text-blue-600">{data.total_orders}</Text>
                </View>
                <View className="w-full bg-white p-4 rounded-xl shadow-sm">
                    <Text className="text-gray-500 text-sm mb-1">Avg Order Value</Text>
                    <Text className="text-2xl font-bold text-purple-600">₹{parseFloat(data.avg_order_value).toFixed(2)}</Text>
                </View>
            </View>

            {/* Top Products */}
            <View className="bg-white rounded-xl shadow-sm p-4 mb-6">
                <Text className="text-lg font-bold text-gray-800 mb-4">Top Selling Products</Text>
                {data.top_products && data.top_products.map((item: any, index: number) => (
                    <View key={index} className="flex-row justify-between items-center mb-3 pb-3 border-b border-gray-100 last:border-0">
                        <View className="flex-1">
                            <Text className="font-semibold text-gray-800">{item.product__name}</Text>
                            <Text className="text-xs text-gray-500">{item.total_sold} sold</Text>
                        </View>
                        <Text className="font-bold text-green-600">₹{item.revenue}</Text>
                    </View>
                ))}
            </View>

            {/* Top Customers */}
            <View className="bg-white rounded-xl shadow-sm p-4 mb-6">
                <Text className="text-lg font-bold text-gray-800 mb-4">Top Customers</Text>
                {data.top_customers && data.top_customers.map((item: any, index: number) => (
                    <View key={index} className="flex-row justify-between items-center mb-3 pb-3 border-b border-gray-100 last:border-0">
                        <View className="flex-1">
                            <Text className="font-semibold text-gray-800">{item.user__name}</Text>
                            <Text className="text-xs text-gray-500">{item.orders_placed} orders</Text>
                        </View>
                        <Text className="font-bold text-blue-600">₹{item.total_spent}</Text>
                    </View>
                ))}
            </View>

        </ScrollView>
    );
}
