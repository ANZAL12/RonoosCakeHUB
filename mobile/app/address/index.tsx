import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { Plus, MapPin, Trash2 } from 'lucide-react-native';

interface Address {
    id: number;
    line1: string;
    line2: string;
    city: string;
    state: string;
    pincode: string;
    is_default: boolean;
}

export default function AddressListScreen() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchAddresses();
        }
    }, [user]);

    const fetchAddresses = async () => {
        try {
            const response = await api.get('/users/addresses/');
            setAddresses(response.data);
        } catch (error) {
            console.error('Error fetching addresses:', error);
            Alert.alert('Error', 'Failed to load addresses');
        } finally {
            setIsLoading(false);
        }
    };

    const deleteAddress = async (id: number) => {
        Alert.alert(
            'Delete Address',
            'Are you sure you want to delete this address?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/users/addresses/${id}/`);
                            fetchAddresses();
                            Alert.alert('Success', 'Address deleted');
                        } catch (error) {
                            console.error('Error deleting address:', error);
                            Alert.alert('Error', 'Failed to delete address');
                        }
                    }
                }
            ]
        );
    };

    const setDefaultAddress = async (id: number) => {
        try {
            await api.patch(`/users/addresses/${id}/`, { is_default: true });
            fetchAddresses();
        } catch (error) {
            console.error('Error setting default address:', error);
            Alert.alert('Error', 'Failed to set default address');
        }
    };

    const renderItem = ({ item }: { item: Address }) => (
        <View className="bg-white p-4 mb-3 rounded-lg shadow-sm">
            <View className="flex-row justify-between items-start mb-2">
                <View className="flex-row items-center flex-1">
                    {/* @ts-ignore */}
                    <MapPin size={20} color="#2563eb" />
                    <Text className="ml-2 font-bold text-gray-800 flex-1">
                        {item.line1}
                    </Text>
                </View>
                <TouchableOpacity onPress={() => deleteAddress(item.id)}>
                    {/* @ts-ignore */}
                    <Trash2 size={20} color="#ef4444" />
                </TouchableOpacity>
            </View>

            {item.line2 && (
                <Text className="text-gray-600 ml-7">{item.line2}</Text>
            )}
            <Text className="text-gray-600 ml-7">
                {item.city}, {item.state} - {item.pincode}
            </Text>

            {item.is_default ? (
                <View className="mt-2 ml-7">
                    <Text className="text-green-600 font-semibold text-sm">✓ Default Address</Text>
                </View>
            ) : (
                <TouchableOpacity
                    onPress={() => setDefaultAddress(item.id)}
                    className="mt-2 ml-7"
                >
                    <Text className="text-blue-600 font-semibold text-sm">Set as Default</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    if (!user) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <Text className="text-gray-500">Please login to manage addresses</Text>
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
        <View className="flex-1 bg-gray-50">
            <FlatList
                data={addresses}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                ListEmptyComponent={
                    <View className="items-center justify-center mt-10">
                        <Text className="text-gray-500 mb-4">No addresses saved</Text>
                    </View>
                }
            />

            <TouchableOpacity
                className="absolute bottom-6 right-6 bg-blue-600 w-14 h-14 rounded-full items-center justify-center shadow-lg"
                onPress={() => router.push('/address/add')}
            >
                {/* @ts-ignore */}
                <Plus size={28} color="white" />
            </TouchableOpacity>
        </View>
    );
}
