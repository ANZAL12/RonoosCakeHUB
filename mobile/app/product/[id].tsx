import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '../../lib/api';
import { useCartStore, Product, ProductVariant } from '../../store/cartStore';
import { ShoppingCart } from 'lucide-react-native';

export default function ProductDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [product, setProduct] = useState<Product | null>(null);
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const addItem = useCartStore(state => state.addItem);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const response = await api.get(`/catalog/products/${id}/`);
            const productData = response.data;
            setProduct(productData);
            // Auto-select first variant if available
            if (productData.variants && productData.variants.length > 0) {
                setSelectedVariant(productData.variants[0]);
            }
        } catch (error) {
            console.error('Error fetching product:', error);
            Alert.alert('Error', 'Failed to load product details');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddToCart = () => {
        if (product) {
            const itemToAdd = {
                ...product,
                price: selectedVariant ? selectedVariant.price : product.price,
                variant_id: selectedVariant?.id,
                variant_label: selectedVariant?.label,
            };
            addItem(itemToAdd);
            Alert.alert('Success', 'Added to cart', [
                { text: 'Continue Shopping', style: 'cancel' },
                { text: 'Go to Cart', onPress: () => router.push('/(tabs)/cart') }
            ]);
        }
    };

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    if (!product) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <Text className="text-gray-500">Product not found</Text>
            </View>
        );
    }

    const displayPrice = selectedVariant ? selectedVariant.price : product.price;

    return (
        <View className="flex-1 bg-white">
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                {product.images && product.images.length > 0 ? (
                    <Image source={{ uri: product.images[0].image }} className="w-full h-72" resizeMode="cover" />
                ) : product.image ? (
                    <Image source={{ uri: product.image }} className="w-full h-72" resizeMode="cover" />
                ) : (
                    <View className="w-full h-72 bg-gray-200 items-center justify-center">
                        <Text className="text-gray-400">No Image</Text>
                    </View>
                )}

                <View className="p-6">
                    <Text className="text-2xl font-bold text-gray-800 mb-2">{product.name}</Text>
                    <Text className="text-2xl font-bold text-blue-600 mb-4">₹{displayPrice}</Text>

                    {/* Variant Selection */}
                    {product.variants && product.variants.length > 0 && (
                        <View className="mb-6">
                            <Text className="text-lg font-bold text-gray-800 mb-3">Select Size</Text>
                            <View className="flex-row flex-wrap gap-2">
                                {product.variants.map((variant) => (
                                    <TouchableOpacity
                                        key={variant.id}
                                        onPress={() => setSelectedVariant(variant)}
                                        className={`px-4 py-3 rounded-lg border-2 ${selectedVariant?.id === variant.id
                                                ? 'border-blue-600 bg-blue-50'
                                                : 'border-gray-300 bg-white'
                                            }`}
                                    >
                                        <Text className={`font-semibold ${selectedVariant?.id === variant.id ? 'text-blue-600' : 'text-gray-700'
                                            }`}>
                                            {variant.label}
                                        </Text>
                                        <Text className="text-sm text-gray-600">₹{variant.price}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    <Text className="text-gray-600 text-base leading-6 mb-6">
                        {product.description || 'No description available.'}
                    </Text>
                </View>
            </ScrollView>

            <View className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
                <TouchableOpacity
                    className="bg-blue-600 p-4 rounded-lg flex-row items-center justify-center"
                    onPress={handleAddToCart}
                >
                    {/* @ts-ignore */}
                    <ShoppingCart color="white" size={24} className="mr-2" />
                    <Text className="text-white font-bold text-lg ml-2">Add to Cart</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
