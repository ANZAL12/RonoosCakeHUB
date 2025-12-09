import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Use 10.0.2.2 for Android Emulator, localhost for iOS Simulator
// For physical device, use your machine's LAN IP
const API_URL = Platform.select({
    android: 'https://ronoos-backend.onrender.com/api',
    ios: 'https://ronoos-backend.onrender.com/api',
    default: 'https://ronoos-backend.onrender.com/api',
});

export const BASE_URL = API_URL?.replace('/api', '') || 'https://ronoos-backend.onrender.com';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add interceptor to attach token
api.interceptors.request.use(async (config) => {
    try {
        const token = await SecureStore.getItemAsync('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (error) {
        console.error('Error attaching token:', error);
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});
