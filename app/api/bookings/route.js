// -------------------------------------------------------------------
// /app/api/bookings/route.js <- CORRECTED
// -------------------------------------------------------------------
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '../../../utils/db';
import Booking from '../../../models/Booking';
import User from '../../../models/User';
import { calculateAmountDue } from '../../../utils/pricing';

export const dynamic = 'force-dynamic';

export async function GET() {
  await connectDB();
  const authorization = headers().get('authorization');
  let user = null;
  if (authorization && authorization.startsWith('Bearer ')) {
    const token = authorization.split(' ')[1];
    try { user = jwt.verify(token, process.env.JWT_SECRET); } catch (error) { user = null; }
  }

  if (!user) {
    return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 401 });
  }

  try {
    let bookings;
    // --- FIX START: Added specific logic for technicians ---
    if (user.role === 'admin') {
      // Admin gets all bookings
      bookings = await Booking.find({}).populate('customer').populate('technician');
    } else if (user.role === 'technician') {
      // Technician gets bookings assigned to them
      bookings = await Booking.find({ technician: user.userId }).populate('customer');
    } else { // Customer
      // Customer gets their own bookings
      bookings = await Booking.find({ customer: user.userId }).populate('technician');
    }
    // --- FIX END ---
    return NextResponse.json({ success: true, data: bookings });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}

// POST method remains the same
export async function POST(request) {
  await connectDB();

  const authorization = headers().get('authorization');
  let user = null;
  if (authorization && authorization.startsWith('Bearer ')) {
    const token = authorization.split(' ')[1];
    try { user = jwt.verify(token, process.env.JWT_SECRET); } catch (error) { user = null; }
  }

  if (!user) return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 401 });
  if (user.role === 'admin') return NextResponse.json({ success: false, message: 'Admin users cannot book services.' }, { status: 403 });

  try {
    const { serviceType, address, bookingDate, wantsSubscription, payment } = await request.json();
    
    // Validate required fields
    if (!serviceType || !address || !bookingDate) {
      return NextResponse.json({ success: false, message: 'Service type, address, and booking date are required.' }, { status: 400 });
    }

    // Validate payment method is provided
    if (!payment || !payment.method) {
      return NextResponse.json({ success: false, message: 'Payment method is required to create a booking.' }, { status: 400 });
    }

    // Validate payment method value
    const validPaymentMethods = ['Easypaisa', 'Jazzcash', 'Easypaisa/Jazzcash', 'Cash on Delivery'];
    if (!validPaymentMethods.includes(payment.method)) {
      return NextResponse.json({ success: false, message: 'Invalid payment method selected.' }, { status: 400 });
    }

    // Validate transaction ID for Easypaisa/Jazzcash
    if (payment.method === 'Easypaisa/Jazzcash' && !payment.paymentId) {
      return NextResponse.json({ success: false, message: 'Transaction ID (TID) is required for Easypaisa/Jazzcash payment.' }, { status: 400 });
    }

    const subscriptionSelected = serviceType === 'Solar Panel Cleaning' && Boolean(wantsSubscription);
    
    const bookingData = { 
        serviceType, 
        address, 
        bookingDate, 
        customer: user.userId,
        isSubscriptionBooking: subscriptionSelected,
        amountDue: calculateAmountDue(serviceType, subscriptionSelected),
        payment: {
            method: payment.method,
            status: payment.status || 'Pending',
            ...(payment.paymentId && { paymentId: payment.paymentId })
        }
    };

    const booking = await Booking.create(bookingData);
    return NextResponse.json({ success: true, data: booking }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
