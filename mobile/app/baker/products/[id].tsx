import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image, RefreshControl } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '../../../lib/api';
import { ArrowLeft, Trash2, Save, Upload, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

export default function ProductDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        image: '',
        is_active: true,
        category: null
    });

    useEffect(() => {
        if (id) {
            fetchProduct();
        }
    }, [id]);

    const fetchProduct = useCallback(async () => {
        try {
            const response = await api.get(`/catalog/baker/products/${id}/`);
            const product = response.data;
            setFormData({
                name: product.name,
                description: product.description || '',
                price: product.price.toString(),
                image: product.image || '',
                is_active: product.is_active,
                category: product.category
            });
        } catch (error) {
            console.error('Error fetching product:', error);
            Alert.alert('Error', 'Failed to load product details');
            router.back();
        } finally {
            setLoading(false);
        }
    }, [id, router]);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            setFormData({ ...formData, image: result.assets[0].uri });
        }
    };

    const handleUpdate = async () => {
        if (!formData.name || !formData.price) {
            Alert.alert('Error', 'Name and Price are required');
            return;
        }

        setSaving(true);
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('description', formData.description);
            data.append('price', formData.price);
            data.append('is_active', String(formData.is_active));
            if (formData.category) {
                data.append('category', String(formData.category));
            }

            // check if it is a new image (local URI) or existing URL
            if (formData.image && !formData.image.startsWith('http')) {
                const filename = formData.image.split('/').pop();
                const match = /\.(\w+)$/.exec(filename ?? '');
                const type = match ? `image/${match[1]}` : `image`;

                // @ts-ignore
                data.append('image', { uri: formData.image, name: filename, type });
            }

            await api.patch(`/catalog/baker/products/${id}/`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            Alert.alert('Success', 'Product updated successfully');
        } catch (error) {
            console.error('Error updating product:', error);
            Alert.alert('Error', 'Failed to update product');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Product',
            'Are you sure you want to delete this product? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setDeleting(true);
                        try {
                            await api.delete(`/catalog/baker/products/${id}/`);
                            Alert.alert('Success', 'Product deleted successfully', [
                                { text: 'OK', onPress: () => router.back() }
                            ]);
                        } catch (error) {
                            console.error('Error deleting product:', error);
                            Alert.alert('Error', 'Failed to delete product');
                            setDeleting(false);
                        }
                    }
                }
            ]
        );
    };

    const toggleStatus = () => {
        setFormData({ ...formData, is_active: !formData.is_active });
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#ea580c" />
            </View>
        );
    }

    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchProduct();
        setRefreshing(false);
    }, [fetchProduct]);

    return (
        <ScrollView
            className="flex-1 bg-gray-50"
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#ea580c']} tintColor="#ea580c" />
            }
        >
            {/* Header */}
            <View className="bg-white p-4 flex-row items-center justify-between shadow-sm">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <ArrowLeft size={24} color="#374151" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-800 w-48" numberOfLines={1}>
                        Edit Product
                    </Text>
                </View>
                <TouchableOpacity onPress={handleDelete} disabled={deleting}>
                    {deleting ? (
                        <ActivityIndicator size="small" color="#ef4444" />
                    ) : (
                        <Trash2 size={24} color="#ef4444" />
                    )}
                </TouchableOpacity>
            </View>

            <View className="p-4">
                <View className="bg-white p-4 rounded-xl shadow-sm mb-4">

                    {/* Status Toggle */}
                    <View className="flex-row justify-between items-center mb-6 bg-gray-50 p-3 rounded-lg">
                        <Text className="text-gray-700 font-semibold">Status</Text>
                        <TouchableOpacity
                            onPress={toggleStatus}
                            className={`px-4 py-2 rounded-lg ${formData.is_active ? 'bg-green-100' : 'bg-red-100'}`}
                        >
                            <Text className={`font-bold ${formData.is_active ? 'text-green-700' : 'text-red-700'}`}>
                                {formData.is_active ? 'Active' : 'Inactive'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <Text className="text-gray-700 font-semibold mb-2">Product Name</Text>
                    <TextInput
                        className="border border-gray-200 rounded-lg p-3 mb-4 text-gray-800"
                        value={formData.name}
                        onChangeText={(text) => setFormData({ ...formData, name: text })}
                    />

                    <Text className="text-gray-700 font-semibold mb-2">Description</Text>
                    <TextInput
                        className="border border-gray-200 rounded-lg p-3 mb-4 text-gray-800 h-24"
                        multiline
                        textAlignVertical="top"
                        value={formData.description}
                        onChangeText={(text) => setFormData({ ...formData, description: text })}
                    />

                    <Text className="text-gray-700 font-semibold mb-2">Price (₹)</Text>
                    <TextInput
                        className="border border-gray-200 rounded-lg p-3 mb-4 text-gray-800"
                        keyboardType="numeric"
                        value={formData.price}
                        onChangeText={(text) => setFormData({ ...formData, price: text })}
                    />

                    <Text className="text-gray-700 font-semibold mb-2">Product Image</Text>
                    <TouchableOpacity
                        onPress={pickImage}
                        className="border-2 border-dashed border-gray-300 rounded-lg h-48 justify-center items-center mb-6 overflow-hidden bg-gray-50"
                    >
                        {formData.image ? (
                            <View className="w-full h-full relative">
                                <Image source={{ uri: formData.image }} className="w-full h-full" resizeMode="cover" />
                                <View className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full">
                                    <TouchableOpacity onPress={(e) => {
                                        e.stopPropagation();
                                        setFormData({ ...formData, image: '' });
                                    }}>
                                        <X size={20} color="white" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            <View className="items-center">
                                <Upload size={32} color="#9CA3AF" className="mb-2" />
                                <Text className="text-gray-400 font-medium">Tap to change image</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        className={`p-4 rounded-xl flex-row justify-center items-center ${saving ? 'bg-gray-400' : 'bg-orange-600'}`}
                        onPress={handleUpdate}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <Save size={20} color="white" className="mr-2" />
                                <Text className="text-white font-bold text-lg ml-2">Update Product</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}
