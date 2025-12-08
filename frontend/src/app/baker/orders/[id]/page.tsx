'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/api';
import { useEffect } from 'react';

export default function BakerOrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const orderId = params.id;
    const [selectedStatus, setSelectedStatus] = useState('');

    useEffect(() => {
        if (user && user.role !== 'baker') {
            router.push('/');
        }
    }, [user, router]);

    const { data: order, isLoading } = useQuery({
        queryKey: ['baker-order', orderId],
        queryFn: async () => {
            const response = await apiClient.get(`/api/orders/${orderId}/`);
            return response.data;
        },
        enabled: !!orderId && !!user && user.role === 'baker',
    });

    const updateStatusMutation = useMutation({
        mutationFn: async (newStatus: string) => {
            const response = await apiClient.patch(`/api/orders/${orderId}/status/`, {
                status: newStatus,
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['baker-order', orderId] });
            queryClient.invalidateQueries({ queryKey: ['baker-orders'] });
        },
    });

    const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('');

    useEffect(() => {
        if (order) {
            setSelectedStatus(order.status);
            setSelectedPaymentStatus(order.payment_status);
        }
    }, [order]);

    const updatePaymentStatusMutation = useMutation({
        mutationFn: async (newStatus: string) => {
            const response = await apiClient.patch(`/api/orders/${orderId}/payment-status/`, {
                payment_status: newStatus,
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['baker-order', orderId] });
            queryClient.invalidateQueries({ queryKey: ['baker-orders'] });
        },
    });

    const handleStatusUpdate = () => {
        if (selectedStatus && selectedStatus !== order?.status) {
            updateStatusMutation.mutate(selectedStatus);
        }
    };

    const handlePaymentStatusUpdate = () => {
        if (selectedPaymentStatus && selectedPaymentStatus !== order?.payment_status) {
            updatePaymentStatusMutation.mutate(selectedPaymentStatus);
        }
    };

    const statusOptions = [
        { value: 'pending', label: 'Pending' },
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'in_kitchen', label: 'In Kitchen' },
        { value: 'ready', label: 'Ready' },
        { value: 'out_for_delivery', label: 'Out for Delivery' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
    ];

    const paymentStatusOptions = [
        { value: 'pending', label: 'Pending' },
        { value: 'paid', label: 'Paid' },
        { value: 'failed', label: 'Failed' },
        { value: 'refunded', label: 'Refunded' },
    ];

    if (user && user.role !== 'baker') {
        return null;
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-gray-600">Loading order details...</div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-gray-600">Order not found</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <Link href="/baker/orders" className="text-orange-600 hover:text-orange-700">
                        ← Back to Orders
                    </Link>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Order #{order.id} - {order.user?.name || 'Guest'}
                        </h1>
                        <p className="text-lg text-gray-700 mb-1">
                            {order.items?.length === 1
                                ? order.items[0].product?.name || 'Custom Cake'
                                : `${order.items?.length || 0} Items`}
                        </p>
                        <p className="text-gray-600">
                            Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </p>
                    </div>

                    <div className="flex flex-col gap-4 w-full md:w-auto">
                        {/* Status Update */}
                        <div className="bg-white rounded-lg shadow p-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Order Status
                            </label>
                            <div className="flex gap-2">
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                >
                                    {statusOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={handleStatusUpdate}
                                    disabled={selectedStatus === order.status || updateStatusMutation.isPending}
                                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {updateStatusMutation.isPending ? '...' : 'Update'}
                                </button>
                            </div>
                        </div>

                        {/* Payment Status Update */}
                        <div className="bg-white rounded-lg shadow p-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Payment Status
                            </label>
                            <div className="flex gap-2">
                                <select
                                    value={selectedPaymentStatus}
                                    onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                >
                                    {paymentStatusOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={handlePaymentStatusUpdate}
                                    disabled={selectedPaymentStatus === order.payment_status || updatePaymentStatusMutation.isPending}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {updatePaymentStatusMutation.isPending ? '...' : 'Update'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Order Items */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-2xl font-bold mb-4">Order Items</h2>
                            <div className="space-y-4">
                                {order.items?.map((item: any, index: number) => (
                                    <div key={index} className="border-b pb-4 last:border-0">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-semibold text-lg">
                                                    {item.product?.name || 'Custom Cake'}
                                                </h3>
                                                {item.product_variant && (
                                                    <p className="text-sm text-gray-600">{item.product_variant.label}</p>
                                                )}
                                                {item.custom_config && (
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        Custom: {JSON.stringify(item.custom_config)}
                                                    </p>
                                                )}
                                                {item.message_on_cake && (
                                                    <p className="text-sm text-orange-600 mt-1 font-medium">
                                                        Message: "{item.message_on_cake}"
                                                    </p>
                                                )}
                                                <p className="text-sm text-gray-600 mt-1">Quantity: {item.quantity}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-lg">₹{item.subtotal}</p>
                                                <p className="text-sm text-gray-600">₹{item.unit_price} each</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Delivery Details */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-2xl font-bold mb-4">Delivery Details</h2>
                            <div className="space-y-3">
                                <div>
                                    <span className="font-semibold">Type:</span>{' '}
                                    <span className="text-gray-700">
                                        {order.delivery_type === 'delivery' ? 'Home Delivery' : 'Store Pickup'}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-semibold">Date:</span>{' '}
                                    <span className="text-gray-700">
                                        {new Date(order.delivery_date).toLocaleDateString('en-IN')}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-semibold">Time Slot:</span>{' '}
                                    <span className="text-gray-700">{order.delivery_slot}</span>
                                </div>
                                {order.delivery_address_detail && (
                                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                        <p className="font-semibold mb-2">Delivery Address:</p>
                                        <p className="text-gray-700">
                                            {order.delivery_address_detail.line1}
                                            {order.delivery_address_detail.line2 && `, ${order.delivery_address_detail.line2}`}
                                            <br />
                                            {order.delivery_address_detail.city}, {order.delivery_address_detail.state} -{' '}
                                            {order.delivery_address_detail.pincode}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Customer & Payment Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-2xl font-bold mb-4">Customer Info</h2>
                            <div className="space-y-2">
                                <p>
                                    <span className="font-semibold">Name:</span>{' '}
                                    <span className="text-gray-700">{order.user?.name || 'N/A'}</span>
                                </p>
                                <p>
                                    <span className="font-semibold">Email:</span>{' '}
                                    <span className="text-gray-700">{order.user?.email || 'N/A'}</span>
                                </p>
                                <p>
                                    <span className="font-semibold">Phone:</span>{' '}
                                    <span className="text-gray-700">{order.user?.phone || 'N/A'}</span>
                                </p>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-2xl font-bold mb-4">Payment</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-semibold">₹{order.total_amount}</span>
                                </div>
                                {order.discount_amount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount</span>
                                        <span>-₹{order.discount_amount}</span>
                                    </div>
                                )}
                                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                                    <span>Total</span>
                                    <span className="text-orange-600">₹{order.final_amount}</span>
                                </div>
                                <div className="flex justify-between text-sm pt-2">
                                    <span className="text-gray-600">Payment Status</span>
                                    <span
                                        className={`font-semibold ${order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'
                                            }`}
                                    >
                                        {order.payment_status.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
