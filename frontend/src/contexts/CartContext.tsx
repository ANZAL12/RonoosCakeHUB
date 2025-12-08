'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface CartItem {
    id: string;
    type: 'product' | 'custom';
    productId?: number;
    variantId?: number;
    productName: string;
    variantLabel?: string;
    quantity: number;
    unitPrice: number;
    customConfig?: any;
    messageOnCake?: string;
}

interface CartContextType {
    items: CartItem[];
    addItem: (item: Omit<CartItem, 'id'>) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [mounted, setMounted] = useState(false);

    // Load cart from localStorage on mount (client-side only)
    useEffect(() => {
        setMounted(true);
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart));
            } catch (e) {
                console.error('Failed to parse cart from localStorage', e);
            }
        }
    }, []);

    // Save cart to localStorage whenever it changes (only after mounted)
    useEffect(() => {
        if (mounted) {
            localStorage.setItem('cart', JSON.stringify(items));
        }
    }, [items, mounted]);

    const addItem = (item: Omit<CartItem, 'id'>) => {
        // Generate stable ID - only use random for custom cakes without variant
        const id = `${item.type}-${item.productId || 'custom'}-${item.variantId || 'novariant'}`;
        setItems((prev) => {
            const existing = prev.find((i) => i.id === id);
            if (existing) {
                return prev.map((i) =>
                    i.id === id ? { ...i, quantity: i.quantity + item.quantity } : i
                );
            }
            return [...prev, { ...item, id }];
        });
    };

    const removeItem = (id: string) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
    };

    const updateQuantity = (id: string, quantity: number) => {
        if (quantity <= 0) {
            removeItem(id);
            return;
        }
        setItems((prev) =>
            prev.map((item) => (item.id === id ? { ...item, quantity } : item))
        );
    };

    const clearCart = () => {
        setItems([]);
        if (typeof window !== 'undefined') {
            localStorage.removeItem('cart');
        }
    };

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

    return (
        <CartContext.Provider
            value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalAmount }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
}
