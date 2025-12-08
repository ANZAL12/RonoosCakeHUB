import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { User, MapPin, Phone, Mail, LogOut, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen() {
    const router = useRouter();
    const logout = useAuthStore((state) => state.logout);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const response = await api.get('/users/me/');
            setUser(response.data);
        } catch (error) {
            console.error('Error fetching profile:', error);
            Alert.alert('Error', 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled) {
                updateProfileImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const updateProfileImage = async (uri: string) => {
        setUploading(true);
        try {
            const formData = new FormData();
            const filename = uri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename ?? '');
            const type = match ? `image/${match[1]}` : `image`;

            // @ts-ignore
            formData.append('profile_picture', { uri, name: filename, type });

            const response = await api.patch('/users/me/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setUser(response.data);
            Alert.alert('Success', 'Profile picture updated successfully');
        } catch (error) {
            console.error('Error updating profile picture:', error);
            Alert.alert('Error', 'Failed to update profile picture');
        } finally {
            setUploading(false);
        }
    };

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: () => {
                    logout();
                    router.replace('/login');
                }
            }
        ]);
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50">
                <ActivityIndicator size="large" color="#ea580c" />
            </View>
        );
    }

    if (!user) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50">
                <Text>User not found</Text>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-gray-50">
            {/* Header / Cover */}
            <View className="bg-orange-600 h-32 w-full absolute top-0" />

            <View className="px-4 pt-16 pb-6">
                {/* Profile Card */}
                <View className="bg-white rounded-2xl shadow-sm p-6 items-center">
                    <View className="relative">
                        <TouchableOpacity onPress={pickImage} disabled={uploading}>
                            <Image
                                source={{ uri: user.profile_picture || 'https://via.placeholder.com/150' }}
                                className="w-28 h-28 rounded-full border-4 border-white bg-gray-200"
                            />
                            {uploading && (
                                <View className="absolute inset-0 justify-center items-center bg-black/30 rounded-full">
                                    <ActivityIndicator color="white" />
                                </View>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={pickImage}
                            disabled={uploading}
                            className="absolute bottom-0 right-0 bg-orange-600 p-2 rounded-full border-2 border-white shadow-sm"
                        >
                            <Camera size={16} color="white" />
                        </TouchableOpacity>
                    </View>

                    <Text className="text-2xl font-bold text-gray-800 mt-4">{user.name}</Text>
                    <Text className="text-gray-500 font-medium capitalize">{user.role}</Text>

                    <View className="w-full mt-6 space-y-4">
                        <View className="flex-row items-center p-3 bg-gray-50 rounded-xl">
                            <Mail size={20} color="#6b7280" className="mr-5" />
                            <View className="ml-2">
                                <Text className="text-xs text-gray-500">Email</Text>
                                <Text className="text-gray-800 font-semibold">{user.email}</Text>
                            </View>
                        </View>

                        <View className="flex-row items-center p-3 bg-gray-50 rounded-xl">
                            <Phone size={20} color="#6b7280" className="mr-5" />
                            <View className="ml-2">
                                <Text className="text-xs text-gray-500">Phone</Text>
                                <Text className="text-gray-800 font-semibold">{user.phone || 'Not set'}</Text>
                            </View>
                        </View>

                        <View className="flex-row items-center p-3 bg-gray-50 rounded-xl">
                            <MapPin size={20} color="#6b7280" className="mr-5" />
                            <View className="ml-2">
                                <Text className="text-xs text-gray-500">Location</Text>
                                <Text className="text-gray-800 font-semibold">{user.place || 'Not set'}</Text>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity
                        className="w-full bg-red-50 py-4 rounded-xl mt-8 flex-row justify-center items-center"
                        onPress={handleLogout}
                    >
                        <LogOut size={20} color="#ef4444" className="mr-2" />
                        <Text className="text-red-500 font-bold text-lg">Logout</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}
