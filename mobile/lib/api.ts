import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Use 10.0.2.2 for Android Emulator, localhost for iOS Simulator
// For physical device, use your machine's LAN IP
const API_URL = Platform.select({
    android: 'http://172.20.232.177:8000/api', // Use LAN IP for physical device
    ios: 'http://172.20.232.177:8000/api', // Use LAN IP for physical device
    default: 'http://172.20.232.177:8000/api',
});

export const BASE_URL = API_URL?.replace('/api', '') || 'http://172.20.232.177:8000';

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
