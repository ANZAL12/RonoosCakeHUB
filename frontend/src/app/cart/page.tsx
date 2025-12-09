'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function CartPage() {
    const router = useRouter();
    const { items, removeItem, updateQuantity, totalAmount, clearCart } = useCart();
    const [couponCode, setCouponCode] = useState('');
    const [isClearCartModalOpen, setIsClearCartModalOpen] = useState(false);

    const handleClearCart = () => {
        setIsClearCartModalOpen(true);
    };

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
                {/* Header: Global Navbar */}

                <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
                    <p className="text-black mb-8">Add some delicious cakes to get started!</p>
                    <Link
                        href="/products"
                        className="inline-block px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                    >
                        Browse Products
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
            {/* Header: Global Navbar */}

            <div className="max-w-6xl mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {items.map((item) => (
                            <div key={item.id} className="bg-white rounded-lg shadow p-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {item.productName}
                                            {item.variantLabel && (
                                                <span className="text-sm text-black ml-2">({item.variantLabel})</span>
                                            )}
                                        </h3>

                                        {item.type === 'custom' && item.customConfig && (
                                            <p className="text-sm text-black mt-1">
                                                {item.customConfig.labels}
                                            </p>
                                        )}

                                        {item.messageOnCake && (
                                            <p className="text-sm text-orange-600 mt-1">
                                                Message: "{item.messageOnCake}"
                                            </p>
                                        )}

                                        <p className="text-lg font-semibold text-orange-600 mt-2">
                                            ₹{item.unitPrice}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="text-red-600 hover:text-red-800 ml-4"
                                    >
                                        Remove
                                    </button>
                                </div>

                                <div className="flex items-center mt-4">
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        className="px-3 py-1 bg-orange-600 text-white rounded-l-lg hover:bg-orange-700"
                                    >
                                        -
                                    </button>
                                    <span className="px-4 py-1 bg-gray-100 text-black font-semibold">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        className="px-3 py-1 bg-orange-600 text-white rounded-r-lg hover:bg-orange-700"
                                    >
                                        +
                                    </button>
                                    <span className="ml-4 text-black font-medium">
                                        Subtotal: ₹{item.unitPrice * item.quantity}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow p-6 sticky top-4">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Summary</h2>

                            <div className="space-y-3 mb-4">
                                <div className="flex justify-between">
                                    <span className="text-black">Subtotal</span>
                                    <span className="font-semibold text-black">₹{totalAmount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-black">Delivery</span>
                                    <span className="font-semibold text-black">₹50</span>
                                </div>
                                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                                    <span className="text-black">Total</span>
                                    <span className="text-orange-600">₹{totalAmount + 50}</span>
                                </div>
                            </div>

                            <div className="mb-4">
                                <input
                                    type="text"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    placeholder="Coupon code"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-500 text-black"
                                />
                            </div>

                            <button
                                onClick={() => router.push('/checkout')}
                                className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 font-semibold"
                            >
                                Proceed to Checkout
                            </button>

                            <button
                                onClick={handleClearCart}
                                className="w-full mt-2 text-red-600 hover:text-red-800 text-sm"
                            >
                                Clear Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <ConfirmModal
                isOpen={isClearCartModalOpen}
                onClose={() => setIsClearCartModalOpen(false)}
                onConfirm={clearCart}
                title="Clear Shopping Cart"
                message="Are you sure you want to remove all items from your cart? This action cannot be undone."
                confirmText="Clear Cart"
                cancelText="Keep Items"
                isDestructive={true}
            />
        </div>
    );
}
