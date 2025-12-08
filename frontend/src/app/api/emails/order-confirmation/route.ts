import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
    try {
        const { order, customer } = await request.json();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Prepare items list
        const itemsList = order.items.map((item: any) => {
            const variantLabel = item.product_variant ? ` (${item.product_variant.label})` : '';
            return `${item.product.name}${variantLabel} x ${item.quantity} = ₹${item.subtotal}`;
        }).join('\n');

        // Customer Email
        const customerMailOptions = {
            from: `"Ronoos BakeHub" <${process.env.EMAIL_USER}>`,
            to: customer.email,
            subject: `Order Confirmed: Order #${order.id} at Ronoos BakeHub`,
            text: `
Hi ${customer.name},

Your order has been confirmed! 🎉

Thank you for choosing Ronoos BakeHub. We have received your order and it is now being processed.

Order ID: ${order.id}
Current Status: ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}

Items:
${itemsList}

Total Amount: ₹${order.final_amount}

Delivery Type: ${order.delivery_type}
Delivery Date: ${order.delivery_date}
Delivery Slot: ${order.delivery_slot}

We will update you once your order moves to the next stage.

Thank you for supporting us 🙏
— Ronoos BakeHub
            `,
        };

        // Baker Email
        const bakerMailOptions = {
            from: `"Ronoos BakeHub" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // Send to self/admin
            subject: 'New bakery order received',
            text: `
New Order Alert 🚨

Order ID: ${order.id}
Customer Name: ${customer.name}
Customer Phone: ${customer.phone}
Customer Email: ${customer.email}

Delivery Type: ${order.delivery_type}
Delivery Date: ${order.delivery_date}
Delivery Slot: ${order.delivery_slot}

Items:
${itemsList}

Total: ₹${order.final_amount}

Please check the baker dashboard to manage this order.
            `,
        };

        // Send emails
        await Promise.all([
            transporter.sendMail(customerMailOptions),
            transporter.sendMail(bakerMailOptions)
        ]);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Email sending failed:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            envUserSet: !!process.env.EMAIL_USER,
            envPassSet: !!process.env.EMAIL_PASS
        });
        return NextResponse.json({
            error: 'Failed to send emails',
            details: error.message
        }, { status: 500 });
    }
}
