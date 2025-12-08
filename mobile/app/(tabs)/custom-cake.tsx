import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useCartStore } from '../../store/cartStore';
import { api } from '../../lib/api';

interface CakeOption {
    id: number;
    name?: string;
    label?: string;
    price: number | string; // Handle both types as API might return string
}

interface OptionsState {
    base: CakeOption[];
    flavour: CakeOption[];
    shape: CakeOption[];
    weight: CakeOption[];
}

export default function CustomCakeScreen() {
    const router = useRouter();
    const addItem = useCartStore(state => state.addItem);
    const [step, setStep] = useState(1);
    const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
    const [message, setMessage] = useState('');
    const [options, setOptions] = useState<OptionsState>({
        base: [],
        flavour: [],
        shape: [],
        weight: [],
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchOptions();
    }, []);

    const fetchOptions = async () => {
        try {
            const [baseRes, flavourRes, shapeRes, weightRes] = await Promise.all([
                api.get('/catalog/cake-bases/'),
                api.get('/catalog/cake-flavours/'),
                api.get('/catalog/cake-shapes/'),
                api.get('/catalog/cake-weights/'),
            ]);

            setOptions({
                base: baseRes.data,
                flavour: flavourRes.data,
                shape: shapeRes.data,
                weight: weightRes.data,
            });
        } catch (error) {
            console.error('Error fetching cake options:', error);
            Alert.alert('Error', 'Failed to load cake options. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleOption = (optionId: number) => {
        setSelectedOptions((prev) => {
            // For single selection per category logic (optional but good UI)
            // But current logic allows multiple selections or needs refinement?
            // The original logic was:
            const newOptions = prev.includes(optionId)
                ? prev.filter((id) => id !== optionId)
                : [...prev, optionId];

            // To properly enforce single selection per step, we need to know which category this ID belongs to.
            // But since IDs are unique across tables only if they are global, here they are from different tables so IDs might collide (1 from Base, 1 from Flavour).
            // This is a potential bug in the Original Design unless IDs are unique or handled separately.
            // Backend IDs will start from 1 for EACH table.

            // FIX: We need to store selections per category instead of a flat list of IDs.
            return newOptions;
        });
    };

    // REFACTORED SELECTION LOGIC
    // We'll store selectedOption as an object { base: id, flavour: id, ... }
    const [selections, setSelections] = useState<{
        base: number | null;
        flavour: number | null;
        shape: number | null;
        weight: number | null;
    }>({ base: null, flavour: null, shape: null, weight: null });

    const selectOption = (category: keyof OptionsState, id: number) => {
        setSelections(prev => ({ ...prev, [category]: id }));
    };

    const calculatePrice = (): number => {
        let totalPrice = 500; // Base price

        // Helper to find price
        const getPrice = (category: keyof OptionsState, id: number | null) => {
            if (!id) return 0;
            const opt = options[category].find(o => o.id === id);
            return opt ? parseFloat(opt.price.toString()) : 0;
        };

        totalPrice += getPrice('base', selections.base);
        totalPrice += getPrice('flavour', selections.flavour);
        totalPrice += getPrice('shape', selections.shape);
        totalPrice += getPrice('weight', selections.weight);

        return totalPrice;
    };


    const handleAddToCart = () => {
        const getLabel = (category: keyof OptionsState, id: number | null) => {
            if (!id) return '';
            const opt = options[category].find(o => o.id === id);
            return opt ? (opt.label || opt.name) : '';
        };

        const selectedLabels = [
            getLabel('base', selections.base),
            getLabel('flavour', selections.flavour),
            getLabel('shape', selections.shape),
            getLabel('weight', selections.weight),
        ].filter(Boolean).join(', ');

        const price = calculatePrice();

        addItem({
            id: Date.now(),
            name: 'Custom Cake',
            price: price.toString(),
            description: selectedLabels,
            quantity: 1,
        } as any);

        Alert.alert('Success', 'Custom cake added to cart!', [
            { text: 'Continue Shopping', onPress: () => router.back() },
            { text: 'Go to Cart', onPress: () => router.push('/(tabs)/cart') }
        ]);
    };

    const renderOptions = (category: keyof OptionsState) => (
        <View className="flex-row flex-wrap gap-2">
            {options[category].map((option) => (
                <TouchableOpacity
                    key={option.id}
                    onPress={() => selectOption(category, option.id)}
                    className={`px-4 py-3 rounded-lg border-2 ${selections[category] === option.id
                        ? 'border-orange-600 bg-orange-50'
                        : 'border-gray-300 bg-white'
                        }`}
                >
                    <Text className={`font-semibold ${selections[category] === option.id ? 'text-orange-600' : 'text-gray-700'
                        }`}>
                        {option.label || option.name}
                    </Text>
                    <Text className="text-sm text-gray-600">+₹{option.price}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    return (
        <View className="flex-1 bg-gray-50">
            <ScrollView className="flex-1 px-4 pt-4">
                <Text className="text-3xl font-bold text-gray-900 mb-6">Build Your Custom Cake</Text>

                {/* Progress Steps */}
                <View className="flex-row justify-between mb-6">
                    {['Base', 'Flavour', 'Shape', 'Weight', 'Message'].map((label, idx) => (
                        <View key={label} className="items-center flex-1">
                            <View
                                className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${step > idx + 1
                                    ? 'bg-green-600'
                                    : step === idx + 1
                                        ? 'bg-orange-600'
                                        : 'bg-gray-300'
                                    }`}
                            >
                                <Text className={step >= idx + 1 ? 'text-white text-xs font-bold' : 'text-gray-600 text-xs'}>
                                    {idx + 1}
                                </Text>
                            </View>
                            <Text className={`text-xs ${step > idx + 1 ? 'text-green-600' : step === idx + 1 ? 'text-orange-600' : 'text-gray-400'
                                }`}>
                                {label}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Step Content */}
                <View className="bg-white rounded-lg shadow-sm p-6 mb-4">
                    {step === 1 && (
                        <View>
                            <Text className="text-xl font-bold mb-4">Choose Your Base</Text>
                            {renderOptions('base')}
                        </View>
                    )}

                    {step === 2 && (
                        <View>
                            <Text className="text-xl font-bold mb-4">Choose Your Flavour</Text>
                            {renderOptions('flavour')}
                        </View>
                    )}

                    {step === 3 && (
                        <View>
                            <Text className="text-xl font-bold mb-4">Choose Shape</Text>
                            {renderOptions('shape')}
                        </View>
                    )}

                    {step === 4 && (
                        <View>
                            <Text className="text-xl font-bold mb-4">Choose Weight</Text>
                            {renderOptions('weight')}
                        </View>
                    )}

                    {step === 5 && (
                        <View>
                            <Text className="text-xl font-bold mb-4">Add a Message (Optional)</Text>
                            <TextInput
                                value={message}
                                onChangeText={setMessage}
                                placeholder="Enter your message on cake..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                                multiline
                                numberOfLines={4}
                                maxLength={50}
                            />
                            <Text className="text-sm text-gray-500 mt-2">{message.length}/50 characters</Text>
                        </View>
                    )}
                </View>

                {/* Price Display */}
                <View className="bg-white rounded-lg shadow-sm p-6 mb-4">
                    <View className="flex-row justify-between items-center">
                        <Text className="text-lg font-semibold">Estimated Price:</Text>
                        <Text className="text-2xl font-bold text-orange-600">₹{calculatePrice()}</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Navigation Buttons */}
            <View className="flex-row justify-between p-4 bg-white border-t border-gray-200">
                <TouchableOpacity
                    onPress={() => setStep(Math.max(1, step - 1))}
                    disabled={step === 1}
                    className={`px-6 py-3 rounded-lg ${step === 1 ? 'bg-gray-200' : 'bg-gray-300'
                        }`}
                >
                    <Text className={step === 1 ? 'text-gray-400' : 'text-gray-700'}>Previous</Text>
                </TouchableOpacity>

                {step < 5 ? (
                    <TouchableOpacity
                        onPress={() => setStep(step + 1)}
                        className="px-6 py-3 bg-orange-600 rounded-lg"
                    >
                        <Text className="text-white font-bold">Next</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        onPress={handleAddToCart}
                        className="px-6 py-3 bg-green-600 rounded-lg"
                    >
                        <Text className="text-white font-bold">Add to Cart</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}
