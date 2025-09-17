// src/app/api/auth/register/route.ts

import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
// Update the path below if your user model is located elsewhere
import User from '@/models/user'; // Import our User model

const connectToDatabase = async () => {
  if (mongoose.connection.readyState >= 1) return;
  return mongoose.connect(process.env.MONGODB_URI!);
};

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    // Connect to our database
    await connectToDatabase();

    // Check if a user with this email already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return NextResponse.json({ message: "Email already in use." }, { status: 400 });
    }

    // Hash the password for security
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user in the database
    await User.create({ name, email, password: hashedPassword });

    return NextResponse.json({ message: "User registered successfully!" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "An error occurred." }, { status: 500 });
  }
}