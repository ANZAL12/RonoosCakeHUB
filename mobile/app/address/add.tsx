import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../../lib/api';
import * as Location from 'expo-location';
import { MapPin } from 'lucide-react-native';

export default function AddAddressScreen() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [formData, setFormData] = useState({
        line1: '',
        line2: '',
        city: '',
        state: '',
        pincode: '',
        is_default: false,
        map_link: '',
    });

    const handleUseCurrentLocation = async () => {
        setIsLocating(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission to access location was denied');
                setIsLocating(false);
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            let reverseGeocode = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            });

            if (reverseGeocode && reverseGeocode.length > 0) {
                const address = reverseGeocode[0];
                setFormData({
                    ...formData,
                    line1: `${address.name || ''} ${address.street || ''}`.trim(),
                    line2: address.district || address.subregion || '',
                    city: address.city || address.subregion || '',
                    state: address.region || '',
                    pincode: address.postalCode || '',
                    map_link: `https://www.google.com/maps/search/?api=1&query=${location.coords.latitude},${location.coords.longitude}`
                });
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Could not fetch location');
        } finally {
            setIsLocating(false);
        }
    };

    const handleSubmit = async () => {
        // Validation
        if (!formData.line1 || !formData.city || !formData.state || !formData.pincode) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        setIsLoading(true);
        try {
            await api.post('/users/addresses/', formData);
            Alert.alert('Success', 'Address added successfully', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error) {
            console.error('Error adding address:', error);
            Alert.alert('Error', 'Failed to add address');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScrollView className="flex-1 bg-gray-50 px-4 pt-4">
            <Text className="text-2xl font-bold text-gray-900 mb-6">Add New Address</Text>

            <TouchableOpacity
                className="flex-row items-center justify-center bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200"
                onPress={handleUseCurrentLocation}
                disabled={isLocating}
            >
                {isLocating ? (
                    <ActivityIndicator size="small" color="#2563eb" />
                ) : (
                    <MapPin size={20} color="#2563eb" />
                )}
                <Text className="text-blue-600 font-semibold ml-2">
                    {isLocating ? 'Detecting Location...' : 'Use Current Location'}
                </Text>
            </TouchableOpacity>

            <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
                <View className="mb-4">
                    <Text className="text-gray-700 font-semibold mb-2">Address Line 1 *</Text>
                    <TextInput
                        className="border border-gray-300 rounded-lg p-3"
                        placeholder="House/Flat No., Building Name"
                        value={formData.line1}
                        onChangeText={(text) => setFormData({ ...formData, line1: text })}
                    />
                </View>

                <View className="mb-4">
                    <Text className="text-gray-700 font-semibold mb-2">Address Line 2</Text>
                    <TextInput
                        className="border border-gray-300 rounded-lg p-3"
                        placeholder="Street, Area, Landmark (Optional)"
                        value={formData.line2}
                        onChangeText={(text) => setFormData({ ...formData, line2: text })}
                    />
                </View>

                <View className="mb-4">
                    <Text className="text-gray-700 font-semibold mb-2">City *</Text>
                    <TextInput
                        className="border border-gray-300 rounded-lg p-3"
                        placeholder="Enter city"
                        value={formData.city}
                        onChangeText={(text) => setFormData({ ...formData, city: text })}
                    />
                </View>

                <View className="flex-row gap-2 mb-4">
                    <View className="flex-1">
                        <Text className="text-gray-700 font-semibold mb-2">State *</Text>
                        <TextInput
                            className="border border-gray-300 rounded-lg p-3"
                            placeholder="State"
                            value={formData.state}
                            onChangeText={(text) => setFormData({ ...formData, state: text })}
                        />
                    </View>

                    <View className="flex-1">
                        <Text className="text-gray-700 font-semibold mb-2">Pincode *</Text>
                        <TextInput
                            className="border border-gray-300 rounded-lg p-3"
                            placeholder="Pincode"
                            value={formData.pincode}
                            onChangeText={(text) => setFormData({ ...formData, pincode: text })}
                            keyboardType="numeric"
                        />
                    </View>
                </View>

                <TouchableOpacity
                    className="flex-row items-center mb-4"
                    onPress={() => setFormData({ ...formData, is_default: !formData.is_default })}
                >
                    <View className={`w-6 h-6 rounded border-2 mr-3 items-center justify-center ${formData.is_default ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                        }`}>
                        {formData.is_default && <Text className="text-white font-bold">✓</Text>}
                    </View>
                    <Text className="text-gray-700">Set as default address</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                className={`bg-blue-600 p-4 rounded-lg mb-6 ${isLoading ? 'opacity-70' : ''}`}
                onPress={handleSubmit}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text className="text-white font-bold text-center text-lg">Save Address</Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
}
