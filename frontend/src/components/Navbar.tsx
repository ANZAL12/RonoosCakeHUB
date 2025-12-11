'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useState, useEffect } from 'react';
import apiClient from '@/lib/api';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { totalItems } = useCart();
    const pathname = usePathname();

    const getLinkClass = (path: string) => {
        const baseClass = "text-gray-700 hover:text-orange-600 font-medium";
        const activeClass = "text-orange-600 font-bold pointer-events-none cursor-default";
        return pathname === path ? activeClass : baseClass;
    };

    const [isCustomCakeEnabled, setIsCustomCakeEnabled] = useState(true);

    useEffect(() => {
        // Fetch baker settings to know if custom cake is enabled
        apiClient.get('/api/users/baker-settings/')
            .then(res => {
                if (res.data.is_custom_build_enabled !== undefined) {
                    setIsCustomCakeEnabled(res.data.is_custom_build_enabled);
                }
            })
            .catch(err => console.error('Failed to fetch baker settings', err));
    }, []);

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                <Link href={user?.role === 'baker' ? "/baker/dashboard" : "/"} className="text-3xl font-bold text-orange-600">
                    Ronoos BakeHub
                </Link>
                <nav className="flex gap-6 items-center">
                    {user?.role === 'baker' ? (
                        <>
                            <Link href="/baker/dashboard" className={getLinkClass("/baker/dashboard")} aria-disabled={pathname === "/baker/dashboard"}>
                                Dashboard
                            </Link>
                            <Link href="/baker/products" className={getLinkClass("/baker/products")} aria-disabled={pathname === "/baker/products"}>
                                Products
                            </Link>
                            <Link href="/baker/orders" className={getLinkClass("/baker/orders")} aria-disabled={pathname === "/baker/orders"}>
                                Orders
                            </Link>
                            <Link href="/baker/analytics" className={getLinkClass("/baker/analytics")} aria-disabled={pathname === "/baker/analytics"}>
                                Analytics
                            </Link>
                            <Link
                                href="/profile"
                                className={`w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center hover:bg-orange-200 transition overflow-hidden border border-orange-200 ${pathname === '/profile' ? 'ring-2 ring-orange-600 pointer-events-none' : ''}`}
                                title={user.name}
                                aria-disabled={pathname === "/profile"}
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
                            <button
                                onClick={logout}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/products" className={getLinkClass("/products")} aria-disabled={pathname === "/products"}>
                                Products
                            </Link>
                            {isCustomCakeEnabled && (
                                <Link href="/custom-cake" className={getLinkClass("/custom-cake")} aria-disabled={pathname === "/custom-cake"}>
                                    Custom Cake
                                </Link>
                            )}
                            {user ? (
                                <>
                                    <Link href="/orders" className={getLinkClass("/orders")} aria-disabled={pathname === "/orders"}>
                                        My Orders
                                    </Link>
                                    <Link href="/cart" className={`relative font-medium ${pathname === '/cart' ? 'text-orange-600 font-bold pointer-events-none cursor-default' : 'text-gray-700 hover:text-orange-600'}`} aria-disabled={pathname === "/cart"}>
                                        Cart
                                        {totalItems > 0 && (
                                            <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                                {totalItems}
                                            </span>
                                        )}
                                    </Link>
                                    <Link
                                        href="/profile"
                                        className={`w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center hover:bg-orange-200 transition overflow-hidden border border-orange-200 ${pathname === '/profile' ? 'ring-2 ring-orange-600 pointer-events-none' : ''}`}
                                        title={user.name}
                                        aria-disabled={pathname === "/profile"}
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
                                    <button
                                        onClick={logout}
                                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link href="/login" className={getLinkClass("/login")} aria-disabled={pathname === "/login"}>
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
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}
