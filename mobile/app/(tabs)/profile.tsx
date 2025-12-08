import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'lucide-react-native';
import { api, BASE_URL } from '../../lib/api';

// Helper to get full image URL
const getImageUrl = (url: string | null | undefined) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${BASE_URL}${url}`;
};

export default function ProfileScreen() {
    const { user, logout, setUser } = useAuthStore(); // Added setUser to update store after upload
    const router = useRouter();
    const [uploading, setUploading] = useState(false);

    const handleLogout = async () => {
        await logout();
        router.replace('/login');
    };

    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            uploadImage(result.assets[0].uri);
        }
    };

    const uploadImage = async (uri: string) => {
        if (!user) return;
        setUploading(true);
        try {
            const formData = new FormData();
            const filename = uri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename || '');
            const type = match ? `image/${match[1]}` : `image`;

            // @ts-ignore
            formData.append('profile_picture', {
                uri,
                name: filename,
                type,
            });

            // Using /users/me/ for updating the current user
            const response = await api.patch('/users/me/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Update local user state
            setUser({ ...user, profile_picture: response.data.profile_picture });
            Alert.alert('Success', 'Profile picture updated');

        } catch (error) {
            console.error('Error uploading profile picture:', error);
            Alert.alert('Error', 'Failed to update profile picture');
        } finally {
            setUploading(false);
        }
    };

    if (!user) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <Text className="text-xl font-bold text-gray-400 mb-4">Not Logged In</Text>
                <TouchableOpacity
                    className="bg-blue-600 px-6 py-3 rounded-lg"
                    onPress={() => router.push('/login')}
                >
                    <Text className="text-white font-bold">Login</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50 p-4">
            <View className="bg-white rounded-lg shadow-sm p-6 mb-4 items-center">
                <TouchableOpacity onPress={handlePickImage} className="relative mb-4" disabled={uploading}>
                    <View className="w-24 h-24 rounded-full bg-gray-200 items-center justify-center overflow-hidden border border-gray-300">
                        {uploading ? (
                            <ActivityIndicator color="#000" />
                        ) : user.profile_picture ? (
                            <Image source={{ uri: getImageUrl(user.profile_picture) || undefined }} className="w-full h-full" />
                        ) : (
                            <Camera size={32} color="#9ca3af" />
                        )}
                    </View>
                    <View className="absolute bottom-0 right-0 bg-blue-600 p-1.5 rounded-full border-2 border-white">
                        <Camera size={12} color="white" />
                    </View>
                </TouchableOpacity>

                <Text className="text-xl font-bold text-gray-800 mb-1">{user.name}</Text>
                <Text className="text-gray-500 mb-4">{user.email}</Text>

                <View className="w-full">
                    <Text className="text-gray-600 mb-2">Phone: {user.phone || 'Not set'}</Text>
                    <Text className="text-gray-600">Role: {user.role}</Text>
                </View>
            </View>

            <TouchableOpacity
                className="bg-blue-600 p-4 rounded-lg mb-3"
                onPress={() => router.push('/address')}
            >
                <Text className="text-white font-bold text-center">Manage Addresses</Text>
            </TouchableOpacity>

            {user.role === 'baker' && (
                <TouchableOpacity
                    className="bg-orange-600 p-4 rounded-lg mb-3"
                    onPress={() => router.push('/baker')}
                >
                    <Text className="text-white font-bold text-center">Baker Dashboard</Text>
                </TouchableOpacity>
            )}

            <TouchableOpacity
                className="bg-red-600 p-4 rounded-lg"
                onPress={handleLogout}
            >
                <Text className="text-white font-bold text-center">Logout</Text>
            </TouchableOpacity>
        </View>
    );
}
