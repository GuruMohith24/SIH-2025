import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/database";
import Student from "@/models/student";
import { recognizeStudentsFromClassPhoto } from "@/lib/faceRecognition";

export async function POST(req: NextRequest) {
  try {
    const { classId, imageData } = await req.json();

    if (!classId || !imageData) {
      return NextResponse.json({ error: "Class ID and image data are required" }, { status: 400 });
    }

    await connectToDatabase();

    // Convert base64 to image
    const imageBuffer = Buffer.from(imageData.split(',')[1], 'base64');
    const image = new Image();
    image.src = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

    // Wait for image to load
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Failed to load image"));
    });

    // Recognize students from class photo
    const result = await recognizeStudentsFromClassPhoto(classId, image);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    // Get student details for recognized IDs
    const students = await Student.find({
      _id: { $in: result.recognized }
    }, { name: 1, rollNumber: 1, class: 1 });

    return NextResponse.json({
      success: true,
      recognized: result.recognized,
      students: students,
      totalDetectedFaces: result.totalDetectedFaces,
      recognizedCount: result.recognized.length
    });

  } catch (error) {
    console.error("Face recognition error:", error);
    return NextResponse.json(
      { error: "Face recognition failed" }, 
      { status: 500 }
    );
  }
}
