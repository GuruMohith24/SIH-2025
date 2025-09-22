import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { studentId } = await req.json();
    
    if (!studentId) {
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 });
    }
    
    // Generate a unique QR code ID for the student
    const qrCodeId = `QR_${studentId}_${randomBytes(8).toString('hex')}`;
    
    // In a real app, you would save this to the database
    // For now, we'll just return the QR code ID
    
    return NextResponse.json({ 
      qrCodeId,
      message: "QR code generated successfully"
    });
    
  } catch (error) {
    console.error("Error generating QR code:", error);
    return NextResponse.json(
      { error: "Failed to generate QR code" }, 
      { status: 500 }
    );
  }
}