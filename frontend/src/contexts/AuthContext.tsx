'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api';

interface User {
    id: number;
    email: string;
    name: string;
    role: string;
    profile_picture?: string | null;
    phone?: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<User>;
    register: (email: string, password: string, name: string, phone: string, username: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check if user is logged in on mount
        const token = localStorage.getItem('access_token');
        if (token) {
            // Fetch user data
            apiClient.get('/api/users/me/')
                .then(res => setUser(res.data))
                .catch(() => {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                })
                .finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, []);

    const login = async (email: string, password: string) => {
        const response = await apiClient.post('/api/users/login/', { email, password });
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);

        // Fetch user data
        const userResponse = await apiClient.get('/api/users/me/');
        setUser(userResponse.data);
        return userResponse.data; // Return user data for immediate use
    };

    const register = async (email: string, password: string, name: string, phone: string, username: string) => {
        await apiClient.post('/api/users/register/', { email, password, name, phone, username });
        await login(email, password);
    };

    const logout = () => {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
            apiClient.post('/api/users/logout/', { refresh: refreshToken }).catch(() => { });
        }
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
        router.push('/login'); // Redirect to login page
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
