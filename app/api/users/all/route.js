import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '../../../../utils/db';
import User from '../../../../models/User';

export const dynamic = 'force-dynamic';

export async function GET() {
    await connectDB();
    const authorization = headers().get('authorization');
    let user = null;
    if (authorization && authorization.startsWith('Bearer ')) {
        const token = authorization.split(' ')[1];
        try { user = jwt.verify(token, process.env.JWT_SECRET); } catch (error) { user = null; }
    }

    // Sirf admin hi saare users ko fetch kar sakta hai
    if (!user || user.role !== 'admin') {
        return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 403 });
    }

    try {
        const allUsers = await User.find({});
        return NextResponse.json({ success: true, data: allUsers });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Failed to fetch users' }, { status: 500 });
    }
}