'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface Product {
    id: number;
    name: string;
    description: string;
    category: number;
    is_customizable: boolean;
    variants: Array<{
        id: number;
        label: string;
        price: string;
        is_eggless: boolean;
    }>;
    images: Array<{
        id: number;
        image?: string;
        image_url?: string;
        is_primary: boolean;
    }>;
}

export default function ProductDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const { addItem } = useCart();
    const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
    const [quantity, setQuantity] = useState(1);

    const { data: product, isLoading, error } = useQuery({
        queryKey: ['product', params.id],
        queryFn: async () => {
            const response = await apiClient.get(`/api/catalog/products/${params.id}/`);
            return response.data as Product;
        },
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading product details...</div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <div className="text-xl text-red-600">Product not found</div>
                <Link href="/products" className="text-orange-600 hover:underline">
                    Back to Products
                </Link>
            </div>
        );
    }

    const selectedVariant = product.variants.find(v => v.id === selectedVariantId) || product.variants[0];

    const handleAddToCart = () => {
        if (!selectedVariant) return;

        addItem({
            type: 'product',
            productId: product.id,
            variantId: selectedVariant.id,
            productName: product.name,
            variantLabel: selectedVariant.label,
            quantity: quantity,
            unitPrice: parseFloat(selectedVariant.price),
        });
        alert('Added to cart!');
    };

    const displayImage = product.images && product.images.length > 0
        ? (product.images[0].image || product.images[0].image_url)
        : null;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* <Navbar /> handled by Layout */}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-6">
                    <Link href="/products" className="text-orange-600 hover:text-orange-700 font-medium">
                        ← Back to Products
                    </Link>
                </div>
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Image Section */}
                        <div className="h-96 bg-gray-100 flex items-center justify-center overflow-hidden relative">
                            {displayImage ? (
                                <img
                                    src={displayImage}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-orange-200 to-amber-200 flex items-center justify-center">
                                    <span className="text-9xl">🍰</span>
                                </div>
                            )}
                        </div>

                        {/* Details Section */}
                        <div className="p-8 flex flex-col">
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
                            <p className="text-gray-600 mb-8 text-lg leading-relaxed">{product.description}</p>

                            <div className="mb-8">
                                <h3 className="text-sm font-medium text-gray-900 mb-4">Select Option</h3>
                                <div className="space-y-3">
                                    {product.variants.map((variant) => (
                                        <label
                                            key={variant.id}
                                            className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${(selectedVariantId === variant.id || (!selectedVariantId && variant === product.variants[0]))
                                                ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500'
                                                : 'border-gray-200 hover:border-orange-200'
                                                }`}
                                        >
                                            <div className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="variant"
                                                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                                                    checked={selectedVariantId === variant.id || (!selectedVariantId && variant === product.variants[0])}
                                                    onChange={() => setSelectedVariantId(variant.id)}
                                                />
                                                <div className="ml-3">
                                                    <span className="block text-sm font-medium text-gray-900">
                                                        {variant.label}
                                                    </span>
                                                    {variant.is_eggless && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mt-1">
                                                            Eggless
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-lg font-bold text-gray-900">
                                                ₹{variant.price}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-auto border-t pt-8">
                                <div className="flex items-center gap-4 mb-6">
                                    <label className="text-gray-700 font-medium">Quantity:</label>
                                    <div className="flex items-center border border-gray-300 rounded-md">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="px-3 py-1 hover:bg-gray-100 text-gray-600"
                                        >
                                            -
                                        </button>
                                        <span className="px-3 py-1 font-medium w-12 text-center">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="px-3 py-1 hover:bg-gray-100 text-gray-600"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={() => user ? handleAddToCart() : router.push('/login')}
                                    className="w-full bg-orange-600 text-white py-4 px-8 rounded-lg text-lg font-bold hover:bg-orange-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                >
                                    {user
                                        ? `Add to Cart - ₹${(parseFloat(selectedVariant?.price || '0') * quantity).toFixed(2)}`
                                        : 'Login to Order'
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
