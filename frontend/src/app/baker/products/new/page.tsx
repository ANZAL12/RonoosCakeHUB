'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import apiClient from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Trash2 } from 'lucide-react';

const productSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().min(1, 'Description is required'),
    category: z.string().min(1, 'Category is required'),
    image: z.any().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function AddProductPage() {
    const router = useRouter();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [error, setError] = useState('');
    const [variants, setVariants] = useState([{ label: '', price: '' }]);

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

    const handleAddVariant = () => {
        setVariants([...variants, { label: '', price: '' }]);
    };

    const handleRemoveVariant = (index: number) => {
        if (variants.length > 1) {
            const newVariants = [...variants];
            newVariants.splice(index, 1);
            setVariants(newVariants);
        }
    };

    const handleVariantChange = (index: number, field: 'label' | 'price', value: string) => {
        const newVariants = [...variants];
        newVariants[index][field] = value;
        setVariants(newVariants);
    };

    const createProductMutation = useMutation({
        mutationFn: async (data: ProductFormData) => {
            // Validate variants
            const validVariants = variants.filter(v => v.label && v.price);
            if (validVariants.length === 0) {
                throw new Error('At least one valid variant (Size & Price) is required');
            }

            // 1. Create Product
            const productRes = await apiClient.post('/api/catalog/baker/products/', {
                name: data.name,
                description: data.description,
                category: data.category,
                is_active: true,
                is_customizable: false,
                // Note: We are NOT sending 'price' here, so no default variant is created
            });
            const productId = productRes.data.id;

            // 2. Create Variants
            const variantPromises = validVariants.map(variant =>
                apiClient.post(`/api/catalog/baker/products/${productId}/variants/`, {
                    label: variant.label,
                    price: variant.price,
                    preparation_hours: 24, // Default
                    is_eggless: false,
                })
            );
            await Promise.all(variantPromises);

            // 3. Upload Image (if selected)
            if (data.image && data.image.length > 0) {
                const formData = new FormData();
                formData.append('image', data.image[0]);
                formData.append('is_primary', 'true');

                await apiClient.post(`/api/catalog/baker/products/${productId}/images/`, formData, {
                    headers: {
                        'Content-Type': undefined,
                    } as any,
                });
            }

            return productId;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['baker-products'] });
            router.push('/baker/products');
        },
        onError: (err: any) => {
            setError(err.response?.data?.detail || err.message || 'Failed to create product');
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

                        {/* Variants Section */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Sizes & Rates</label>
                            <div className="space-y-3">
                                {variants.map((variant, index) => (
                                    <div key={index} className="flex gap-4 items-start">
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                placeholder="Size (e.g. 1kg)"
                                                value={variant.label}
                                                onChange={(e) => handleVariantChange(index, 'label', e.target.value)}
                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-sm"
                                                required
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                type="number"
                                                placeholder="Price (₹)"
                                                value={variant.price}
                                                onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-sm"
                                                required
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveVariant(index)}
                                            disabled={variants.length === 1}
                                            className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-50"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={handleAddVariant}
                                className="mt-3 flex items-center text-sm text-orange-600 hover:text-orange-700 font-medium"
                            >
                                <Plus size={16} className="mr-1" />
                                Add Another Size
                            </button>
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
