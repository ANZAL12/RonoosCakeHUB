'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/api';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function EditProductPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const productId = params.id;

    // Product state
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [categoryId, setCategoryId] = useState<number | ''>('');

    // Variant editing
    const [editingVariantId, setEditingVariantId] = useState<number | null>(null);
    const [editLabel, setEditLabel] = useState('');
    const [editPrice, setEditPrice] = useState('');
    const [editIsEggless, setEditIsEggless] = useState(false);

    // Image preview
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    useEffect(() => {
        if (user && user.role !== 'baker') {
            router.push('/');
        }
    }, [user, router]);

    // Fetch product
    const { data: product, isLoading } = useQuery({
        queryKey: ['product', productId],
        queryFn: async () => {
            const response = await apiClient.get(`/api/catalog/products/${productId}/`);
            return response.data;
        },
        enabled: !!productId && !!user && user.role === 'baker',
        refetchInterval: 5000, // Refresh every 5 seconds
    });

    // Fetch categories
    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const response = await apiClient.get('/api/catalog/categories/');
            return response.data;
        },
    });

    useEffect(() => {
        if (product) {
            setName(product.name);
            setDescription(product.description);
            setIsActive(product.is_active);
            setCategoryId(product.category?.id || '');
        }
    }, [product]);

    // Update product - WITH REDIRECT
    const updateMutation = useMutation({
        mutationFn: async (data: any) => {
            const response = await apiClient.patch(`/api/catalog/baker/products/${productId}/`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['baker-products'] });
            alert('Product updated successfully!');
            router.push('/baker/products');
        },
    });

    // Delete product
    const deleteMutation = useMutation({
        mutationFn: async () => {
            await apiClient.delete(`/api/catalog/baker/products/${productId}/`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['baker-products'] });
            alert('Product deleted successfully!');
            router.push('/baker/products');
        },
        onError: (error: any) => {
            console.error('Delete failed:', error);
            alert(`Failed to delete product: ${error.response?.data?.detail || error.message}`);
        },
    });

    // Update variant
    const updateVariantMutation = useMutation({
        mutationFn: async ({ variantId, data }: { variantId: number; data: any }) => {
            const response = await apiClient.patch(`/api/catalog/baker/variants/${variantId}/`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product', productId] });
            setEditingVariantId(null);
            alert('Variant updated!');
        },
    });

    // Delete variant
    const deleteVariantMutation = useMutation({
        mutationFn: async (variantId: number) => {
            await apiClient.delete(`/api/catalog/baker/variants/${variantId}/`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product', productId] });
            alert('Variant deleted!');
        },
    });

    // Image mutations
    const uploadImageMutation = useMutation({
        mutationFn: async (formData: FormData) => {
            const response = await apiClient.post(`/api/catalog/baker/images/`, formData);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product', productId] });
            setImagePreview(null);
            setSelectedFile(null);
            alert('Image uploaded!');
        },
    });

    const deleteImageMutation = useMutation({
        mutationFn: async (imageId: number) => {
            await apiClient.delete(`/api/catalog/baker/images/${imageId}/`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product', productId] });
            alert('Image deleted!');
        },
    });

    const setPrimaryImageMutation = useMutation({
        mutationFn: async (imageId: number) => {
            await apiClient.patch(`/api/catalog/baker/images/${imageId}/`, { is_primary: true });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product', productId] });
        },
    });

    // Handlers
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateMutation.mutate({
            name,
            description,
            is_active: isActive,
            category: categoryId || null,
        });
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
                setSelectedFile(file);
            };
            reader.readAsDataURL(file);
        }
    };

    const confirmUpload = () => {
        if (selectedFile) {
            const formData = new FormData();
            formData.append('image', selectedFile);
            formData.append('product', productId as string);
            formData.append('is_primary', product.images?.length === 0 ? 'true' : 'false');
            uploadImageMutation.mutate(formData);
        }
    };

    const cancelUpload = () => {
        setImagePreview(null);
        setSelectedFile(null);
    };

    const startEditVariant = (variant: any) => {
        setEditingVariantId(variant.id);
        setEditLabel(variant.label);
        setEditPrice(variant.price);
        setEditIsEggless(variant.is_eggless);
    };

    const saveVariant = () => {
        if (editingVariantId) {
            updateVariantMutation.mutate({
                variantId: editingVariantId,
                data: {
                    label: editLabel,
                    price: editPrice,
                    is_eggless: editIsEggless,
                },
            });
        }
    };

    if (user && user.role !== 'baker') return null;
    if (isLoading) return <div className="min-h-screen bg-gray-100 flex items-center justify-center"><p>Loading...</p></div>;
    if (!product) return <div className="min-h-screen bg-gray-100 flex items-center justify-center"><p>Product not found</p></div>;

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <Link href="/baker/products" className="text-orange-600 hover:text-orange-700">← Back</Link>
                    <h1 className="text-2xl font-bold">Edit Product</h1>
                    <div className="w-20"></div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
                {/* Main Form */}
                <div className="bg-white rounded-lg shadow p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">Product Name *</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">Description *</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                                rows={4}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">Category</label>
                            <select
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900"
                            >
                                <option value="">No category</option>
                                {categories?.map((cat: any) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                                className="w-4 h-4 text-orange-600 rounded"
                            />
                            <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-900">Active (visible to customers)</label>
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={updateMutation.isPending}
                                className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                            >
                                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button
                                type="button"
                                onClick={() => confirm('Delete product?') && deleteMutation.mutate()}
                                disabled={deleteMutation.isPending}
                                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </form>
                </div>

                {/* Variants */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Variants & Pricing</h3>
                    <div className="space-y-3">
                        {product.variants?.map((variant: any) => (
                            <div key={variant.id} className="border rounded-lg p-4">
                                {editingVariantId === variant.id ? (
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            value={editLabel}
                                            onChange={(e) => setEditLabel(e.target.value)}
                                            className="w-full px-3 py-2 border rounded text-gray-900"
                                            placeholder="Label (e.g., 1kg)"
                                        />
                                        <input
                                            type="number"
                                            value={editPrice}
                                            onChange={(e) => setEditPrice(e.target.value)}
                                            className="w-full px-3 py-2 border rounded text-gray-900"
                                            placeholder="Price"
                                            step="0.01"
                                        />
                                        <label className="flex items-center text-gray-900">
                                            <input
                                                type="checkbox"
                                                checked={editIsEggless}
                                                onChange={(e) => setEditIsEggless(e.target.checked)}
                                                className="mr-2"
                                            />
                                            Eggless
                                        </label>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={saveVariant}
                                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => setEditingVariantId(null)}
                                                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold">{variant.label}</p>
                                            <p className="text-sm text-gray-600">
                                                ₹{variant.price} {variant.is_eggless && '• Eggless'}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => startEditVariant(variant)}
                                                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => confirm('Delete variant?') && deleteVariantMutation.mutate(variant.id)}
                                                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Images */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Images</h3>
                        <label className="px-4 py-2 bg-orange-600 text-white rounded-lg cursor-pointer hover:bg-orange-700">
                            <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                            + Add Image
                        </label>
                    </div>

                    {/* Image Preview */}
                    {imagePreview && (
                        <div className="mb-4 p-4 border-2 border-orange-500 rounded-lg bg-orange-50">
                            <p className="font-semibold text-gray-900 mb-2">Preview:</p>
                            <img src={imagePreview} alt="Preview" className="w-full max-w-md h-64 object-cover rounded mb-3" />
                            <div className="flex gap-2">
                                <button
                                    onClick={confirmUpload}
                                    disabled={uploadImageMutation.isPending}
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                                >
                                    {uploadImageMutation.isPending ? 'Uploading...' : 'Confirm Upload'}
                                </button>
                                <button
                                    onClick={cancelUpload}
                                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {product.images?.length > 0 ? (
                        <div className="grid grid-cols-3 gap-4">
                            {product.images.map((img: any) => (
                                <div key={img.id} className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden group">
                                    <img src={img.image || img.image_url} alt="" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                        {!img.is_primary && (
                                            <button
                                                onClick={() => setPrimaryImageMutation.mutate(img.id)}
                                                className="px-2 py-1 bg-orange-600 text-white text-xs rounded"
                                            >
                                                Set Primary
                                            </button>
                                        )}
                                        <button
                                            onClick={() => confirm('Delete image?') && deleteImageMutation.mutate(img.id)}
                                            className="px-2 py-1 bg-red-600 text-white text-xs rounded"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                    {img.is_primary && (
                                        <span className="absolute top-2 right-2 px-2 py-1 bg-orange-600 text-white text-xs rounded">Primary</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">No images yet</p>
                    )}
                </div>
            </div>
        </div>
    );
}
