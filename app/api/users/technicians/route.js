import { NextResponse } from 'next/server';
import connectDB from '../../../../utils/db';
import User from '../../../../models/User';

export const dynamic = 'force-dynamic';

export async function GET() {
    await connectDB();
    try {
        // Sirf woh users fetch karein jinka role 'technician' hai
        const technicians = await User.find({ role: 'technician' });
        return NextResponse.json({ success: true, data: technicians });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Failed to fetch technicians' }, { status: 500 });
    }
}