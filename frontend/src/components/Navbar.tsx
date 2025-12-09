'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { totalItems } = useCart();

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                <Link href="/" className="text-3xl font-bold text-orange-600">
                    Ronoos BakeHub
                </Link>
                <nav className="flex gap-6 items-center">
                    <Link href="/products" className="text-gray-700 hover:text-orange-600 font-medium">
                        Products
                    </Link>
                    <Link href="/custom-cake" className="text-gray-700 hover:text-orange-600 font-medium">
                        Custom Cake
                    </Link>
                    {user ? (
                        <>
                            {user.role === 'baker' ? (
                                <Link href="/baker/dashboard" className="text-gray-700 hover:text-orange-600 font-medium">
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link href="/orders" className="text-gray-700 hover:text-orange-600 font-medium">
                                        My Orders
                                    </Link>
                                    <Link href="/cart" className="relative text-gray-700 hover:text-orange-600 font-medium">
                                        Cart
                                        {totalItems > 0 && (
                                            <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                                {totalItems}
                                            </span>
                                        )}
                                    </Link>
                                    <Link
                                        href="/profile"
                                        className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center hover:bg-orange-200 transition overflow-hidden border border-orange-200"
                                        title={user.name}
                                    >
                                        {user.profile_picture ? (
                                            <img
                                                src={user.profile_picture}
                                                alt={user.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-orange-600 font-semibold text-sm">
                                                {user.name.charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                    </Link>
                                </>
                            )}
                            <button
                                onClick={logout}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="text-gray-700 hover:text-orange-600 font-medium">
                                Login
                            </Link>
                            <Link
                                href="/register"
                                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                            >
                                Register
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}
