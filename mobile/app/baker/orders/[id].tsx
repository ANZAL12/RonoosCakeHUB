import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Share, Linking, Image, Modal, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api, BASE_URL } from '../../../lib/api';
import { ArrowLeft, Download, MapPin, X, Check } from 'lucide-react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';


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
    const [updating, setUpdating] = useState(false);
    const [generatingPdf, setGeneratingPdf] = useState(false);

    // Payment Status Modal State
    const [paymentModalVisible, setPaymentModalVisible] = useState(false);
    const [updatingPayment, setUpdatingPayment] = useState(false);

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

    const updateStatus = async (newStatus: string) => {
        setUpdating(true);
        try {
            await api.patch(`/orders/${id}/status/`, { status: newStatus });
            setOrder({ ...order, status: newStatus });
            Alert.alert('Success', `Order status updated to ${newStatus}`);
        } catch (error) {
            console.error('Error updating status:', error);
            Alert.alert('Error', 'Failed to update order status');
        } finally {
            setUpdating(false);
        }
    };

    const updatePaymentStatus = async (newStatus: string) => {
        setUpdatingPayment(true);
        try {
            await api.patch(`/orders/${id}/payment-status/`, { payment_status: newStatus });
            setOrder({ ...order, payment_status: newStatus });
            setPaymentModalVisible(false);
            Alert.alert('Success', `Payment status updated to ${newStatus}`);
        } catch (error) {
            console.error('Error updating payment status:', error);
            Alert.alert('Error', 'Failed to update payment status');
        } finally {
            setUpdatingPayment(false);
        }
    };

    const downloadPDF = async () => {
        if (!order) return;
        setGeneratingPdf(true);

        try {
            const html = `
                <html>
                <head>
                    <style>
                        body { font-family: 'Helvetica', sans-serif; padding: 20px; }
                        h1 { color: #ea580c; text-align: center; }
                        .header { margin-bottom: 20px; border-bottom: 2px solid #ea580c; padding-bottom: 10px; }
                        .section-title { font-size: 16px; font-weight: bold; margin-top: 20px; margin-bottom: 5px; color: #374151; }
                        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f3f4f6; font-weight: bold; }
                        .total-row { font-weight: bold; background-color: #fff7ed; }
                        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
                        .info-item { margin-bottom: 5px; }
                        .label { font-size: 12px; color: #6b7280; }
                        .value { font-size: 14px; color: #1f2937; font-weight: 500; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Ronoos BakeHub - Order #${order.id}</h1>
                        <p style="text-align: center; color: #6b7280;">${new Date(order.created_at).toLocaleString()}</p>
                    </div>

                    <div class="section-title">Customer Details</div>
                    <table>
                        <tr>
                            <th>Name</th>
                            <td>${order.user?.name || 'Unknown'}</td>
                        </tr>
                        <tr>
                            <th>Phone</th>
                            <td>${order.user?.phone || 'Not provided'}</td>
                        </tr>
                        <tr>
                            <th>Email</th>
                            <td>${order.user?.email || 'Not provided'}</td>
                        </tr>
                         <tr>
                            <th>Location</th>
                            <td>${order.user?.place || 'Not provided'}</td>
                        </tr>
                    </table>

                    <div class="section-title">Order Items</div>
                    <table>
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Quantity</th>
                                <th>Price</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.items.map((item: any) => `
                                <tr>
                                    <td>
                                        ${item.product_variant ? item.product_variant?.product?.name : item.product?.name}
                                        ${item.product_variant ? `<br><small>${item.product_variant.label}</small>` : ''}
                                    </td>
                                    <td>${item.quantity}</td>
                                    <td>₹${item.unit_price || 0}</td>
                                    <td>₹${item.subtotal}</td>
                                </tr>
                            `).join('')}
                            <tr class="total-row">
                                <td colspan="3" style="text-align: right;">Total Amount</td>
                                <td>₹${order.final_amount}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div class="section-title">Order Status</div>
                     <table>
                        <tr>
                            <th>Current Status</th>
                            <td style="text-transform: uppercase;">${order.status}</td>
                        </tr>
                        <tr>
                            <th>Payment Status</th>
                            <td style="text-transform: uppercase;">${order.payment_status}</td>
                        </tr>
                    </table>
                </body>
                </html>
            `;

            const { uri } = await Print.printToFileAsync({ html });
            console.log('File has been saved to:', uri);
            await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
        } catch (error) {
            console.error('Error generating PDF:', error);
            Alert.alert('Error', 'Failed to generate PDF');
        } finally {
            setGeneratingPdf(false);
        }
    };

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

    const nextStatusMap: Record<string, string> = {
        'pending': 'confirmed',
        'confirmed': 'in_kitchen',
        'in_kitchen': 'ready',
        'ready': 'out_for_delivery',
        'out_for_delivery': 'completed',
    };

    const nextStatus = nextStatusMap[order.status];
    const paymentStatuses = ['pending', 'paid', 'failed', 'refunded'];

    return (
        <View className="flex-1 bg-gray-50">
            <ScrollView className="flex-1">
                {/* Header */}
                <View className="bg-white p-4 flex-row items-center justify-between shadow-sm">
                    <View className="flex-row items-center">
                        <TouchableOpacity onPress={() => router.back()} className="mr-4">
                            <ArrowLeft size={24} color="#374151" />
                        </TouchableOpacity>
                        <Text className="text-xl font-bold text-gray-800">Order #{order.id}</Text>
                    </View>
                    <TouchableOpacity onPress={downloadPDF} disabled={generatingPdf}>
                        {generatingPdf ? (
                            <ActivityIndicator color="#ea580c" size="small" />
                        ) : (
                            <Download size={24} color="#ea580c" />
                        )}
                    </TouchableOpacity>
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

                            <View className="flex-row gap-2">
                                {order.status === 'pending' && (
                                    <TouchableOpacity
                                        className={`px-4 py-2 rounded-lg bg-red-600 ${updating ? 'opacity-50' : ''}`}
                                        onPress={() => updateStatus('cancelled')}
                                        disabled={updating}
                                    >
                                        <Text className="text-white font-semibold">Reject</Text>
                                    </TouchableOpacity>
                                )}

                                {nextStatus && (
                                    <TouchableOpacity
                                        className={`px-4 py-2 rounded-lg ${updating ? 'bg-gray-300' : 'bg-orange-600'}`}
                                        onPress={() => updateStatus(nextStatus)}
                                        disabled={updating}
                                    >
                                        <Text className="text-white font-semibold">
                                            Mark as {nextStatus.replace('_', ' ').toUpperCase()}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        {/* Payment Status */}
                        <View className="mt-4 pt-3 border-t border-gray-100">
                            <Text className="text-gray-500 text-sm mb-1">Payment Status</Text>
                            <View className="flex-row justify-between items-center">
                                <Text className={`text-lg font-bold ${order.payment_status === 'paid' ? 'text-green-600' :
                                        order.payment_status === 'failed' ? 'text-red-600' :
                                            order.payment_status === 'refunded' ? 'text-orange-600' : 'text-gray-800'
                                    }`}>
                                    {order.payment_status.toUpperCase()}
                                </Text>
                                <TouchableOpacity
                                    onPress={() => setPaymentModalVisible(true)}
                                    className="px-3 py-1 bg-gray-100 rounded-md border border-gray-200"
                                >
                                    <Text className="text-xs font-medium text-gray-700">Update</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Delivery Date & Time Details */}
                        <View className="mt-4 pt-3 border-t border-gray-100">
                            <Text className="text-gray-500 text-xs mb-1">
                                {order.delivery_type === 'delivery' ? 'Delivery' : 'Pickup'} Schedule
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
                                        <Text className="text-gray-500 text-xs">Qty: {item.quantity}</Text>
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
                                        if (address.map_link) {
                                            Linking.openURL(address.map_link);
                                        } else {
                                            const query = encodeURIComponent(
                                                `${address.line1}, ${address.line2 || ''}, ${address.city}, ${address.state}, ${address.pincode}`
                                            );
                                            Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
                                        }
                                    }}
                                >
                                    <MapPin size={20} color="#16a34a" />
                                    <Text className="text-green-700 font-semibold ml-2">View on Map</Text>
                                </TouchableOpacity>

                                {order.delivery_address_detail.map_link && (
                                    <Text className="text-gray-400 text-xs mt-2 text-center">Using precise location shared by customer</Text>
                                )}
                            </View>
                        </View>
                    )}

                    {/* Customer Info */}
                    <View className="bg-white p-4 rounded-xl shadow-sm mb-4">
                        <Text className="text-lg font-bold text-gray-800 mb-2">Customer Details</Text>

                        <View className="mb-2">
                            <Text className="text-xs text-gray-500">Name</Text>
                            <Text className="text-base font-semibold text-gray-800">
                                {order.user?.name || 'Unknown'}
                            </Text>
                        </View>

                        <View className="mb-2">
                            <Text className="text-xs text-gray-500">Phone</Text>
                            <Text className="text-base font-semibold text-gray-800">
                                {order.user?.phone || 'Not provided'}
                            </Text>
                        </View>

                        <View className="mb-2">
                            <Text className="text-xs text-gray-500">Email</Text>
                            <Text className="text-base font-semibold text-gray-800">
                                {order.user?.email || 'Not provided'}
                            </Text>
                        </View>

                        <View>
                            <Text className="text-xs text-gray-500">Location</Text>
                            <Text className="text-base font-semibold text-gray-800">
                                {order.user?.place || 'Not provided'}
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Payment Status Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={paymentModalVisible}
                onRequestClose={() => setPaymentModalVisible(false)}
            >
                <Pressable
                    className="flex-1 bg-black/50 justify-center items-center p-4"
                    onPress={() => setPaymentModalVisible(false)}
                >
                    <Pressable
                        className="bg-white w-full max-w-sm rounded-2xl p-4 shadow-xl"
                        onPress={(e) => e.stopPropagation()}
                    >
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-xl font-bold text-gray-800">Update Payment Status</Text>
                            <TouchableOpacity onPress={() => setPaymentModalVisible(false)}>
                                <X size={24} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        <View className="gap-3">
                            {paymentStatuses.map((status) => (
                                <TouchableOpacity
                                    key={status}
                                    className={`flex-row items-center justify-between p-4 rounded-xl border ${order.payment_status === status
                                            ? 'bg-orange-50 border-orange-200'
                                            : 'bg-white border-gray-100'
                                        }`}
                                    onPress={() => updatePaymentStatus(status)}
                                    disabled={updatingPayment}
                                >
                                    <Text className={`font-semibold capitalize ${order.payment_status === status ? 'text-orange-700' : 'text-gray-700'
                                        }`}>
                                        {status}
                                    </Text>
                                    {order.payment_status === status && (
                                        <Check size={20} color="#c2410c" />
                                    )}
                                    {updatingPayment && order.payment_status !== status && (
                                        <View className="opacity-0">
                                            <Check size={20} />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>

                        {updatingPayment && (
                            <View className="absolute inset-0 bg-white/50 justify-center items-center rounded-2xl">
                                <ActivityIndicator size="large" color="#ea580c" />
                            </View>
                        )}
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
}
