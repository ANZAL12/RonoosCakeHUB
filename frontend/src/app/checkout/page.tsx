'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/api';
import OrderSuccessModal from '@/components/ui/OrderSuccessModal';
import { MapPin, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function CheckoutPage() {
    const router = useRouter();
    const { items, totalAmount, clearCart } = useCart();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [error, setError] = useState('');
    const [successModalData, setSuccessModalData] = useState<{ isOpen: boolean, orderId: string | number }>({
        isOpen: false,
        orderId: ''
    });

    useEffect(() => {
        if (items.length === 0 && !successModalData.isOpen) {
            router.push('/cart');
        }
    }, [items, router, successModalData.isOpen]);

    // Form state
    const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
    const [address, setAddress] = useState({
        line1: '',
        line2: '',
        city: '',
        pincode: '',
        state: '',
        map_link: '',
    });
    const [deliveryDate, setDeliveryDate] = useState('');
    const [deliverySlot, setDeliverySlot] = useState('');

    const timeSlots = [
        '10:00-11:00 AM',
        '11:00-12:00 PM',
        '12:00-01:00 PM',
        '02:00-03:00 PM',
        '03:00-04:00 PM',
        '04:00-05:00 PM',
    ];

    const handlePlaceOrder = async () => {
        if (!user) {
            router.push('/login');
            return;
        }

        if (deliveryType === 'delivery' && (!address.line1 || !address.city || !address.pincode)) {
            setError('Please fill in all address fields');
            return;
        }

        if (!deliveryDate || !deliverySlot) {
            setError('Please select delivery date and time slot');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const orderData = {
                delivery_type: deliveryType,
                delivery_address: null as number | null,
                delivery_date: deliveryDate,
                delivery_slot: deliverySlot,
                total_amount: totalAmount,
                discount_amount: 0,
                final_amount: totalAmount + (deliveryType === 'delivery' ? 50 : 0),
                payment_status: 'pending',
                items: items.map((item) => ({
                    product_id: item.productId,
                    product_variant_id: item.variantId,
                    quantity: item.quantity,
                    unit_price: item.unitPrice,
                    subtotal: item.unitPrice * item.quantity,
                    custom_config: item.customConfig,
                    message_on_cake: item.messageOnCake,
                })),
            };

            if (deliveryType === 'delivery') {
                try {
                    const addressResponse = await apiClient.post('/api/users/addresses/', {
                        ...address,
                        is_default: true,
                    });
                    orderData.delivery_address = addressResponse.data.id;
                } catch (addrErr) {
                    console.error('Address creation failed:', addrErr);
                    setError('Failed to save delivery address. Please try again.');
                    setLoading(false);
                    return;
                }
            }

            const response = await apiClient.post('/api/orders/', orderData);

            // Send confirmation email via frontend API
            try {
                await fetch('/api/emails/order-confirmation', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        order: response.data,
                        customer: user,
                    }),
                });
            } catch (emailErr) {
                console.error('Failed to trigger email:', emailErr);
                // Don't block the user flow if email fails
            }

            setSuccessModalData({
                isOpen: true,
                orderId: response.data.id
            });
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    const handleModalClose = () => {
        clearCart();
        router.push(`/orders/${successModalData.orderId}`);
    };

    const handleContinueShopping = () => {
        clearCart();
        router.push('/products');
    };

    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        setLocationLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    // Generate Google Maps Link
                    const mapLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

                    // Reverse Geocoding using Nominatim
                    const response = await axios.get(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                    );

                    const addressData = response.data.address;

                    setAddress(prev => ({
                        ...prev,
                        line1: addressData.road || addressData.suburb || '',
                        line2: addressData.neighbourhood || '',
                        city: addressData.city || addressData.town || addressData.village || '',
                        state: addressData.state || '',
                        pincode: addressData.postcode || '',
                        map_link: mapLink
                    }));

                } catch (err) {
                    console.error('Error fetching address:', err);
                    setError('Failed to fetch address details. Please fill manually.');
                } finally {
                    setLocationLoading(false);
                }
            },
            (err) => {
                console.error('Geolocation error:', err);
                setError('Failed to get your location. Please ensure location permissions are granted.');
                setLocationLoading(false);
            }
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
            {/* <Navbar /> handled by Layout */}

            <div className="max-w-6xl mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-8">Checkout</h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Checkout Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Delivery Type */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-2xl font-bold mb-4 text-black">Delivery Method</h2>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setDeliveryType('delivery')}
                                    className={`flex-1 py-3 rounded-lg border-2 transition-all ${deliveryType === 'delivery'
                                        ? 'border-orange-600 bg-orange-50'
                                        : 'border-gray-300 hover:border-orange-300'
                                        }`}
                                >
                                    <div className="font-semibold text-black">Home Delivery</div>
                                    <div className="text-sm text-black">₹50</div>
                                </button>
                                <button
                                    onClick={() => setDeliveryType('pickup')}
                                    className={`flex-1 py-3 rounded-lg border-2 transition-all ${deliveryType === 'pickup'
                                        ? 'border-orange-600 bg-orange-50'
                                        : 'border-gray-300 hover:border-orange-300'
                                        }`}
                                >
                                    <div className="font-semibold text-black">Store Pickup</div>
                                    <div className="text-sm text-black">Free</div>
                                </button>
                            </div>
                        </div>

                        {/* Address Form */}
                        {deliveryType === 'delivery' && (
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-2xl font-bold text-black">Delivery Address</h2>
                                    <button
                                        onClick={handleGetCurrentLocation}
                                        disabled={locationLoading}
                                        className="flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 font-medium disabled:opacity-50"
                                    >
                                        {locationLoading ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <MapPin className="w-4 h-4" />
                                        )}
                                        Use Current Location
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="Address Line 1"
                                        value={address.line1}
                                        onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 placeholder-gray-500 text-black"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Address Line 2 (Optional)"
                                        value={address.line2}
                                        onChange={(e) => setAddress({ ...address, line2: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 placeholder-gray-500 text-black"
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            placeholder="City"
                                            value={address.city}
                                            onChange={(e) => setAddress({ ...address, city: e.target.value })}
                                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 placeholder-gray-500 text-black"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Pincode"
                                            value={address.pincode}
                                            onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 placeholder-gray-500 text-black"
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="State"
                                        value={address.state}
                                        onChange={(e) => setAddress({ ...address, state: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 placeholder-gray-500 text-black"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Share Location Link (Optional)"
                                        value={address.map_link}
                                        onChange={(e) => setAddress({ ...address, map_link: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 placeholder-gray-500 text-black"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Delivery Date & Time */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-2xl font-bold mb-4 text-black">Delivery Date & Time</h2>
                            <div className="space-y-4">
                                <input
                                    type="date"
                                    value={deliveryDate}
                                    onChange={(e) => setDeliveryDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-black"
                                />
                                <select
                                    value={deliverySlot}
                                    onChange={(e) => setDeliverySlot(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-black"
                                >
                                    <option value="">Select Time Slot</option>
                                    {timeSlots.map((slot) => (
                                        <option key={slot} value={slot}>
                                            {slot}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow p-6 sticky top-4">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Summary</h2>

                            <div className="space-y-2 mb-4">
                                {items.map((item) => (
                                    <div key={item.id} className="flex justify-between text-sm">
                                        <span className="text-black">
                                            {item.productName} x{item.quantity}
                                        </span>
                                        <span className="text-black">₹{item.unitPrice * item.quantity}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t pt-4 space-y-2 mb-4">
                                <div className="flex justify-between">
                                    <span className="text-black">Subtotal</span>
                                    <span className="text-black">₹{totalAmount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-black">Delivery</span>
                                    <span className="text-black">₹{deliveryType === 'delivery' ? 50 : 0}</span>
                                </div>
                                <div className="border-t pt-2 flex justify-between text-lg font-bold">
                                    <span className="text-black">Total</span>
                                    <span className="text-orange-600">
                                        ₹{totalAmount + (deliveryType === 'delivery' ? 50 : 0)}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handlePlaceOrder}
                                disabled={loading}
                                className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 font-semibold disabled:opacity-50"
                            >
                                {loading ? 'Placing Order...' : 'Place Order'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <OrderSuccessModal
                isOpen={successModalData.isOpen}
                orderId={successModalData.orderId}
                onClose={handleModalClose}
                onContinueShopping={handleContinueShopping}
            />
        </div>
    );
}
