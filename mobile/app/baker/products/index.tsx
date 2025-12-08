import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { api } from '../../../lib/api';
import { Plus } from 'lucide-react-native';

export default function BakerProductsList() {
    const router = useRouter();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchProducts = useCallback(async () => {
        try {
            const response = await api.get('/catalog/baker/products/');
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchProducts();
        }, [fetchProducts])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchProducts();
    }, [fetchProducts]);

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            className="bg-white p-3 rounded-xl mb-3 shadow-sm flex-row items-center mx-4"
            onPress={() => router.push(`/baker/products/${item.id}`)}
        >
            <Image
                source={{ uri: item.image || 'https://via.placeholder.com/100' }}
                className="w-16 h-16 rounded-lg bg-gray-200"
            />
            <View className="flex-1 ml-3">
                <Text className="font-bold text-gray-800 text-lg">{item.name}</Text>
                <Text className="text-gray-500 text-sm" numberOfLines={1}>{item.description}</Text>
                <View className="flex-row justify-between items-center mt-1">
                    <Text className="text-orange-600 font-bold">₹{item.price}</Text>
                    <View className={`px-2 py-0.5 rounded-full ${item.is_active ? 'bg-green-100' : 'bg-red-100'}`}>
                        <Text className={`text-xs ${item.is_active ? 'text-green-700' : 'text-red-700'}`}>
                            {item.is_active ? 'Active' : 'Inactive'}
                        </Text>
                    </View>
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
            <FlatList
                data={products}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ paddingVertical: 16, flexGrow: 1 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#ea580c']}
                        tintColor="#ea580c"
                        progressBackgroundColor="#ffffff"
                    />
                }
                ListEmptyComponent={
                    <View className="flex-1 justify-center items-center h-[500px]">
                        <Text className="text-gray-500 text-lg">No products found</Text>
                        <Text className="text-gray-400 text-sm mt-2">Pull down to refresh</Text>
                    </View>
                }
            />

            <TouchableOpacity
                className="absolute bottom-6 right-6 bg-orange-600 w-14 h-14 rounded-full justify-center items-center shadow-lg"
                onPress={() => router.push('/baker/products/new')}
            >
                <Plus size={24} color="white" />
            </TouchableOpacity>
        </View>
    );
}
