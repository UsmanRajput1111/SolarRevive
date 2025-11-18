export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import connectDB from '../../../../utils/db';
import User from '../../../../models/User';
import bcrypt from 'bcryptjs';

// This endpoint allows creating an admin user
// For security, you can add a secret key check or remove this endpoint after creating admin
export async function POST(request) {
  await connectDB();
  try {
    const { name, email, phone, password, secretKey } = await request.json();

    // Optional: Add a secret key check for security
    // You can set ADMIN_CREATE_SECRET in your environment variables
    if (process.env.ADMIN_CREATE_SECRET && secretKey !== process.env.ADMIN_CREATE_SECRET) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (!name || !email || !password || !phone) {
      return NextResponse.json({ message: 'Please fill all fields' }, { status: 400 });
    }

    // Phone validation
    const phoneRegex = /^\+92\d{10}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { message: 'Invalid phone number. It must start with +92 and contain exactly 10 digits after it.' },
        { status: 400 }
      );
    }

    // Password validation
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        { message: 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.' },
        { status: 400 }
      );
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email, role: 'admin' });
    if (existingAdmin) {
      return NextResponse.json({ message: 'Admin user already exists with this email' }, { status: 400 });
    }

    // Check if email is already used
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists with this email' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const adminUser = new User({
      name,
      email,
      password: hashedPassword,
      role: 'admin',
      profile: {
        phone: phone,
        expertise: 'Not Applicable',
      },
    });

    await adminUser.save();

    return NextResponse.json(
      { message: 'Admin user created successfully', user: { name, email, role: 'admin' } },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}

