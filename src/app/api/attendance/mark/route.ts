import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/database";
import Student from "@/models/student";

// Attendance record schema (you might want to create a separate model)
interface AttendanceRecord {
  classId: string;
  subject: string;
  date: Date;
  presentStudents: string[];
  absentStudents: string[];
  markedBy: string;
  method: 'face_recognition' | 'qr_code' | 'manual';
}

export async function POST(req: NextRequest) {
  try {
    const { classId, subject, studentIds, method = 'face_recognition', markedBy } = await req.json();

    if (!classId || !subject || !Array.isArray(studentIds)) {
      return NextResponse.json({ error: "Class ID, subject, and student IDs are required" }, { status: 400 });
    }

    await connectToDatabase();

    // Get all students in the class
    const allStudents = await Student.find({ class: classId }, { _id: 1, name: 1, rollNumber: 1 });
    const allStudentIds = allStudents.map(s => s._id.toString());

    // Determine present and absent students
    const presentStudents = studentIds;
    const absentStudents = allStudentIds.filter(id => !presentStudents.includes(id));

    // Create attendance record
    const attendanceRecord: AttendanceRecord = {
      classId,
      subject,
      date: new Date(),
      presentStudents,
      absentStudents,
      markedBy: markedBy || 'system',
      method
    };

    // In a real app, you'd save this to an Attendance model
    // For now, we'll store in a simple way
    const attendanceId = `ATT_${Date.now()}_${classId}`;

    // Store attendance record (you might want to use a proper database collection)
    // For demo purposes, we'll just return the data

    // Get student details for response
    const presentStudentDetails = allStudents.filter(s => presentStudents.includes(s._id.toString()));
    const absentStudentDetails = allStudents.filter(s => absentStudents.includes(s._id.toString()));

    return NextResponse.json({
      success: true,
      attendanceId,
      classId,
      subject,
      date: attendanceRecord.date,
      present: {
        count: presentStudents.length,
        students: presentStudentDetails
      },
      absent: {
        count: absentStudents.length,
        students: absentStudentDetails
      },
      totalStudents: allStudents.length,
      method
    });

  } catch (error) {
    console.error("Attendance marking error:", error);
    return NextResponse.json(
      { error: "Failed to mark attendance" }, 
      { status: 500 }
    );
  }
}
