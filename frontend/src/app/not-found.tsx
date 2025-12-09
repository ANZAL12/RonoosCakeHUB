import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="flex flex-col items-center justify-center py-24">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h2>
                <p className="text-gray-600 mb-8">Could not find requested resource</p>
                <Link
                    href="/"
                    className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                >
                    Return Home
                </Link>
            </div>
        </div>
    );
}
