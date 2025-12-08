import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Linking, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api, BASE_URL } from '../../lib/api';
import { ArrowLeft, MapPin } from 'lucide-react-native';

// Helper to get full image URL
const getImageUrl = (url: string | null | undefined) => {
    if (!url) return 'https://via.placeholder.com/100';
    if (url.startsWith('http')) return url;
    return `${BASE_URL}${url}`;
};

export default function OrderDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchOrder = async () => {
        try {
            const response = await api.get(`/orders/${id}/`);
            setOrder(response.data);
        } catch (error) {
            console.error('Error fetching order details:', error);
            Alert.alert('Error', 'Failed to load order details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchOrder();
        }
    }, [id]);

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#ea580c" />
            </View>
        );
    }

    if (!order) {
        return (
            <View className="flex-1 justify-center items-center">
                <Text>Order not found</Text>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white p-4 flex-row items-center shadow-sm">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    {/* @ts-ignore */}
                    <ArrowLeft size={24} color="#374151" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-800">Order #{order.id}</Text>
            </View>

            <View className="p-4">
                {/* Status Card */}
                <View className="bg-white p-4 rounded-xl shadow-sm mb-4">
                    <Text className="text-gray-500 text-sm mb-1">Status</Text>
                    <View className="flex-row justify-between items-center">
                        <Text className={`text-lg font-bold ${order.status === 'pending' ? 'text-blue-600' :
                            order.status === 'completed' ? 'text-green-600' : 'text-gray-800'
                            }`}>
                            {order.status.toUpperCase()}
                        </Text>
                        <Text className="text-gray-500 text-sm">
                            {new Date(order.created_at).toLocaleDateString()}
                        </Text>
                    </View>

                    {/* Delivery Date & Time Details */}
                    <View className="mt-4 pt-3 border-t border-gray-100">
                        <Text className="text-gray-500 text-xs mb-1">
                            {order.delivery_type === 'delivery' ? 'Delivery' : 'Pickup'} Information
                        </Text>
                        <View className="flex-row items-center mb-1">
                            <Text className="text-gray-800 font-semibold mr-2">Date:</Text>
                            <Text className="text-gray-600">
                                {order.delivery_date ? new Date(order.delivery_date).toDateString() : 'N/A'}
                            </Text>
                        </View>
                        <View className="flex-row items-center">
                            <Text className="text-gray-800 font-semibold mr-2">Time Slot:</Text>
                            <Text className="text-blue-600 font-medium">
                                {order.delivery_slot || 'Anytime'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Items */}
                <View className="bg-white p-4 rounded-xl shadow-sm mb-4">
                    <Text className="text-lg font-bold text-gray-800 mb-4">Items</Text>
                    {order.items && order.items.map((item: any) => (
                        <View key={item.id} className="flex-row justify-between items-center mb-4 last:mb-0">
                            <View className="flex-row items-center flex-1 mr-4">
                                <Image
                                    source={{ uri: getImageUrl(item.product?.image) }}
                                    className="w-16 h-16 rounded-lg bg-gray-200 mr-3"
                                />
                                <View className="flex-1">
                                    <Text className="font-semibold text-gray-800">
                                        {item.product?.name || 'Unknown Product'}
                                    </Text>
                                    {item.product_variant && (
                                        <Text className="text-gray-500 text-sm">{item.product_variant.label}</Text>
                                    )}
                                    <View className="flex-row items-center mt-1">
                                        <Text className="text-gray-500 text-xs mr-2">Qty: {item.quantity}</Text>
                                        <Text className="text-gray-500 text-xs">@ ₹{item.unit_price}</Text>
                                    </View>
                                </View>
                            </View>
                            <Text className="font-semibold text-gray-800">₹{item.subtotal}</Text>
                        </View>
                    ))}
                </View>

                {/* Totals */}
                <View className="bg-white p-4 rounded-xl shadow-sm mb-4">
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-gray-600">Subtotal</Text>
                        <Text className="text-gray-800 font-semibold">₹{order.total_amount}</Text>
                    </View>
                    {order.delivery_type === 'delivery' && (
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-gray-600">Delivery Fee</Text>
                            <Text className="text-gray-800 font-semibold">
                                ₹{Number(order.final_amount) - Number(order.total_amount)}
                            </Text>
                        </View>
                    )}
                    <View className="flex-row justify-between border-t border-gray-100 pt-2 mt-2">
                        <Text className="text-lg font-bold text-gray-800">Total</Text>
                        <Text className="text-lg font-bold text-orange-600">₹{order.final_amount}</Text>
                    </View>
                </View>

                {/* Delivery Address */}
                {order.delivery_address_detail && (
                    <View className="bg-white p-4 rounded-xl shadow-sm mb-4">
                        <Text className="text-lg font-bold text-gray-800 mb-2">Delivery Address</Text>
                        <View>
                            <Text className="text-gray-600 leading-6 mb-3">
                                {order.delivery_address_detail.line1}
                                {order.delivery_address_detail.line2 ? `, ${order.delivery_address_detail.line2}` : ''}
                                {'\n'}
                                {order.delivery_address_detail.city}, {order.delivery_address_detail.state} - {order.delivery_address_detail.pincode}
                            </Text>

                            <TouchableOpacity
                                className="flex-row items-center justify-center bg-green-50 p-3 rounded-lg border border-green-200"
                                onPress={() => {
                                    const address = order.delivery_address_detail;
                                    const query = encodeURIComponent(
                                        `${address.line1}, ${address.line2 || ''}, ${address.city}, ${address.state}, ${address.pincode}`
                                    );
                                    Linking.openURL(
                                        address.map_link || `https://www.google.com/maps/search/?api=1&query=${query}`
                                    );
                                }}
                            >
                                {/* @ts-ignore */}
                                <MapPin size={20} color="#16a34a" />
                                <Text className="text-green-700 font-semibold ml-2">View on Map</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>
        </ScrollView>
    );
}
