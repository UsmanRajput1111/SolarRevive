export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from "next/server";
import connectDB from "../../../../utils/db";
import User from "../../../../models/User";
import bcrypt from "bcryptjs";

export async function POST(request) {
  await connectDB();
  try {
    const { name, email, phone, password, role, expertise } =
      await request.json();

    if (!name || !email || !password || !role || !phone) {
      return NextResponse.json(
        { message: "Please fill all fields" },
        { status: 400 }
      );
    }

    // ✅ Phone validation
    const phoneRegex = /^\+92\d{10}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        {
          message:
            "Invalid phone number. It must start with +92 and contain exactly 10 digits after it.",
        },
        { status: 400 }
      );
    }

    // ✅ Password validation
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        {
          message:
            "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.",
        },
        { status: 400 }
      );
    }

    if (role === "technician" && !expertise) {
      return NextResponse.json(
        { message: "Technician must have an expertise" },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      profile: {
        phone: phone,
        expertise: role === "technician" ? expertise : "Not Applicable",
      },
    });

    await newUser.save();

    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
