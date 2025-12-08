import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Alert, Modal, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { api } from '../../lib/api';
import { Plus, Trash2, Edit2, X } from 'lucide-react-native';

interface Option {
    id: number;
    name?: string;
    label?: string; // For Weight
    price: string | number;
}

export default function ManageOptionsScreen() {
    const { type } = useLocalSearchParams<{ type: string }>();
    const [options, setOptions] = useState<Option[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState<Option | null>(null);
    const [formData, setFormData] = useState({ name: '', price: '' });

    const getEndpoint = () => {
        switch (type) {
            case 'base': return '/catalog/cake-bases/';
            case 'flavour': return '/catalog/cake-flavours/';
            case 'shape': return '/catalog/cake-shapes/';
            case 'weight': return '/catalog/cake-weights/';
            default: return '';
        }
    };

    const getTitle = () => {
        switch (type) {
            case 'base': return 'Cake Bases';
            case 'flavour': return 'Flavours';
            case 'shape': return 'Shapes';
            case 'weight': return 'Weights';
            default: return 'Options';
        }
    };

    useEffect(() => {
        fetchOptions();
    }, [type]);

    const fetchOptions = async () => {
        try {
            const endpoint = getEndpoint();
            const response = await api.get(endpoint);
            setOptions(response.data);
        } catch (error) {
            console.error('Error fetching options:', error);
            Alert.alert('Error', 'Failed to fetch options');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const endpoint = getEndpoint();
            const payload = {
                [type === 'weight' ? 'label' : 'name']: formData.name,
                price: parseFloat(formData.price) || 0
            };

            if (editingItem) {
                await api.patch(`${endpoint}${editingItem.id}/`, payload);
            } else {
                await api.post(endpoint, payload);
            }

            fetchOptions();
            setModalVisible(false);
            setFormData({ name: '', price: '' });
            setEditingItem(null);
        } catch (error) {
            console.error('Error saving option:', error);
            Alert.alert('Error', 'Failed to save option');
        }
    };

    const handleDelete = (id: number) => {
        Alert.alert('Confirm Delete', 'Are you sure you want to delete this option?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        const endpoint = getEndpoint();
                        await api.delete(`${endpoint}${id}/`);
                        fetchOptions();
                    } catch (error) {
                        Alert.alert('Error', 'Failed to delete option');
                    }
                }
            }
        ]);
    };

    const openModal = (item?: Option) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                name: item.name || item.label || '',
                price: item.price.toString()
            });
        } else {
            setEditingItem(null);
            setFormData({ name: '', price: '' });
        }
        setModalVisible(true);
    };

    const renderItem = ({ item }: { item: Option }) => (
        <View className="bg-white p-4 rounded-lg mb-3 shadow-sm flex-row justify-between items-center">
            <View>
                <Text className="text-lg font-semibold text-gray-800">{item.name || item.label}</Text>
                <Text className="text-gray-500">Extra Price: ₹{item.price}</Text>
            </View>
            <View className="flex-row gap-3">
                <TouchableOpacity onPress={() => openModal(item)} className="p-2 bg-blue-50 rounded-full">
                    <Edit2 size={20} color="#2563eb" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)} className="p-2 bg-red-50 rounded-full">
                    <Trash2 size={20} color="#ef4444" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-gray-50 p-4">
            <View className="flex-row justify-between items-center mb-6">
                <Text className="text-2xl font-bold text-gray-800">{getTitle()}</Text>
                <TouchableOpacity
                    className="bg-orange-600 px-4 py-2 rounded-lg flex-row items-center"
                    onPress={() => openModal()}
                >
                    <Plus size={20} color="white" />
                    <Text className="text-white font-bold ml-2">Add New</Text>
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <ActivityIndicator size="large" color="#ea580c" />
            ) : (
                <FlatList
                    data={options}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            )}

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-2xl p-6">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold text-gray-800">
                                {editingItem ? 'Edit Option' : 'Add New Option'}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <X size={24} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        <Text className="text-gray-600 mb-2">{type === 'weight' ? 'Weight Label' : 'Name'}</Text>
                        <TextInput
                            className="border border-gray-300 rounded-lg p-3 mb-4 text-lg"
                            placeholder={type === 'weight' ? 'e.g., 1kg' : 'e.g., Chocolate'}
                            value={formData.name}
                            onChangeText={(text) => setFormData({ ...formData, name: text })}
                        />

                        <Text className="text-gray-600 mb-2">Extra Price (₹)</Text>
                        <TextInput
                            className="border border-gray-300 rounded-lg p-3 mb-6 text-lg"
                            placeholder="0.00"
                            keyboardType="numeric"
                            value={formData.price}
                            onChangeText={(text) => setFormData({ ...formData, price: text })}
                        />

                        <TouchableOpacity
                            className="bg-orange-600 p-4 rounded-xl items-center"
                            onPress={handleSave}
                        >
                            <Text className="text-white font-bold text-lg">Save Option</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
