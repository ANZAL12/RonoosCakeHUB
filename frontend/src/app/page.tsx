'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

export default function Home() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Header */}
      {/* Header: Removed, using global Navbar from layout */}

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-6">
          Artisan Cakes Made with Love
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          From classic favorites to custom creations, we bake fresh daily with the finest ingredients.
          Order online for delivery or pickup!
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/products"
            className="px-8 py-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-lg font-semibold"
          >
            Browse Products
          </Link>
          <Link
            href="/custom-cake"
            className="px-8 py-4 bg-white text-orange-600 border-2 border-orange-600 rounded-lg hover:bg-orange-50 text-lg font-semibold"
          >
            Build Custom Cake
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-5xl mb-4">🎂</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Fresh Daily</h3>
            <p className="text-gray-600">
              All our cakes are baked fresh every day using premium ingredients and traditional recipes.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-5xl mb-4">✨</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Custom Designs</h3>
            <p className="text-gray-600">
              Create your dream cake with our custom cake builder. Choose flavors, shapes, and add messages!
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-5xl mb-4">🚚</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Fast Delivery</h3>
            <p className="text-gray-600">
              Choose home delivery or store pickup. We deliver fresh cakes right to your doorstep!
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl shadow-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Order?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join hundreds of happy customers who trust Ronoos BakeHub for their celebrations!
          </p>
          {!user && (
            <Link
              href="/register"
              className="inline-block px-8 py-4 bg-white text-orange-600 rounded-lg hover:bg-gray-100 text-lg font-semibold"
            >
              Get Started Today
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-gray-600">
          <p>&copy; 2024 Ronoos BakeHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
