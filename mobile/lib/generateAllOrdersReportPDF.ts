import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

export const generateAllOrdersReportPDF = async (orders: any[]) => {
    try {
        const rows = orders.map(order => {
            const items = order.items.map((i: any) =>
                `${i.quantity}x ${i.product_variant ? i.product_variant?.product?.name : i.product?.name || 'Unknown Item'}`
            ).join('<br>');

            return `
                <tr>
                    <td>#${order.id}</td>
                    <td>
                        <b>${order.user?.name || 'Unknown'}</b><br>
                        <small>${order.user?.place || ''}</small>
                    </td>
                    <td>${order.user?.phone || '-'}</td>
                    <td>${items}</td>
                    <td>${new Date(order.created_at).toLocaleDateString()}</td>
                    <td style="text-transform: uppercase;">${order.status}</td>
                    <td><b>₹${order.final_amount}</b></td>
                </tr>
            `;
        }).join('');

        const html = `
            <html>
            <head>
                <style>
                    body { font-family: 'Helvetica', sans-serif; padding: 20px; font-size: 12px; }
                    h1 { color: #ea580c; text-align: center; margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; vertical-align: top; }
                    th { background-color: #f3f4f6; font-weight: bold; color: #374151; }
                    tr:nth-child(even) { background-color: #f9fafb; }
                </style>
            </head>
            <body>
                <h1>Ronoos BakeHub - Completed Orders Report</h1>
                <p style="text-align: center; color: #6b7280; margin-bottom: 20px;">Generated on ${new Date().toLocaleString()}</p>
                
                <table>
                    <thead>
                        <tr>
                            <th style="width: 50px;">ID</th>
                            <th style="width: 120px;">Customer</th>
                            <th style="width: 100px;">Phone</th>
                            <th>Items</th>
                            <th style="width: 80px;">Date</th>
                            <th style="width: 80px;">Status</th>
                            <th style="width: 80px;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </body>
            </html>
        `;

        const { uri } = await Print.printToFileAsync({ html });
        console.log('Report saved to:', uri);
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
        console.error('Error generating report PDF:', error);
        Alert.alert('Error', 'Failed to generate report PDF');
    }
};
