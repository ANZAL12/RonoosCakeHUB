import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Alert, Modal, Pressable } from 'react-native';
import { useRouter, useFocusEffect, Stack } from 'expo-router';
import { api } from '../../../lib/api';
import { Download, Filter, X, Check } from 'lucide-react-native';
import { generateAllOrdersReportPDF } from '../../../lib/generateAllOrdersReportPDF';

const ORDER_STATUSES = [
    { label: 'All', value: null },
    { label: 'Pending', value: 'pending' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'In Kitchen', value: 'in_kitchen' },
    { label: 'Ready', value: 'ready' },
    { label: 'Out for Delivery', value: 'out_for_delivery' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' },
];

export default function BakerOrdersList() {
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [generatingReport, setGeneratingReport] = useState(false);

    // Filter State
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [filterModalVisible, setFilterModalVisible] = useState(false);

    const fetchOrders = useCallback(async () => {
        try {
            const params: any = {};
            if (selectedStatus) {
                params.status = selectedStatus;
            }
            const response = await api.get('/orders/', { params });
            setOrders(response.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [selectedStatus]);

    useFocusEffect(
        useCallback(() => {
            fetchOrders();
        }, [fetchOrders])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchOrders(); // fetchOrders depends on selectedStatus, so it will respect the filter
    }, [fetchOrders]);

    const handleFilterPress = () => {
        setFilterModalVisible(true);
    };

    const applyFilter = (status: string | null) => {
        setSelectedStatus(status);
        setFilterModalVisible(false);
        setLoading(true);
        // Effect will trigger fetchOrders due to dependency change
    };

    const handleDownloadReport = async () => {
        if (orders.length === 0) {
            Alert.alert('No Orders', 'There are no orders to generate a report for.');
            return;
        }

        setGeneratingReport(true);
        try {
            const completedOrders = orders.filter(o => o.status === 'completed');
            if (completedOrders.length === 0) {
                Alert.alert('No Completed Orders', 'There are no completed orders to include in the report.');
                return;
            }
            await generateAllOrdersReportPDF(completedOrders);
        } catch (error) {
            console.error('Error downloading report:', error);
            Alert.alert('Error', 'Failed to download report');
        } finally {
            setGeneratingReport(false);
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            className="bg-white p-4 rounded-xl mb-3 shadow-sm mx-4"
            onPress={() => router.push(`/baker/orders/${item.id}`)}
        >
            <View className="flex-row justify-between items-center mb-2">
                <Text className="font-bold text-lg text-gray-800">Order #{item.id}</Text>
                <Text className="font-bold text-orange-600 text-lg">₹{item.final_amount}</Text>
            </View>
            <View className="flex-row justify-between items-center">
                <Text className="text-gray-500 text-sm">
                    {new Date(item.created_at).toLocaleDateString()}
                </Text>
                <View className={`px-2 py-1 rounded-full ${item.status === 'pending' ? 'bg-blue-100' :
                    item.status === 'completed' ? 'bg-green-100' :
                        item.status === 'cancelled' ? 'bg-red-100' : 'bg-gray-100'
                    }`}>
                    <Text className={`text-xs font-semibold ${item.status === 'pending' ? 'text-blue-600' :
                        item.status === 'completed' ? 'text-green-600' :
                            item.status === 'cancelled' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                        {item.status.toUpperCase()}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    if (loading && !refreshing) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#ea580c" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            <Stack.Screen
                options={{
                    title: 'Orders',
                    headerRight: () => (
                        <TouchableOpacity onPress={handleFilterPress} className="mr-4">
                            <Filter size={24} color="#fff" />
                        </TouchableOpacity>
                    ),
                }}
            />

            {/* Filter Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={filterModalVisible}
                onRequestClose={() => setFilterModalVisible(false)}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-3xl p-6">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold text-gray-800">Filter Orders</Text>
                            <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                                <X size={24} color="#374151" />
                            </TouchableOpacity>
                        </View>

                        <View className="flex-row flex-wrap gap-2 mb-8">
                            {ORDER_STATUSES.map((status) => (
                                <Pressable
                                    key={status.label}
                                    onPress={() => applyFilter(status.value)}
                                    className={`px-4 py-2 rounded-full border ${selectedStatus === status.value
                                        ? 'bg-orange-600 border-orange-600'
                                        : 'bg-white border-gray-300'
                                        }`}
                                >
                                    <Text className={`${selectedStatus === status.value ? 'text-white' : 'text-gray-700'
                                        } font-medium`}>
                                        {status.label}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>
                </View>
            </Modal>

            <FlatList
                data={orders}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ paddingVertical: 16 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListHeaderComponent={
                    <View className="mx-4 mb-4">
                        {selectedStatus && (
                            <View className="bg-orange-100 p-3 rounded-xl flex-row justify-between items-center mb-4">
                                <Text className="text-orange-800 font-medium">
                                    Filtered by: {ORDER_STATUSES.find(s => s.value === selectedStatus)?.label}
                                </Text>
                                <TouchableOpacity onPress={() => applyFilter(null)}>
                                    <X size={16} color="#9a3412" />
                                </TouchableOpacity>
                            </View>
                        )}

                        <TouchableOpacity
                            className="bg-gray-800 p-4 rounded-xl flex-row justify-center items-center shadow-sm"
                            onPress={handleDownloadReport}
                            disabled={generatingReport}
                        >
                            {generatingReport ? (
                                <ActivityIndicator color="white" size="small" className="mr-2" />
                            ) : (
                                <Download size={20} color="white" className="mr-2" />
                            )}
                            <Text className="text-white font-bold text-base">Download All Orders Report</Text>
                        </TouchableOpacity>
                    </View>
                }
                ListEmptyComponent={
                    <Text className="text-center text-gray-500 mt-10">
                        {selectedStatus ? 'No orders found with this status' : 'No orders found'}
                    </Text>
                }
            />
        </View>
    );
}
