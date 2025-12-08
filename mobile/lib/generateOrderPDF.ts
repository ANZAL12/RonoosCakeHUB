import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

export const generateOrderPDF = async (order: any) => {
    try {
        const html = `
            <html>
            <head>
                <style>
                    body { font-family: 'Helvetica', sans-serif; padding: 20px; }
                    h1 { color: #ea580c; text-align: center; }
                    .header { margin-bottom: 20px; border-bottom: 2px solid #ea580c; padding-bottom: 10px; }
                    .section-title { font-size: 16px; font-weight: bold; margin-top: 20px; margin-bottom: 5px; color: #374151; }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f3f4f6; font-weight: bold; }
                    .total-row { font-weight: bold; background-color: #fff7ed; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Ronoos BakeHub - Order #${order.id}</h1>
                    <p style="text-align: center; color: #6b7280;">${new Date(order.created_at).toLocaleString()}</p>
                </div>

                <div class="section-title">Customer Details</div>
                <table>
                    <tr><th>Name</th><td>${order.user?.name || 'Unknown'}</td></tr>
                    <tr><th>Phone</th><td>${order.user?.phone || 'Not provided'}</td></tr>
                    <tr><th>Email</th><td>${order.user?.email || 'Not provided'}</td></tr>
                    <tr><th>Location</th><td>${order.user?.place || 'Not provided'}</td></tr>
                </table>

                <div class="section-title">Order Items</div>
                <table>
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Qty</th>
                            <th>Price</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map((item: any) => `
                            <tr>
                                <td>
                                    ${item.product_variant ? item.product_variant.product.name : item.product?.name}
                                    ${item.product_variant ? `<br><small>${item.product_variant.label}</small>` : ''}
                                </td>
                                <td>${item.quantity}</td>
                                <td>₹${item.unit_price || 0}</td>
                                <td>₹${item.subtotal}</td>
                            </tr>
                        `).join('')}
                        <tr class="total-row">
                            <td colspan="3" style="text-align: right;">Total Amount</td>
                            <td>₹${order.final_amount}</td>
                        </tr>
                    </tbody>
                </table>

                <div class="section-title">Order Status</div>
                <table>
                    <tr><th>Status</th><td style="text-transform: uppercase;">${order.status}</td></tr>
                    <tr><th>Payment</th><td style="text-transform: uppercase;">${order.payment_status}</td></tr>
                </table>
            </body>
            </html>
        `;

        const { uri } = await Print.printToFileAsync({ html });
        console.log('File has been saved to:', uri);
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
        console.error('Error generating PDF:', error);
        Alert.alert('Error', 'Failed to generate PDF');
    }
};
