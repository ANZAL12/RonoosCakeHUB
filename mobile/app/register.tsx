import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'lucide-react-native';

const registerSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    name: z.string().min(2, 'Name is required'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
    const router = useRouter();
    const { register: registerUser, isLoading } = useAuthStore();
    const { control, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });
    const [profileImage, setProfileImage] = useState<string | null>(null);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setProfileImage(result.assets[0].uri);
        }
    };

    const onSubmit = async (data: RegisterFormData) => {
        try {
            const formData = new FormData();
            formData.append('username', data.username);
            formData.append('name', data.name);
            formData.append('phone', data.phone);
            formData.append('email', data.email);
            formData.append('password', data.password);

            if (profileImage) {
                const filename = profileImage.split('/').pop();
                const match = /\.(\w+)$/.exec(filename || '');
                const type = match ? `image/${match[1]}` : `image`;

                // @ts-ignore
                formData.append('profile_picture', {
                    uri: profileImage,
                    name: filename,
                    type,
                });
            }

            await registerUser(formData as any); // Type assertion needed as store expects object
            Alert.alert('Success', 'Account created successfully! Please login.');
            router.replace('/login');
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Registration failed. Please try again.');
        }
    };

    return (
        <ScrollView className="flex-1 bg-white" contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
            <Text className="text-3xl font-bold text-center mb-8 text-gray-800">Create Account</Text>

            <View className="items-center mb-6">
                <TouchableOpacity onPress={pickImage} className="relative">
                    <View className="w-24 h-24 rounded-full bg-gray-200 items-center justify-center overflow-hidden border border-gray-300">
                        {profileImage ? (
                            <Image source={{ uri: profileImage }} className="w-full h-full" />
                        ) : (
                            <Camera size={32} color="#9ca3af" />
                        )}
                    </View>
                    <View className="absolute bottom-0 right-0 bg-blue-600 p-1.5 rounded-full border-2 border-white">
                        <Camera size={12} color="white" />
                    </View>
                </TouchableOpacity>
                <Text className="text-gray-500 text-xs mt-2">Add Profile Picture (Optional)</Text>
            </View>

            <View className="space-y-4">
                <View>
                    <Text className="text-gray-600 mb-1">Full Name</Text>
                    <Controller
                        control={control}
                        name="name"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                className="border border-gray-300 rounded-lg p-3 text-base"
                                placeholder="Enter your full name"
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                            />
                        )}
                    />
                    {errors.name && <Text className="text-red-500 text-sm mt-1">{errors.name.message}</Text>}
                </View>

                <View>
                    <Text className="text-gray-600 mb-1">Username</Text>
                    <Controller
                        control={control}
                        name="username"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                className="border border-gray-300 rounded-lg p-3 text-base"
                                placeholder="Choose a username"
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                autoCapitalize="none"
                            />
                        )}
                    />
                    {errors.username && <Text className="text-red-500 text-sm mt-1">{errors.username.message}</Text>}
                </View>

                <View>
                    <Text className="text-gray-600 mb-1">Email</Text>
                    <Controller
                        control={control}
                        name="email"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                className="border border-gray-300 rounded-lg p-3 text-base"
                                placeholder="Enter your email"
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        )}
                    />
                    {errors.email && <Text className="text-red-500 text-sm mt-1">{errors.email.message}</Text>}
                </View>

                <View>
                    <Text className="text-gray-600 mb-1">Phone Number</Text>
                    <Controller
                        control={control}
                        name="phone"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                className="border border-gray-300 rounded-lg p-3 text-base"
                                placeholder="Enter your phone number"
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                keyboardType="phone-pad"
                            />
                        )}
                    />
                    {errors.phone && <Text className="text-red-500 text-sm mt-1">{errors.phone.message}</Text>}
                </View>

                <View>
                    <Text className="text-gray-600 mb-1">Password</Text>
                    <Controller
                        control={control}
                        name="password"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                className="border border-gray-300 rounded-lg p-3 text-base"
                                placeholder="Create a password"
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                secureTextEntry
                            />
                        )}
                    />
                    {errors.password && <Text className="text-red-500 text-sm mt-1">{errors.password.message}</Text>}
                </View>

                <View>
                    <Text className="text-gray-600 mb-1">Confirm Password</Text>
                    <Controller
                        control={control}
                        name="confirmPassword"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                className="border border-gray-300 rounded-lg p-3 text-base"
                                placeholder="Confirm your password"
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                secureTextEntry
                            />
                        )}
                    />
                    {errors.confirmPassword && <Text className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</Text>}
                </View>

                <TouchableOpacity
                    className="bg-blue-600 p-4 rounded-lg mt-4"
                    onPress={handleSubmit(onSubmit)}
                    disabled={isLoading}
                >
                    <Text className="text-white text-center font-semibold text-lg">
                        {isLoading ? 'Creating Account...' : 'Sign Up'}
                    </Text>
                </TouchableOpacity>

                <View className="flex-row justify-center mt-4">
                    <Text className="text-gray-600">Already have an account? </Text>
                    <Link href="/login" asChild>
                        <TouchableOpacity>
                            <Text className="text-blue-600 font-semibold">Login</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </View>
        </ScrollView>
    );
}
