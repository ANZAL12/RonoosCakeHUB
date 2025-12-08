'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/api';

export default function OrdersPage() {
    const { user } = useAuth();

    const { data: orders, isLoading } = useQuery({
        queryKey: ['orders'],
        queryFn: async () => {
            const response = await apiClient.get('/api/orders/');
            return response.data;
        },
        enabled: !!user,
    });

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800',
            confirmed: 'bg-blue-100 text-blue-800',
            in_kitchen: 'bg-purple-100 text-purple-800',
            ready: 'bg-green-100 text-green-800',
            out_for_delivery: 'bg-indigo-100 text-indigo-800',
            completed: 'bg-green-600 text-white',
            cancelled: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <Link href="/" className="text-2xl font-bold text-orange-600">
                        Ronoos BakeHub
                    </Link>
                    <Link href="/products" className="text-gray-700 hover:text-orange-600">
                        Browse Products
                    </Link>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-8">My Orders</h1>

                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="text-gray-600">Loading orders...</div>
                    </div>
                ) : orders && orders.length > 0 ? (
                    <div className="space-y-4">
                        {orders.map((order: any) => (
                            <Link
                                key={order.id}
                                href={`/orders/${order.id}`}
                                className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Order #{order.id}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {new Date(order.created_at).toLocaleDateString('en-IN', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                            order.status
                                        )}`}
                                    >
                                        {order.status.replace('_', ' ').toUpperCase()}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <div className="text-sm text-gray-600">
                                        {order.items?.length || 0} item(s) • {order.delivery_type}
                                    </div>
                                    <div className="text-lg font-bold text-orange-600">
                                        ₹{order.final_amount}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
                        <Link
                            href="/products"
                            className="inline-block px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                        >
                            Start Shopping
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
