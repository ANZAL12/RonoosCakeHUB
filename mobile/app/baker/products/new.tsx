import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image, Modal, FlatList } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { api } from '../../../lib/api';
import { ArrowLeft, Upload, Image as ImageIcon, X, ChevronDown, Check } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

type Category = {
    id: number;
    name: string;
};

export default function NewProductScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [showCategoryModal, setShowCategoryModal] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
    });
    const [selectedCategoryName, setSelectedCategoryName] = useState('');
    const [image, setImage] = useState<string | null>(null);

    useFocusEffect(
        useCallback(() => {
            setFormData({
                name: '',
                description: '',
                price: '',
                category: '',
            });
            setSelectedCategoryName('');
            setImage(null);
            fetchCategories();
        }, [])
    );

    const fetchCategories = async () => {
        try {
            const response = await api.get('/catalog/categories/');
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            Alert.alert('Error', 'Failed to load categories');
        }
    };

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.price || !formData.category) {
            Alert.alert('Error', 'Name, Price and Category are required');
            return;
        }

        setLoading(true);
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('description', formData.description);
            data.append('price', formData.price);
            data.append('category', formData.category);
            data.append('is_active', 'true');

            if (image) {
                const filename = image.split('/').pop();
                const match = /\.(\w+)$/.exec(filename ?? '');
                const type = match ? `image/${match[1]}` : `image`;

                // @ts-ignore
                data.append('image', { uri: image, name: filename, type });
            }

            await api.post('/catalog/baker/products/', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            Alert.alert('Success', 'Product created successfully', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error) {
            console.error('Error creating product:', error);
            Alert.alert('Error', 'Failed to create product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView className="flex-1 bg-gray-50">
            <View className="bg-white p-4 flex-row items-center shadow-sm">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <ArrowLeft size={24} color="#374151" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-800">Add New Product</Text>
            </View>

            <View className="p-4">
                <View className="bg-white p-4 rounded-xl shadow-sm mb-4">
                    <Text className="text-gray-700 font-semibold mb-2">Product Name</Text>
                    <TextInput
                        className="border border-gray-200 rounded-lg p-3 mb-4 text-gray-800"
                        placeholder="e.g. Chocolate Cake"
                        value={formData.name}
                        onChangeText={(text) => setFormData({ ...formData, name: text })}
                    />

                    <Text className="text-gray-700 font-semibold mb-2">Category</Text>
                    <TouchableOpacity
                        className="border border-gray-200 rounded-lg p-3 mb-4 flex-row justify-between items-center"
                        onPress={() => setShowCategoryModal(true)}
                    >
                        <Text className={selectedCategoryName ? "text-gray-800" : "text-gray-400"}>
                            {selectedCategoryName || "Select Category"}
                        </Text>
                        <ChevronDown size={20} color="#9CA3AF" />
                    </TouchableOpacity>

                    <Text className="text-gray-700 font-semibold mb-2">Description</Text>
                    <TextInput
                        className="border border-gray-200 rounded-lg p-3 mb-4 text-gray-800 h-24"
                        placeholder="Product description..."
                        multiline
                        textAlignVertical="top"
                        value={formData.description}
                        onChangeText={(text) => setFormData({ ...formData, description: text })}
                    />

                    <Text className="text-gray-700 font-semibold mb-2">Price (₹)</Text>
                    <TextInput
                        className="border border-gray-200 rounded-lg p-3 mb-4 text-gray-800"
                        placeholder="0.00"
                        keyboardType="numeric"
                        value={formData.price}
                        onChangeText={(text) => setFormData({ ...formData, price: text })}
                    />

                    <Text className="text-gray-700 font-semibold mb-2">Product Image</Text>
                    <TouchableOpacity
                        onPress={pickImage}
                        className="border-2 border-dashed border-gray-300 rounded-lg h-48 justify-center items-center mb-6 overflow-hidden bg-gray-50"
                    >
                        {image ? (
                            <View className="w-full h-full relative">
                                <Image source={{ uri: image }} className="w-full h-full" resizeMode="cover" />
                                <View className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full">
                                    <TouchableOpacity onPress={(e) => {
                                        e.stopPropagation();
                                        setImage(null);
                                    }}>
                                        <X size={20} color="white" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            <View className="items-center">
                                <Upload size={32} color="#9CA3AF" className="mb-2" />
                                <Text className="text-gray-400 font-medium">Tap to upload image</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        className={`p-4 rounded-xl items-center ${loading ? 'bg-gray-400' : 'bg-orange-600'}`}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-bold text-lg">Create Product</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            {/* Category Selection Modal */}
            <Modal
                visible={showCategoryModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowCategoryModal(false)}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-3xl p-4 h-3/4">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-xl font-bold text-gray-800">Select Category</Text>
                            <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                                <X size={24} color="#374151" />
                            </TouchableOpacity>
                        </View>

                        {categories.length === 0 ? (
                            <View className="flex-1 justify-center items-center">
                                <Text className="text-gray-500">No categories found.</Text>
                            </View>
                        ) : (
                            <FlatList
                                data={categories}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        className="p-4 border-b border-gray-100 flex-row justify-between items-center"
                                        onPress={() => {
                                            setFormData({ ...formData, category: String(item.id) });
                                            setSelectedCategoryName(item.name);
                                            setShowCategoryModal(false);
                                        }}
                                    >
                                        <Text className={`text-lg ${formData.category === String(item.id) ? 'text-orange-600 font-bold' : 'text-gray-700'}`}>
                                            {item.name}
                                        </Text>
                                        {formData.category === String(item.id) && (
                                            <Check size={20} color="#ea580c" />
                                        )}
                                    </TouchableOpacity>
                                )}
                            />
                        )}
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}
