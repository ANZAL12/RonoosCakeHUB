'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api';
import { useEffect } from 'react';

export default function BakerDashboard() {
    const { user, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (user && user.role !== 'baker') {
            router.push('/');
        }
    }, [user, router]);

    // Fetch orders
    const { data: orders } = useQuery({
        queryKey: ['baker-orders'],
        queryFn: async () => {
            const response = await apiClient.get('/api/orders/');
            return response.data;
        },
        enabled: !!user && user.role === 'baker',
    });

    const { data: products } = useQuery({
        queryKey: ['baker-products'],
        queryFn: async () => {
            const response = await apiClient.get('/api/catalog/baker/products/');
            return response.data;
        },
        enabled: !!user && user.role === 'baker',
    });

    // Ensure orders is always an array
    const ordersArray = Array.isArray(orders) ? orders : [];

    // Stats
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = ordersArray.filter((o: any) => o.created_at?.startsWith(today));
    const pendingOrders = ordersArray.filter((o: any) => o.status === 'pending');
    const activeProducts = products?.filter((p: any) => p.is_active)?.length || 0;

    if (user && user.role !== 'baker') {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-100">


            <div className="max-w-7xl mx-auto px-4 py-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Overview</h2>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Orders Today</p>
                                <p className="text-3xl font-bold text-orange-600">{todayOrders.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl">📦</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Pending Orders</p>
                                <p className="text-3xl font-bold text-blue-600">{pendingOrders.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl">⏳</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Active Products</p>
                                <p className="text-3xl font-bold text-green-600">{activeProducts}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl">✅</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <Link
                                href="/baker/products/new"
                                className="block w-full px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-center"
                            >
                                Add New Product
                            </Link>
                            <Link
                                href="/baker/orders"
                                className="block w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center"
                            >
                                View All Orders
                            </Link>
                            <Link
                                href="/baker/analytics"
                                className="block w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-center"
                            >
                                View Analytics
                            </Link>
                            <Link
                                href="/baker/products"
                                className="block w-full px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-center"
                            >
                                Manage Products
                            </Link>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Orders</h3>
                        <div className="space-y-3">
                            {ordersArray.slice(0, 5).map((order: any) => (
                                <Link
                                    key={order.id}
                                    href={`/baker/orders/${order.id}`}
                                    className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold text-gray-900">Order #{order.id}</p>
                                            <p className="text-sm text-gray-600">{order.status}</p>
                                        </div>
                                        <p className="font-semibold text-orange-600">₹{order.final_amount}</p>
                                    </div>
                                </Link>
                            ))}
                            {ordersArray.length === 0 && (
                                <p className="text-gray-500 text-center py-4">No orders yet</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
