'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/api';

export default function OrderDetailPage() {
    const params = useParams();
    const orderId = params.id;

    const { data: order, isLoading } = useQuery({
        queryKey: ['order', orderId],
        queryFn: async () => {
            const response = await apiClient.get(`/api/orders/${orderId}/`);
            return response.data;
        },
        enabled: !!orderId,
    });

    const statusSteps = [
        { key: 'pending', label: 'Order Placed' },
        { key: 'confirmed', label: 'Confirmed' },
        { key: 'in_kitchen', label: 'In Kitchen' },
        { key: 'ready', label: 'Ready' },
        { key: 'out_for_delivery', label: 'Out for Delivery' },
        { key: 'completed', label: 'Completed' },
    ];

    const getCurrentStepIndex = (status: string) => {
        if (status === 'cancelled') return -1;
        return statusSteps.findIndex((step) => step.key === status);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
                <div className="text-gray-600">Loading order details...</div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
                <div className="text-gray-600">Order not found</div>
            </div>
        );
    }

    const currentStep = getCurrentStepIndex(order.status);

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <Link href="/orders" className="text-orange-600 hover:text-orange-700">
                        ← Back to Orders
                    </Link>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Order #{order.id}</h1>
                <p className="text-gray-600 mb-8">
                    Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </p>

                {order.status !== 'cancelled' && (
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <h2 className="text-2xl font-bold mb-6 text-black">Order Status</h2>
                        <div className="relative">
                            <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200">
                                <div
                                    className="h-full bg-orange-600 transition-all duration-500"
                                    style={{ width: `${(currentStep / (statusSteps.length - 1)) * 100}%` }}
                                />
                            </div>
                            <div className="relative flex justify-between">
                                {statusSteps.map((step, index) => (
                                    <div key={step.key} className="flex flex-col items-center">
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${index <= currentStep
                                                ? 'bg-orange-600 text-white'
                                                : 'bg-gray-200 text-gray-600'
                                                }`}
                                        >
                                            {index < currentStep ? '✓' : index + 1}
                                        </div>
                                        <span
                                            className={`text-xs text-center ${index <= currentStep ? 'text-orange-600 font-semibold' : 'text-gray-600'
                                                }`}
                                        >
                                            {step.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {order.status === 'cancelled' && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        This order has been cancelled.
                    </div>
                )}

                {/* Order Items */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-2xl font-bold mb-4 text-black">Order Items</h2>
                    <div className="space-y-4">
                        {order.items?.map((item: any, index: number) => (
                            <div key={index} className="flex justify-between items-start border-b pb-4 last:border-0">
                                <div>
                                    <h3 className="font-semibold text-black">{item.product?.name || 'Custom Cake'}</h3>
                                    {item.product_variant && (
                                        <p className="text-sm text-black">{item.product_variant.label}</p>
                                    )}
                                    {item.message_on_cake && (
                                        <p className="text-sm text-orange-600">Message: "{item.message_on_cake}"</p>
                                    )}
                                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-black">₹{item.subtotal}</p>
                                    <p className="text-sm text-black">₹{item.unit_price} each</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Delivery Details */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-2xl font-bold mb-4 text-black">Delivery Details</h2>
                    <div className="space-y-2">
                        <p>
                            <span className="font-semibold text-black">Type:</span>{' '}
                            <span className="text-black">{order.delivery_type === 'delivery' ? 'Home Delivery' : 'Store Pickup'}</span>
                        </p>
                        <p>
                            <span className="font-semibold text-black">Date:</span>{' '}
                            <span className="text-black">{new Date(order.delivery_date).toLocaleDateString('en-IN')}</span>
                        </p>
                        <p>
                            <span className="font-semibold text-black">Time Slot:</span> <span className="text-black">{order.delivery_slot}</span>
                        </p>
                        {order.delivery_address_detail && (
                            <div className="mt-4">
                                <p className="font-semibold mb-1 text-black">Address:</p>
                                <a
                                    href={order.delivery_address_detail.map_link || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                        `${order.delivery_address_detail.line1}, ${order.delivery_address_detail.line2 || ''}, ${order.delivery_address_detail.city}, ${order.delivery_address_detail.state}, ${order.delivery_address_detail.pincode}`
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-orange-600 hover:text-orange-700 underline"
                                >
                                    {order.delivery_address_detail.line1}
                                    {order.delivery_address_detail.line2 && `, ${order.delivery_address_detail.line2}`}
                                    <br />
                                    {order.delivery_address_detail.city}, {order.delivery_address_detail.state} -{' '}
                                    {order.delivery_address_detail.pincode}
                                </a>
                                {order.delivery_address_detail.map_link && (
                                    <p className="text-xs text-blue-600 mt-1">
                                        (Custom location link provided)
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Payment Summary */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-2xl font-bold mb-4 text-black">Payment Summary</h2>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-black">Subtotal</span>
                            <span className="text-black">₹{order.total_amount}</span>
                        </div>
                        {order.discount_amount > 0 && (
                            <div className="flex justify-between text-green-600">
                                <span>Discount</span>
                                <span>-₹{order.discount_amount}</span>
                            </div>
                        )}
                        <div className="border-t pt-2 flex justify-between text-lg font-bold">
                            <span className="text-black">Total</span>
                            <span className="text-orange-600">₹{order.final_amount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-black">Payment Status</span>
                            <span className={order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}>
                                {order.payment_status.toUpperCase()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
