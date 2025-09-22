import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Attendance from "@/models/attendance";
import mongoose from "mongoose";

// Connect to MongoDB
async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    try {
      await mongoose.connect(process.env.MONGODB_URI || "");
    } catch (error) {
      console.error("Failed to connect to MongoDB", error);
      throw new Error("Database connection failed");
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    // Get user session to identify who is recording attendance
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null) as {
      classId?: string;
      subject?: string;
      studentIds?: string[];
      type?: 'face_recognition' | 'qr_code' | 'manual';
    } | null;

    if (!body?.classId || !body?.subject || !Array.isArray(body?.studentIds)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await connectDB();

    // Create new attendance record
    const attendance = new Attendance({
      classId: body.classId,
      subject: body.subject,
      studentIds: body.studentIds,
      type: body.type || 'manual',
      recordedBy: session.user.id
    });

    await attendance.save();

    return NextResponse.json({
      ok: true,
      marked: body.studentIds.length,
      attendanceId: attendance._id
    });

  } catch (error) {
    console.error("Error saving attendance:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const classId = searchParams.get('classId');
    const date = searchParams.get('date');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build query
    const query: any = {};
    if (classId) query.classId = classId;
    if (date) {
      const targetDate = new Date(date);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      query.date = { $gte: targetDate, $lt: nextDay };
    }

    // Get recent attendance sessions
    const sessions = await Attendance.find(query)
      .sort({ date: -1 })
      .limit(limit)
      .populate('studentIds', 'name rollNumber')
      .populate('recordedBy', 'name');

    return NextResponse.json({ sessions });

  } catch (error) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}



