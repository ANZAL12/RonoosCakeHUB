import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { api } from '../lib/api';

interface Product {
    id: number;
    name: string;
    description: string;
    price: string;
    image?: string;
    images?: { image: string }[];
    category: string;
}

const ProductItem = React.memo(({ item, onPress, isBaker }: { item: Product; onPress?: () => void, isBaker?: boolean }) => {
    const imageUri = item.images && item.images.length > 0
        ? item.images[0].image
        : item.image;

    return (
        <TouchableOpacity
            className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden"
            onPress={onPress}
            activeOpacity={isBaker ? 1 : 0.7} // Disable opacity effect for baker if not clickable
            disabled={!onPress}
        >
            {imageUri ? (
                <Image
                    source={{ uri: imageUri }}
                    className="w-full h-72"
                    resizeMode="cover"
                    fadeDuration={0}
                />
            ) : (
                <View className="w-full h-72 bg-gray-200 items-center justify-center">
                    <Text className="text-gray-400">No Image</Text>
                </View>
            )}
            <View className="p-4">
                <Text className="text-lg font-bold text-gray-800">{item.name}</Text>
                <Text className="text-gray-600 mt-1" numberOfLines={2}>{item.description}</Text>
                <Text className="text-blue-600 font-bold text-lg mt-2">₹{item.price}</Text>
                {/* Changed $ to ₹ based on other files */}
            </View>
        </TouchableOpacity>
    );
});

export default function ProductList({ isBaker = false }: { isBaker?: boolean }) {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            fetchProducts();
        }, [])
    );

    const fetchProducts = async () => {
        try {
            const response = await api.get('/catalog/products/');
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const renderItem = useCallback(({ item }: { item: Product }) => (
        <ProductItem
            item={item}
            isBaker={isBaker}
            onPress={isBaker ? undefined : () => router.push(`/product/${item.id}`)}
        />
    ), [router, isBaker]);

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            <FlatList
                data={products}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: 16, paddingBottom: 20, paddingHorizontal: 16 }}
                ListEmptyComponent={
                    <View className="flex-1 items-center justify-center pt-10">
                        <Text className="text-gray-500">No products found.</Text>
                    </View>
                }
            />
        </View>
    );
}
