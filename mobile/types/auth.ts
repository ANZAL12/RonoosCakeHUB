export interface User {
    id: number;
    email: string;
    username: string;
    name?: string;
    phone?: string;
    profile_picture?: string | null;
    is_custom_build_enabled?: boolean;
    role: 'customer' | 'baker' | 'admin';
}

export interface AuthResponse {
    access: string;
    refresh: string;
    user: User;
}
