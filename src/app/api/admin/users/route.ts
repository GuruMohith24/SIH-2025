import { NextResponse } from 'next/server';
import User from '@/models/user';
import mongoose from 'mongoose';

export async function GET() {
  if (mongoose.connection.readyState < 1) {
    await mongoose.connect(process.env.MONGODB_URI!);
  }
  const users = await User.find({}, { name: 1, email: 1, role: 1 });
  return NextResponse.json(users);
}

// PATCH: Ban or promote a user
export async function PATCH(request: Request) {
  const { userId, action } = await request.json();
  if (!userId || !action) {
    return NextResponse.json({ error: 'Missing userId or action' }, { status: 400 });
  }
  if (mongoose.connection.readyState < 1) {
    await mongoose.connect(process.env.MONGODB_URI!);
  }
  let update = {};
  if (action === 'ban') update = { role: 'banned' };
  if (action === 'promote') update = { role: 'admin' };
  if (!Object.keys(update).length) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }
  const user = await User.findByIdAndUpdate(userId, update, { new: true });
  return NextResponse.json(user);
}

// DELETE: Remove a user
export async function DELETE(request: Request) {
  const { userId } = await request.json();
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }
  if (mongoose.connection.readyState < 1) {
    await mongoose.connect(process.env.MONGODB_URI!);
  }
  await User.findByIdAndDelete(userId);
  return NextResponse.json({ success: true });
}
