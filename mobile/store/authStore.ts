import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { api } from '../lib/api';
import { User, AuthResponse } from '../types/auth';

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
    setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    token: null,
    isLoading: true,

    login: async (email, password) => {
        set({ isLoading: true });
        try {
            const response = await api.post<AuthResponse>('/users/login/', { email, password });
            const { access, refresh } = response.data;

            await SecureStore.setItemAsync('token', access);
            await SecureStore.setItemAsync('refresh_token', refresh);

            api.defaults.headers.common['Authorization'] = `Bearer ${access}`;

            // Fetch user details separately since login endpoint only returns tokens
            const userResponse = await api.get<User>('/users/me/');
            const user = userResponse.data;

            set({ user, token: access });
        } catch (error) {
            console.error('Login failed', error);
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    register: async (data) => {
        set({ isLoading: true });
        try {
            console.log('Registering with:', data);
            await api.post('/users/register/', data);
            // Auto login after register? Or redirect to login.
            // For now, just let the component handle the redirect.
        } catch (error) {
            console.error('Registration failed', error);
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    logout: async () => {
        await SecureStore.deleteItemAsync('token');
        await SecureStore.deleteItemAsync('refresh_token');
        api.defaults.headers.common['Authorization'] = '';
        set({ user: null, token: null });
    },

    checkAuth: async () => {
        try {
            const token = await SecureStore.getItemAsync('token');
            if (token) {
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                const response = await api.get<User>('/users/me/');
                set({ user: response.data, token, isLoading: false });
            } else {
                set({ isLoading: false });
            }
        } catch (error) {
            set({ user: null, token: null, isLoading: false });
        }
    },

    setUser: (user: User) => {
        set({ user });
    },
}));
