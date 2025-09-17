
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Student from '@/models/student';

export async function POST(req: Request) {
  await connectToDatabase();
  const { name, class: className, rollNumber } = await req.json();

  try {
    const newStudent = await Student.create({ name, class: className, rollNumber });
    return NextResponse.json(newStudent, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error creating student' }, { status: 500 });
  }
}

export async function GET() {
  await connectToDatabase();

  try {
    const students = await Student.find({});
    return NextResponse.json(students, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching students' }, { status: 500 });
  }
}
