'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api';
import { useEffect } from 'react';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function BakerOrdersPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        if (user && user.role !== 'baker') {
            router.push('/');
        }
    }, [user, router]);

    const { data: orders, isLoading } = useQuery({
        queryKey: ['baker-orders'],
        queryFn: async () => {
            const response = await apiClient.get('/api/orders/');
            return response.data;
        },
        enabled: !!user && user.role === 'baker',
    });

    // Ensure orders is always an array
    const ordersArray = Array.isArray(orders) ? orders : [];
    const filteredOrders = ordersArray.filter((order: any) =>
        statusFilter === 'all' || order.status === statusFilter
    );

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800',
            confirmed: 'bg-blue-100 text-blue-800',
            in_kitchen: 'bg-purple-100 text-purple-800',
            ready: 'bg-green-100 text-green-800',
            out_for_delivery: 'bg-indigo-100 text-indigo-800',
            completed: 'bg-green-600 text-white',
            cancelled: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const generatePDF = () => {
        const doc = new jsPDF();

        // Filter ONLY completed orders for the report
        const completedOrders = ordersArray.filter((o: any) => o.status === 'completed');

        if (completedOrders.length === 0) {
            alert('No completed orders to generate report for.');
            return;
        }

        // Add Header
        doc.setFontSize(20);
        doc.text('All Orders Report', 14, 22);
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

        // Prepare Table Data
        const tableData = completedOrders.map((order: any) => [
            order.id,
            new Date(order.created_at).toLocaleDateString(),
            order.user?.name || 'N/A',
            order.user?.phone || 'N/A',
            order.items?.map((i: any) => i.product_name).join(', ') || '',
            `Rs. ${order.final_amount}`
        ]);

        autoTable(doc, {
            head: [['Order ID', 'Date', 'Customer Name', 'Phone', 'Items', 'Total Amount']],
            body: tableData,
            startY: 40,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [234, 88, 12] }, // Orange-600
        });

        doc.save('orders_report.pdf');
    };

    if (user && user.role !== 'baker') {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <Link href="/baker/dashboard" className="text-orange-600 hover:text-orange-700">
                        ← Back to Dashboard
                    </Link>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>

                    <div className="flex gap-4">
                        <button
                            onClick={generatePDF}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                        >
                            <span>📄</span> Download All Orders Report
                        </button>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        >
                            <option value="all">All Orders</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="in_kitchen">In Kitchen</option>
                            <option value="ready">Ready</option>
                            <option value="out_for_delivery">Out for Delivery</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>

                {isLoading ? (
                    <div className="text-center py-12">Loading orders...</div>
                ) : filteredOrders && filteredOrders.length > 0 ? (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Order ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Phone
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredOrders.map((order: any) => (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            #{order.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {order.user?.name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {order.user?.phone || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {new Date(order.created_at).toLocaleDateString('en-IN')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-orange-600">
                                            ₹{order.final_amount}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                                                {order.status.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <Link
                                                href={`/baker/orders/${order.id}`}
                                                className="text-orange-600 hover:text-orange-700 font-medium"
                                            >
                                                View Details
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <p className="text-gray-600">No orders found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
