import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  technician: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // --- FIX: 'Solar Foundation' ko enum list mein add kiya gaya hai ---
  serviceType: { 
      type: String, 
      required: true, 
      enum: ['Solar Panel Cleaning', 'Solar Panel Installation', 'Solar Foundation'] 
  },
  address: { type: String, required: true },
  bookingDate: { type: Date, required: true },
  status: { type: String, enum: ['Pending', 'Confirmed', 'Assigned', 'In Progress', 'Completed', 'Cancelled'], default: 'Pending' },
  trackingId: { type: String, unique: true, default: () => `SRV-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}` },
  images: { before: String, after: String },
  isSubscriptionBooking: { type: Boolean, default: false },
  amountDue: { type: Number, default: 0 },
  rating: { type: Number, min: 1, max: 5, default: null },
  payment: {
      method: { type: String, enum: ['Not Selected', 'Easypaisa', 'Jazzcash', 'Easypaisa/Jazzcash', 'Cash on Delivery'], default: 'Not Selected' },
      status: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
      paymentId: String,
      paymentReceivedBy: { type: String, enum: ['admin', 'technician'], default: null },
      paymentReceivedAt: { type: Date, default: null },
  }
}, { timestamps: true });

export default mongoose.models.Booking || mongoose.model('Booking', BookingSchema);