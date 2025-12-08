import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
    const router = useRouter();
    const { login, isLoading } = useAuthStore();
    const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            await login(data.email, data.password);
            // Get the user from the store state after login
            const user = useAuthStore.getState().user;

            if (user?.role === 'baker') {
                router.replace('/baker/dashboard');
            } else {
                router.replace('/');
            }
        } catch (error) {
            Alert.alert('Error', 'Login failed. Please check your credentials.');
        }
    };

    return (
        <View className="flex-1 justify-center px-6 bg-white">
            <Text className="text-3xl font-bold text-center mb-8 text-gray-800">Welcome Back</Text>

            <View className="space-y-4">
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
                    <Text className="text-gray-600 mb-1">Password</Text>
                    <Controller
                        control={control}
                        name="password"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                className="border border-gray-300 rounded-lg p-3 text-base"
                                placeholder="Enter your password"
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                secureTextEntry
                            />
                        )}
                    />
                    {errors.password && <Text className="text-red-500 text-sm mt-1">{errors.password.message}</Text>}
                </View>

                <TouchableOpacity
                    className="bg-blue-600 p-4 rounded-lg mt-4"
                    onPress={handleSubmit(onSubmit)}
                    disabled={isLoading}
                >
                    <Text className="text-white text-center font-semibold text-lg">
                        {isLoading ? 'Logging in...' : 'Login'}
                    </Text>
                </TouchableOpacity>

                <View className="flex-row justify-center mt-4">
                    <Text className="text-gray-600">Don't have an account? </Text>
                    <Link href="/register" asChild>
                        <TouchableOpacity>
                            <Text className="text-blue-600 font-semibold">Sign Up</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </View>
        </View>
    );
}
