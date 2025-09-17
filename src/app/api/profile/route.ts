// src/app/api/profile/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import User from '@/models/user';
import { authOptions } from '../auth/[...nextauth]/route';
// Update the import path if '@/lib/database' does not exist, for example:
import connectToDatabase from '../../../lib/database'; // <-- Adjust path as needed
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "An error occurred while fetching the profile." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  try {
    await connectToDatabase(); // <-- ENSURE WE ARE CONNECTED TO THE DB

    const data = await request.json();
    const { graduationYear, degree, company, jobTitle } = data;
    
    console.log("Updating profile for:", session.user.email); // Good for debugging
    console.log("With data:", data); // Good for debugging

    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        graduationYear,
        degree,
        company,
        jobTitle,
      },
      { new: true }
    );

    if (!updatedUser) {
        return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error("PROFILE UPDATE ERROR:", error); // <-- THIS IS THE KEY
    return NextResponse.json({ message: "An error occurred while updating the profile." }, { status: 500 });
    }
}