import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { useCartStore, CartItem } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../lib/api';
import { useRouter } from 'expo-router';
import { Trash2, Plus, Minus } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Address {
    id: number;
    line1: string;
    line2: string;
    city: string;
    state: string;
    pincode: string;
    is_default: boolean;
}

export default function CartScreen() {
    const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();
    const { user } = useAuthStore();
    const router = useRouter();
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
    const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('delivery');
    const [deliveryDate, setDeliveryDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [deliverySlot, setDeliverySlot] = useState('');

    const timeSlots = [
        '10:00-11:00 AM',
        '11:00-12:00 PM',
        '12:00-01:00 PM',
        '02:00-03:00 PM',
        '03:00-04:00 PM',
        '04:00-05:00 PM',
    ];

    useEffect(() => {
        if (user) {
            fetchAddresses();
        }
    }, [user]);

    const fetchAddresses = async () => {
        try {
            const response = await api.get('/users/addresses/');
            setAddresses(response.data);
            // Auto-select default address
            const defaultAddr = response.data.find((addr: Address) => addr.is_default);
            if (defaultAddr) {
                setSelectedAddress(defaultAddr);
            }
        } catch (error) {
            console.error('Error fetching addresses:', error);
        }
    };

    const handleCheckout = async () => {
        if (!user) {
            Alert.alert('Login Required', 'Please login to place an order', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Login', onPress: () => router.push('/login') }
            ]);
            return;
        }

        if (items.length === 0) return;

        // Check if address is selected for delivery
        if (deliveryType === 'delivery' && !selectedAddress) {
            Alert.alert('Address Required', 'Please select a delivery address', [
                { text: 'Add Address', onPress: () => router.push('/address/add') },
                { text: 'Cancel', style: 'cancel' }
            ]);
            return;
        }

        if (!deliverySlot) {
            Alert.alert('Details Required', 'Please select a delivery time slot');
            return;
        }

        setIsCheckingOut(true);
        try {
            const total = getTotal();
            const orderData = {
                items: items.map(item => ({
                    product_id: item.id,
                    product_variant_id: item.variant_id,
                    quantity: item.quantity,
                    unit_price: parseFloat(item.price)
                })),
                delivery_type: deliveryType,
                delivery_address: deliveryType === 'delivery' ? selectedAddress?.id : null,
                delivery_date: deliveryDate.toISOString().split('T')[0],
                delivery_slot: deliverySlot,
                total_amount: total,
                discount_amount: 0,
                final_amount: total,
                payment_status: 'pending'
            };

            await api.post('/orders/', orderData);

            Alert.alert('Success', 'Order placed successfully!');
            clearCart();
            router.push('/(tabs)/orders');
        } catch (error) {
            console.error('Checkout failed:', error);
            Alert.alert('Error', 'Failed to place order. Please try again.');
        } finally {
            setIsCheckingOut(false);
        }
    };

    const renderItem = ({ item }: { item: CartItem }) => (
        <View className="flex-row bg-white p-4 mb-2 rounded-lg shadow-sm items-center">
            {item.images && item.images.length > 0 ? (
                <Image source={{ uri: item.images[0].image }} className="w-20 h-20 rounded-md" />
            ) : item.image ? (
                <Image source={{ uri: item.image }} className="w-20 h-20 rounded-md" />
            ) : (
                <View className="w-20 h-20 bg-gray-200 rounded-md items-center justify-center">
                    <Text className="text-gray-400 text-xs">No Image</Text>
                </View>
            )}

            <View className="flex-1 ml-4">
                <Text className="font-bold text-gray-800 text-lg">{item.name}</Text>
                {item.variant_label && (
                    <Text className="text-gray-500 text-sm">{item.variant_label}</Text>
                )}
                <Text className="text-blue-600 font-bold">₹{item.price}</Text>

                <View className="flex-row items-center mt-2">
                    <TouchableOpacity
                        className="p-1 bg-gray-100 rounded-full"
                        onPress={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                        {/* @ts-ignore */}
                        <Minus size={16} color="#4b5563" />
                    </TouchableOpacity>

                    <Text className="mx-4 font-bold text-lg">{item.quantity}</Text>

                    <TouchableOpacity
                        className="p-1 bg-gray-100 rounded-full"
                        onPress={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                        {/* @ts-ignore */}
                        <Plus size={16} color="#4b5563" />
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity
                className="p-2"
                onPress={() => removeItem(item.id)}
            >
                {/* @ts-ignore */}
                <Trash2 size={20} color="#ef4444" />
            </TouchableOpacity>
        </View>
    );

    if (items.length === 0) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <Text className="text-xl font-bold text-gray-400 mb-4">Your cart is empty</Text>
                <TouchableOpacity
                    className="bg-blue-600 px-6 py-3 rounded-lg"
                    onPress={() => router.push('/(tabs)')}
                >
                    <Text className="text-white font-bold">Start Shopping</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            <FlatList
                data={items}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ padding: 16, paddingBottom: 450 }}
            />

            <View className="absolute bottom-0 left-0 right-0 bg-white p-4 shadow-lg border-t border-gray-200">
                {/* Delivery Type Selection */}
                <View className="mb-3">
                    <Text className="text-sm font-semibold text-gray-700 mb-2">Order Type</Text>
                    <View className="flex-row gap-2">
                        <TouchableOpacity
                            className={`flex-1 p-3 rounded-lg border-2 ${deliveryType === 'delivery'
                                ? 'border-blue-600 bg-blue-50'
                                : 'border-gray-300 bg-white'
                                }`}
                            onPress={() => setDeliveryType('delivery')}
                        >
                            <Text className={`text-center font-semibold ${deliveryType === 'delivery' ? 'text-blue-600' : 'text-gray-700'
                                }`}>
                                🚚 Home Delivery
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className={`flex-1 p-3 rounded-lg border-2 ${deliveryType === 'pickup'
                                ? 'border-orange-600 bg-orange-50'
                                : 'border-gray-300 bg-white'
                                }`}
                            onPress={() => setDeliveryType('pickup')}
                        >
                            <Text className={`text-center font-semibold ${deliveryType === 'pickup' ? 'text-orange-600' : 'text-gray-700'
                                }`}>
                                🏪 Pickup from Shop
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Date & Time Selection */}
                <View className="mb-3">
                    <Text className="text-sm font-semibold text-gray-700 mb-2">
                        {deliveryType === 'delivery' ? 'Delivery' : 'Pickup'} Date & Time
                    </Text>

                    <TouchableOpacity
                        className="bg-gray-100 p-3 rounded-lg border border-gray-300 mb-2"
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Text className="text-gray-800">
                            📅 {deliveryDate.toDateString()}
                        </Text>
                    </TouchableOpacity>

                    {showDatePicker && (
                        <DateTimePicker
                            value={deliveryDate}
                            mode="date"
                            display="default"
                            minimumDate={new Date()}
                            onChange={(event: any, selectedDate?: Date) => {
                                setShowDatePicker(false);
                                if (selectedDate) {
                                    setDeliveryDate(selectedDate);
                                }
                            }}
                        />
                    )}

                    <FlatList
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        data={timeSlots}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                className={`mr-2 px-3 py-2 rounded-full border ${deliverySlot === item
                                        ? 'bg-blue-600 border-blue-600'
                                        : 'bg-white border-gray-300'
                                    }`}
                                onPress={() => setDeliverySlot(item)}
                            >
                                <Text className={`${deliverySlot === item ? 'text-white' : 'text-gray-700'
                                    } text-xs font-semibold`}>
                                    {item}
                                </Text>
                            </TouchableOpacity>
                        )}
                        className="mb-2"
                    />
                </View>

                {/* Address Selection - Only show for delivery */}
                {deliveryType === 'delivery' && (
                    selectedAddress ? (
                        <TouchableOpacity
                            className="bg-gray-100 p-3 rounded-lg mb-3"
                            onPress={() => router.push('/address')}
                        >
                            <Text className="text-xs text-gray-500 mb-1">Delivery Address</Text>
                            <Text className="font-semibold text-gray-800">{selectedAddress.line1}</Text>
                            {selectedAddress.line2 && (
                                <Text className="text-sm text-gray-600">{selectedAddress.line2}</Text>
                            )}
                            <Text className="text-sm text-gray-600">
                                {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            className="bg-blue-100 p-3 rounded-lg mb-3 border border-blue-300"
                            onPress={() => router.push('/address/add')}
                        >
                            <Text className="text-blue-600 font-semibold text-center">+ Add Delivery Address</Text>
                        </TouchableOpacity>
                    )
                )}

                <View className="flex-row justify-between mb-4">
                    <Text className="text-lg font-bold text-gray-600">Total:</Text>
                    <Text className="text-2xl font-bold text-blue-600">₹{getTotal().toFixed(2)}</Text>
                </View>

                <TouchableOpacity
                    className={`bg-blue-600 p-4 rounded-lg items-center ${isCheckingOut ? 'opacity-70' : ''}`}
                    onPress={handleCheckout}
                    disabled={isCheckingOut}
                >
                    {isCheckingOut ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold text-lg">Place Order</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}
