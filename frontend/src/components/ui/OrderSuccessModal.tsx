import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle } from 'lucide-react';

interface OrderSuccessModalProps {
    isOpen: boolean;
    orderId: string | number;
    onClose: () => void;
    onContinueShopping?: () => void;
}

export default function OrderSuccessModal({ isOpen, orderId, onClose, onContinueShopping }: OrderSuccessModalProps) {
    useEffect(() => {
        if (isOpen) {
            // Trigger firecrackers animation
            const duration = 3000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 60 };

            const randomInRange = (min: number, max: number) => {
                return Math.random() * (max - min) + min;
            }

            const interval: any = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);

                // since particles fall down, start a bit higher than random
                confetti({
                    ...defaults,
                    particleCount,
                    origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
                });
                confetti({
                    ...defaults,
                    particleCount,
                    origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
                });
            }, 250);

            return () => clearInterval(interval);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 animate-in fade-in zoom-in duration-300 p-8 text-center relative overflow-hidden">
                <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-2">Order Placed!</h2>
                <p className="text-gray-600 mb-6">
                    Thank you for your order. Your order ID is <span className="font-bold text-gray-900">#{orderId}</span>
                </p>

                <div className="space-y-3">
                    <button
                        onClick={onClose}
                        className="w-full bg-orange-600 text-white py-3 rounded-xl hover:bg-orange-700 font-semibold transition shadow-lg shadow-orange-200"
                    >
                        View Order Details
                    </button>
                    <button
                        onClick={onContinueShopping || onClose}
                        className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 font-semibold transition"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        </div>
    );
}
