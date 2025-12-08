import "../global.css";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";

export default function Layout() {
    const { user, isLoading, checkAuth } = useAuthStore();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        checkAuth();
    }, []);

    useEffect(() => {
        if (isLoading) return;

        const inBakerGroup = segments[0] === 'baker';

        if (user?.role === 'baker' && !inBakerGroup) {
            router.replace('/baker');
        } else if (user?.role === 'customer' && inBakerGroup) {
            router.replace('/(tabs)');
        } else if (!user && segments[0] !== 'login' && segments[0] !== 'register') {
            // Redirect to login if not authenticated and not already on login/register screen
            router.replace('/login');
        }
    }, [user, isLoading, segments]);

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="login" />
            <Stack.Screen name="register" />
            <Stack.Screen name="product/[id]" options={{ presentation: 'modal', headerShown: true, title: 'Product Details' }} />
            <Stack.Screen name="baker" />
        </Stack>
    );
}
