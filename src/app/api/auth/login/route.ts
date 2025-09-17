// src/app/api/auth/login/route.ts

import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '@/models/user';

const connectToDatabase = async () => {
  if (mongoose.connection.readyState >= 1) return;
  return mongoose.connect(process.env.MONGODB_URI!);
};

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    await connectToDatabase();

    const user = await User.findOne({ email });

    // If no user is found with that email
    if (!user) {
      return NextResponse.json({ message: "Invalid credentials." }, { status: 400 });
    }

    // Check if the password matches
    const isMatch = await bcrypt.compare(password, user.password);

    // If the passwords don't match
    if (!isMatch) {
      return NextResponse.json({ message: "Invalid credentials." }, { status: 400 });
    }

    // If everything is correct, send back the user info (without the password)
    const userResponse = {
        _id: user._id,
        name: user.name,
        email: user.email,
    }

    return NextResponse.json({ message: "Login successful!", user: userResponse }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: "An error occurred." }, { status: 500 });
  }
}