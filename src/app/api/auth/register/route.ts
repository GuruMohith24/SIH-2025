import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/database";
import User from "@/models/user";
import Student from "@/models/student";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role, class: className, rollNumber } = await req.json();

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    // Validate student-specific fields
    if (role === 'student' && (!className || !rollNumber)) {
      return NextResponse.json({ error: "Class and roll number are required for students" }, { status: 400 });
    }

    // Connect to database
    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role
    });

    await user.save();

    // If student, create student record
    if (role === 'student') {
      const student = new Student({
        name,
        email,
        class: className,
        rollNumber: parseInt(rollNumber),
        userId: user._id,
        faceDescriptors: [],
        qrCodeId: `QR_${user._id}_${Date.now()}`
      });

      await student.save();
    }

    return NextResponse.json({ 
      message: "User created successfully",
      userId: user._id,
      role: user.role
    });

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Registration failed" }, 
      { status: 500 }
    );
  }
}