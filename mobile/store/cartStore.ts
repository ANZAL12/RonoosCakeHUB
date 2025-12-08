import { create } from 'zustand';

export interface ProductVariant {
    id: number;
    label: string;
    price: string;
    preparation_hours: string;
    is_eggless: boolean;
}

export interface Product {
    id: number;
    name: string;
    price: string;
    image?: string;
    images?: { image: string }[];
    description?: string;
    variants?: ProductVariant[];
}

export interface CartItem extends Product {
    quantity: number;
    variant_id?: number;
    variant_label?: string;
}

interface CartState {
    items: CartItem[];
    addItem: (product: Product, quantity?: number) => void;
    removeItem: (productId: number) => void;
    updateQuantity: (productId: number, quantity: number) => void;
    clearCart: () => void;
    getTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
    items: [],

    addItem: (product, quantity = 1) => {
        const items = get().items;
        const existingItem = items.find(item => item.id === product.id);

        if (existingItem) {
            const updatedItems = items.map(item =>
                item.id === product.id
                    ? { ...item, quantity: item.quantity + quantity }
                    : item
            );
            set({ items: updatedItems });
        } else {
            set({ items: [...items, { ...product, quantity }] });
        }
    },

    removeItem: (productId) => {
        set({ items: get().items.filter(item => item.id !== productId) });
    },

    updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
            get().removeItem(productId);
            return;
        }
        set({
            items: get().items.map(item =>
                item.id === productId ? { ...item, quantity } : item
            ),
        });
    },

    clearCart: () => set({ items: [] }),

    getTotal: () => {
        return get().items.reduce((total, item) => {
            return total + (parseFloat(item.price) * item.quantity);
        }, 0);
    },
}));
