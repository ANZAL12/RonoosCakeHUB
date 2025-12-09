'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function ProfilePage() {
    const { user, login } = useAuth(); // We might need to re-fetch user data after update
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Trigger file selection
    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    // Handle file upload
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast.error('Image size should be less than 5MB');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('profile_picture', file);

        try {
            // Update profile picture
            await apiClient.patch('/api/users/me/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast.success('Profile picture updated successfully');

            // Force a page refresh to show new image (simplest way to sync state for now)
            // Ideally we should update the AuthContext state
            window.location.reload();
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to update profile picture');
        } finally {
            setUploading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <p className="text-xl text-gray-600 mb-4">Please login to view your profile</p>
                <Link href="/login" className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                    Login
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header Background */}
                    <div className="h-32 bg-gradient-to-r from-orange-400 to-amber-500"></div>

                    <div className="px-8 pb-8">
                        {/* Profile Picture Section */}
                        <div className="relative -mt-16 mb-6 flex justify-center sm:justify-start">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
                                    {user.profile_picture ? (
                                        <img
                                            src={user.profile_picture}
                                            alt={user.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-orange-100 flex items-center justify-center text-4xl text-orange-600 font-bold">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}

                                    {/* Upload Overlay */}
                                    <div
                                        onClick={handleImageClick}
                                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                    >
                                        <span className="text-white text-sm font-medium">Change</span>
                                    </div>
                                </div>
                                {uploading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-full">
                                        <div className="w-6 h-6 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>
                        </div>

                        {/* User Details */}
                        <div className="text-center sm:text-left mb-8">
                            <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                            <p className="text-gray-500 font-medium">{user.role === 'baker' ? 'Baker 👨‍🍳' : 'Cake Lover 🍰'}</p>
                        </div>

                        <div className="border-t border-gray-100 pt-8">
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">Email Address</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
                                </div>
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">Phone Number</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{user.phone || 'Not provided'}</dd>
                                </div>
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">Member Since</dt>
                                    <dd className="mt-1 text-sm text-gray-900">December 2025</dd>
                                </div>
                            </dl>
                        </div>

                        <div className="mt-10 flex flex-col gap-4">
                            <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Link href="/orders" className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition cursor-pointer">
                                    <span className="text-2xl mr-3">📦</span>
                                    <div>
                                        <p className="font-semibold text-gray-900">My Orders</p>
                                        <p className="text-sm text-gray-600">Track and view history</p>
                                    </div>
                                </Link>
                                <Link href="/products" className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition cursor-pointer">
                                    <span className="text-2xl mr-3">🎂</span>
                                    <div>
                                        <p className="font-semibold text-gray-900">Browse Cakes</p>
                                        <p className="text-sm text-gray-600">Order something sweet</p>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
