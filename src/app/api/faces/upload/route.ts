import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/database";
import Student from "@/models/student";
import { encodeStudentFace } from "@/lib/faceRecognition";

export async function POST(req: NextRequest) {
  try {
    const { studentId, imageData } = await req.json();

    if (!studentId || !imageData) {
      return NextResponse.json({ error: "Student ID and image data are required" }, { status: 400 });
    }

    await connectToDatabase();

    // Find student
    const student = await Student.findById(studentId);
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Convert base64 to image
    const imageBuffer = Buffer.from(imageData.split(',')[1], 'base64');
    const image = new Image();
    image.src = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

    // Wait for image to load
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Failed to load image"));
    });

    // Encode face using our face recognition utility
    const result = await encodeStudentFace(studentId, image);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({ 
      message: "Face data uploaded successfully",
      studentId: result.studentId
    });

  } catch (error) {
    console.error("Face upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload face data" }, 
      { status: 500 }
    );
  }
}
