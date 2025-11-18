// import { NextResponse } from 'next/server';
// import connectDB from '../../../../utils/db';
// import User from '../../../../models/User';
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';

// export async function POST(request) {
//   await connectDB();
//   try {
//     const { email, password } = await request.json();

//     if (!email || !password) {
//       return NextResponse.json({ message: 'Please provide email and password' }, { status: 400 });
//     }

//     // --- ADMIN LOGIN LOGIC START ---
//     // Check if the credentials match the admin credentials from .env file
//     if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
//       // If they match, create a token for the admin
//       const token = jwt.sign(
//         { userId: 'admin_user', role: 'admin', name: 'Admin' },
//         process.env.JWT_SECRET,
//         { expiresIn: '1h' }
//       );

//       return NextResponse.json({
//         token,
//         user: {
//           id: 'admin_user',
//           name: 'Admin',
//           email: process.env.ADMIN_EMAIL,
//           role: 'admin',
//         },
//       });
//     }
//     // --- ADMIN LOGIN LOGIC END ---

//     // If not admin, proceed with normal user login from database
//     const user = await User.findOne({ email });
//     if (!user) {
//       return NextResponse.json({ message: 'User not found' }, { status: 404 });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return NextResponse.json({ message: 'Invalid credentials' }, { status: 400 });
//     }

//     const token = jwt.sign(
//       { userId: user._id, role: user.role, name: user.name },
//       process.env.JWT_SECRET,
//       { expiresIn: '1h' }
//     );

//     return NextResponse.json({
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//       },
//     });
//   } catch (error) {
//     return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
//   }
// }

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import connectDB from '../../../../utils/db';
import User from '../../../../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  await connectDB();
  try {
    const { email, password } = await request.json();
    if (!email || !password) return NextResponse.json({ message: 'Please provide email and password' }, { status: 400 });

    // First, check if user exists in database
    const user = await User.findOne({ email });
    
    if (user) {
      // User exists in database - verify password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return NextResponse.json({ message: 'Invalid credentials' }, { status: 400 });

      // User authenticated - create token
      const token = jwt.sign({ userId: user._id, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: '1h' });
      return NextResponse.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    }

    // If user not found in database, check for admin credentials via env vars (fallback)
    if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD && 
        email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign({ userId: 'admin_user', role: 'admin', name: 'Admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
      return NextResponse.json({ token, user: { id: 'admin_user', name: 'Admin', email: process.env.ADMIN_EMAIL, role: 'admin' } });
    }

    // User not found
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}