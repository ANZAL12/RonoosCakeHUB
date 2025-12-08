'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import apiClient from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const productSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().min(1, 'Description is required'),
    category: z.string().min(1, 'Category is required'),
    price: z.string().min(1, 'Price is required'), // Initial variant price
    image: z.any().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function AddProductPage() {
    const router = useRouter();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [error, setError] = useState('');

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
    });

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const response = await apiClient.get('/api/catalog/categories/');
            return response.data;
        },
    });

    const createProductMutation = useMutation({
        mutationFn: async (data: ProductFormData) => {
            // 1. Create Product
            const productRes = await apiClient.post('/api/catalog/baker/products/', {
                name: data.name,
                description: data.description,
                category: data.category,
                is_active: true,
                is_customizable: false,
            });
            const productId = productRes.data.id;

            // 2. Create Initial Variant
            await apiClient.post(`/api/catalog/baker/products/${productId}/variants/`, {
                label: 'Standard',
                price: data.price,
                preparation_hours: 24,
                is_eggless: false,
            });

            // 3. Upload Image (if selected)
            if (data.image && data.image.length > 0) {
                const formData = new FormData();
                formData.append('image', data.image[0]);
                formData.append('is_primary', 'true');

                await apiClient.post(`/api/catalog/baker/products/${productId}/images/`, formData);
            }

            return productId;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['baker-products'] });
            router.push('/baker/products');
        },
        onError: (err: any) => {
            setError(err.response?.data?.detail || 'Failed to create product');
        },
    });

    if (user && user.role !== 'baker') {
        router.push('/');
        return null;
    }

    const onSubmit = (data: ProductFormData) => {
        createProductMutation.mutate(data);
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
                </div>
            </header>

            <div className="max-w-3xl mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow p-6">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Product Name</label>
                            <input
                                {...register('name')}
                                type="text"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                            />
                            {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                {...register('description')}
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                            />
                            {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Category</label>
                            <select
                                {...register('category')}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                            >
                                <option value="">Select a category</option>
                                {categories?.map((cat: any) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                            {errors.category && <p className="text-red-600 text-sm mt-1">{errors.category.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
                            <input
                                {...register('price')}
                                type="number"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                            />
                            {errors.price && <p className="text-red-600 text-sm mt-1">{errors.price.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Product Image</label>
                            <input
                                {...register('image')}
                                type="file"
                                accept="image/*"
                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                            />
                        </div>

                        <div className="flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Creating...' : 'Create Product'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
