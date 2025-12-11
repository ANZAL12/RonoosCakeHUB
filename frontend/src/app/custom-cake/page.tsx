'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api';
import toast from 'react-hot-toast';
import { useCart } from '@/contexts/CartContext';


export default function CustomCakePage() {
    const router = useRouter();
    const { addItem } = useCart();

    // Feature Toggle State - Real-time polling
    const { data: settings, isLoading: isLoadingSettings } = useQuery({
        queryKey: ['baker-settings'],
        queryFn: async () => {
            const res = await apiClient.get('/api/users/baker-settings/');
            return res.data;
        },
        refetchInterval: 3000, // Poll every 3 seconds
    });

    const isCustomCakeEnabled = settings?.is_custom_build_enabled ?? true;

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(true);

    // Dynamic Options State
    const [options, setOptions] = useState<{
        base: any[];
        flavour: any[];
        shape: any[];
        weight: any[];
    }>({
        base: [],
        flavour: [],
        shape: [],
        weight: [],
    });

    // Selection State
    const [selections, setSelections] = useState<{
        base: number | null;
        flavour: number | null;
        shape: number | null;
        weight: number | null;
    }>({ base: null, flavour: null, shape: null, weight: null });

    const [message, setMessage] = useState('');
    const [calculatedPrice, setCalculatedPrice] = useState(500);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [baseRes, flavourRes, shapeRes, weightRes] = await Promise.all([
                    apiClient.get('/api/catalog/cake-bases/'),
                    apiClient.get('/api/catalog/cake-flavours/'),
                    apiClient.get('/api/catalog/cake-shapes/'),
                    apiClient.get('/api/catalog/cake-weights/'),
                ]);

                setOptions({
                    base: baseRes.data,
                    flavour: flavourRes.data,
                    shape: shapeRes.data,
                    weight: weightRes.data,
                });
            } catch (error) {
                console.error('Error fetching options:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOptions();
    }, []);

    const calculatePrice = () => {
        let total = 500; // Base price

        // Helper to get price safely
        const getPrice = (category: keyof typeof options, id: number | null) => {
            if (!id) return 0;
            const opt = options[category].find((o: any) => o.id === id);
            return opt ? parseFloat(opt.price) : 0;
        };

        total += getPrice('base', selections.base);
        total += getPrice('flavour', selections.flavour);
        total += getPrice('shape', selections.shape);
        total += getPrice('weight', selections.weight);

        setCalculatedPrice(total);
    };

    useEffect(() => {
        calculatePrice();
    }, [selections, options]);

    if (isLoadingSettings) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
        );
    }

    if (!isCustomCakeEnabled) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden text-center p-8">
                    <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl text-orange-600">🎂</span>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Coming Soon!</h2>
                    <p className="text-gray-600 mb-8">
                        Our custom cake builder is currently being baked to perfection.
                        Please check back later or explore our delicious ready-made cakes.
                    </p>
                    <button
                        onClick={() => router.push('/products')}
                        className="inline-block w-full px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition duration-200"
                    >
                        Browse Products
                    </button>
                </div>
            </div>
        );
    }

    const selectOption = (category: keyof typeof selections, id: number) => {
        setSelections(prev => ({
            ...prev,
            [category]: prev[category] === id ? null : id
        }));
    };



    const handleAddToCart = () => {
        // Validation
        if (!selections.base || !selections.flavour || !selections.shape || !selections.weight) {
            alert('Please select one option from each category.');
            return;
        }

        const getLabel = (category: keyof typeof options, id: number | null) => {
            const opt = options[category].find((o: any) => o.id === id);
            return opt ? opt.label || opt.name : '';
        };

        const selectedLabels = [
            getLabel('base', selections.base),
            getLabel('flavour', selections.flavour),
            getLabel('shape', selections.shape),
            getLabel('weight', selections.weight),
        ].join(', ');

        const selectedIds = [
            selections.base,
            selections.flavour,
            selections.shape,
            selections.weight
        ];

        addItem({
            type: 'custom',
            productName: 'Custom Cake',
            quantity: 1,
            unitPrice: calculatedPrice,
            customConfig: { options: selectedIds, labels: selectedLabels },
            messageOnCake: message,
        });

        router.push('/cart');
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading options...</div>;
    }

    const renderOptionGrid = (category: keyof typeof options) => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {options[category].map((option: any) => (
                <button
                    key={option.id}
                    onClick={() => selectOption(category as any, option.id)}
                    className={`p-4 border-2 rounded-lg transition-all text-left ${selections[category as keyof typeof selections] === option.id
                        ? 'border-orange-600 bg-orange-50'
                        : 'border-gray-300 hover:border-orange-300'
                        }`}
                >
                    <div className="font-semibold">{option.label || option.name}</div>
                    <div className="text-sm text-gray-600">+₹{option.price}</div>
                </button>
            ))}
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
            {/* Header */}
            {/* <Navbar /> handled by Layout */}

            <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-8">Build Your Custom Cake</h1>

                {/* Progress Steps */}
                <div className="flex justify-between mb-8">
                    {['Base', 'Flavour', 'Shape', 'Weight', 'Message'].map((label, idx) => (
                        <div
                            key={label}
                            className={`flex-1 text-center ${step > idx + 1 ? 'text-green-600' : step === idx + 1 ? 'text-orange-600' : 'text-gray-400'
                                }`}
                        >
                            <div
                                className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-2 ${step > idx + 1
                                    ? 'bg-green-600 text-white'
                                    : step === idx + 1
                                        ? 'bg-orange-600 text-white'
                                        : 'bg-gray-300'
                                    }`}
                            >
                                {idx + 1}
                            </div>
                            <span className="text-sm font-medium">{label}</span>
                        </div>
                    ))}
                </div>

                {/* Step Content */}
                <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
                    {step === 1 && (
                        <div>
                            <h2 className="text-2xl font-bold mb-4">Choose Your Base</h2>
                            {renderOptionGrid('base')}
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <h2 className="text-2xl font-bold mb-4">Choose Your Flavour</h2>
                            {renderOptionGrid('flavour')}
                        </div>
                    )}

                    {step === 3 && (
                        <div>
                            <h2 className="text-2xl font-bold mb-4">Choose Shape</h2>
                            {renderOptionGrid('shape')}
                        </div>
                    )}

                    {step === 4 && (
                        <div>
                            <h2 className="text-2xl font-bold mb-4">Choose Weight</h2>
                            {renderOptionGrid('weight')}
                        </div>
                    )}

                    {step === 5 && (
                        <div>
                            <h2 className="text-2xl font-bold mb-4">Add a Message (Optional)</h2>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Enter your message on cake..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                rows={4}
                                maxLength={50}
                            />
                            <p className="text-sm text-gray-500 mt-2">{message.length}/50 characters</p>
                        </div>
                    )}
                </div>

                {/* Price Display */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <div className="flex justify-between items-center">
                        <span className="text-xl font-semibold">Estimated Price:</span>
                        <span className="text-3xl font-bold text-orange-600">₹{calculatedPrice}</span>
                    </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between">
                    <button
                        onClick={() => setStep(Math.max(1, step - 1))}
                        disabled={step === 1}
                        className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>

                    {step < 5 ? (
                        <button
                            onClick={() => setStep(step + 1)}
                            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            onClick={handleAddToCart}
                            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                            Add to Cart
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
