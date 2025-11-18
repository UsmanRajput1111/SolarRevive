import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '../../../../utils/db';
import Booking from '../../../../models/Booking';

export const dynamic = 'force-dynamic';

export async function PUT(request, { params }) {
  await connectDB();
  const { id } = params;

  const authorization = headers().get('authorization');
  let user = null;
  if (authorization && authorization.startsWith('Bearer ')) {
    const token = authorization.split(' ')[1];
    try { user = jwt.verify(token, process.env.JWT_SECRET); } catch (error) { user = null; }
  }

  if (!user) return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 401 });

  try {
    const body = await request.json();
    const booking = await Booking.findById(id);
    if (!booking) return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });

    const isOwner = user.role === 'customer' && booking.customer.toString() === user.userId;
    const isAdmin = user.role === 'admin';
    const isAssignedTechnician = booking.technician && booking.technician.toString() === user.userId;

    if (!isOwner && !isAdmin && !isAssignedTechnician) {
        return NextResponse.json({ success: false, message: 'Not authorized to update this booking' }, { status: 403 });
    }

    // --- FIX: Rating save karne ki specific logic ---
    if (isOwner && body.rating) {
        if (booking.status !== 'Completed') {
            return NextResponse.json({ success: false, message: 'You can only rate completed services.' }, { status: 400 });
        }
        booking.rating = body.rating;
        await booking.save();
        return NextResponse.json({ success: true, data: booking, message: "Rating submitted successfully!" });
    }
    // --- END FIX ---

    // Admin specific logic
    if (isAdmin) {
        if (body.technician) body.status = 'Assigned';
        if (body.payment?.status === 'Paid') {
            // Initialize payment object if it doesn't exist
            if (!booking.payment) {
                booking.payment = {};
            }
            booking.payment.status = 'Paid';
            booking.payment.paymentReceivedBy = 'admin';
            booking.payment.paymentReceivedAt = new Date();
            booking.markModified('payment');
            await booking.save();
            return NextResponse.json({ success: true, data: booking });
        }
    }
    
    // Technician can confirm COD payment receipt
    if (isAssignedTechnician && body.paymentReceivedBy === 'technician' && body.payment?.status === 'Paid') {
        // Only allow updating payment status for COD payments
        if (booking.payment?.method === 'Cash on Delivery' && booking.payment?.status === 'Pending') {
            // Initialize payment object if it doesn't exist
            if (!booking.payment) {
                booking.payment = {};
            }
            booking.payment.status = 'Paid';
            booking.payment.paymentReceivedBy = 'technician';
            booking.payment.paymentReceivedAt = new Date();
            booking.markModified('payment');
            await booking.save();
            return NextResponse.json({ 
                success: true, 
                data: booking, 
                message: "Payment confirmed! Admin has been notified." 
            });
        } else {
            return NextResponse.json({ 
                success: false, 
                message: "Cannot confirm payment. Only pending COD payments can be confirmed." 
            }, { status: 400 });
        }
    }
    
    // Technician can update images and status
    if (isAssignedTechnician) {
        // Handle image uploads
        if (body.images) {
            if (!booking.images) {
                booking.images = {};
            }
            if (body.images.before) {
                booking.images.before = body.images.before;
            }
            if (body.images.after) {
                booking.images.after = body.images.after;
            }
            booking.markModified('images');
        }
        
        // Handle status update
        if (body.status) {
            booking.status = body.status;
        }
        
        await booking.save();
        return NextResponse.json({ success: true, data: booking, message: "Updated successfully!" });
    }

    // General update for other fields
    const updatedBooking = await Booking.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json({ success: true, data: updatedBooking });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
