'use client';

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

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

import Navbar from '@/components/Navbar';

export default function ProductsPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { addItem } = useCart();

    // ... existing query code ...

    const { data: products, isLoading } = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const response = await apiClient.get('/api/catalog/products/');
            return response.data as Product[];
        },
    });

    const handleAddToCart = (product: Product, variant: Product['variants'][0]) => {
        // ... existing handleAddToCart ...
        addItem({
            type: 'product',
            productId: product.id,
            variantId: variant.id,
            productName: product.name,
            variantLabel: variant.label,
            quantity: 1,
            unitPrice: parseFloat(variant.price),
        });
        toast.success(`Added ${product.name} to cart`);
    };

    if (isLoading) {
        // ... existing loading ...
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading products...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
            {/* Unified Navigation handled in Layout */}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <h1 className="text-4xl font-bold mb-8 text-gray-900">Our Products</h1>

                    <div className="grid md:grid-cols-3 gap-6">
                        {products?.map((product) => (
                            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition flex flex-col">
                                <Link href={`/products/${product.id}`} className="block h-48 bg-gray-100 flex items-center justify-center overflow-hidden relative">
                                    {product.images && product.images.length > 0 ? (
                                        <img
                                            src={product.images[0].image || product.images[0].image_url}
                                            alt={product.name}
                                            className="w-full h-full object-cover hover:scale-105 transition duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-orange-200 to-amber-200 flex items-center justify-center">
                                            <span className="text-6xl">🍰</span>
                                        </div>
                                    )}
                                </Link>
                                <div className="p-6 flex-1 flex flex-col">
                                    <Link href={`/products/${product.id}`} className="hover:text-orange-600 transition">
                                        <h3 className="text-xl font-semibold mb-2 text-black">{product.name}</h3>
                                    </Link>
                                    <p className="text-black mb-4 flex-1">{product.description}</p>

                                    {product.variants.length > 0 ? (
                                        <div className="space-y-3">
                                            <p className="text-sm font-medium text-black">Select Option:</p>
                                            {product.variants.map((variant) => (
                                                <div key={variant.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                                    <div className="text-sm">
                                                        <span className="font-medium text-black">{variant.label}</span>
                                                        {variant.is_eggless && <span className="ml-1 text-xs bg-green-100 text-green-800 px-1 rounded">Eggless</span>}
                                                        <div className="text-orange-600 font-bold">₹{variant.price}</div>
                                                    </div>
                                                    <button
                                                        onClick={() => user ? handleAddToCart(product, variant) : router.push('/login')}
                                                        className="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700"
                                                    >
                                                        {user ? 'Add' : 'Login to Order'}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-red-500 text-sm">Currently unavailable</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {products?.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-xl text-gray-600">No products available yet.</p>
                        </div>
                    )}
                </div>
            </div>
            );
}
