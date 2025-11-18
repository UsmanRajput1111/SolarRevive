import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '../../../../utils/db';
import User from '../../../../models/User';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET() {
    await connectDB();
    
    const authorization = headers().get('authorization');
    let user = null;
    if (authorization && authorization.startsWith('Bearer ')) {
        const token = authorization.split(' ')[1];
        try { user = jwt.verify(token, process.env.JWT_SECRET); } catch (error) { user = null; }
    }

    if (!user) return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 401 });

    try {
        const userData = await User.findById(user.userId).select('-password');
        if (!userData) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        return NextResponse.json({ success: true, data: userData });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}

export async function PUT(request) {
    await connectDB();

    const authorization = headers().get('authorization');
    let user = null;
    if (authorization && authorization.startsWith('Bearer ')) {
        const token = authorization.split(' ')[1];
        try { user = jwt.verify(token, process.env.JWT_SECRET); } catch (error) { user = null; }
    }

    if (!user) return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 401 });

    try {
        const body = await request.json();
        const { name, email, phone, currentPassword, newPassword } = body;

        const userToUpdate = await User.findById(user.userId);
        if (!userToUpdate) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });

        if (name) userToUpdate.name = name;
        if (email) userToUpdate.email = email;
        
        // --- FIX START: Ensure profile object exists before setting phone ---
        if (phone) {
            if (!userToUpdate.profile) {
                userToUpdate.profile = {}; // Agar profile object nahi hai, to banayein
            }
            userToUpdate.profile.phone = phone;
        }
        // --- FIX END ---

        if (currentPassword && newPassword) {
            const isMatch = await bcrypt.compare(currentPassword, userToUpdate.password);
            if (!isMatch) {
                return NextResponse.json({ success: false, message: 'Incorrect current password' }, { status: 400 });
            }
            userToUpdate.password = await bcrypt.hash(newPassword, 12);
        }

        await userToUpdate.save();
        return NextResponse.json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Update failed', error: error.message }, { status: 500 });
    }
}