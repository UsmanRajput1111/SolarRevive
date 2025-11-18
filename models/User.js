import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'technician', 'admin'], required: true },
  profile: {
      phone: { type: String }, // Phone field added
       expertise: { type: String, enum: ['Solar Panel Cleaning', 'Solar Panel Installation', 'Solar Foundation', 'Not Applicable'], default: 'Not Applicable' },
      address: String,
  }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);