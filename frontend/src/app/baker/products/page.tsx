'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api';
import { useEffect } from 'react';

export default function BakerProductsPage() {
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (user && user.role !== 'baker') {
            router.push('/');
        }
    }, [user, router]);

    const { data: products, isLoading } = useQuery({
        queryKey: ['baker-products'],
        queryFn: async () => {
            return response.data;
        },
        enabled: !!user && user.role === 'baker',
        refetchInterval: 5000,
        refetchOnMount: true,
        staleTime: 0,
    });

    if (user && user.role !== 'baker') {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <Link href="/baker/dashboard" className="text-orange-600 hover:text-orange-700">
                        ← Back to Dashboard
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
                    <Link
                        href="/baker/products/new"
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                    >
                        Add Product
                    </Link>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {isLoading ? (
                    <div className="text-center py-12">Loading products...</div>
                ) : products && products.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((product: any) => {
                            const imageUrl = product.images?.[0]?.image || product.images?.[0]?.image_url;

                            return (
                                <div key={product.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden flex flex-col">
                                    {/* Product Image - Always show with consistent height */}
                                    <div className="h-48 bg-gray-200 relative overflow-hidden">
                                        {imageUrl ? (
                                            <img
                                                src={imageUrl}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-amber-100">
                                                <span className="text-6xl">🍰</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Details */}
                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-lg font-bold text-gray-900 flex-1">{product.name}</h3>
                                            <span
                                                className={`px-2 py-1 rounded text-xs font-semibold ml-2 ${product.is_active
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                    }`}
                                            >
                                                {product.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">{product.description}</p>
                                        <div className="flex justify-between items-center mb-4 text-sm text-gray-600">
                                            <span>
                                                {product.variants?.length || 0} variant(s)
                                            </span>
                                            <span>
                                                {product.category?.name || 'No category'}
                                            </span>
                                        </div>
                                        <Link
                                            href={`/baker/products/${product.id}`}
                                            className="block w-full text-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                                        >
                                            Edit Product
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-600 mb-4">No products yet. Start by adding your first product!</p>
                        <Link
                            href="/baker/products/new"
                            className="inline-block px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                        >
                            Add Product
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
