import mongoose, { Document, Schema } from 'mongoose';

export interface IAttendance extends Document {
  classId: string;
  subject: string;
  date: Date;
  studentIds: string[]; // Array of student _id values
  type: 'face_recognition' | 'qr_code' | 'manual';
  recordedBy: string; // User _id who recorded this attendance
}

const AttendanceSchema: Schema = new Schema({
  classId: { type: String, required: true },
  subject: { type: String, required: true },
  date: { type: Date, required: true, default: Date.now },
  studentIds: [{ type: Schema.Types.ObjectId, ref: 'Student', required: true }],
  type: {
    type: String,
    enum: ['face_recognition', 'qr_code', 'manual'],
    required: true
  },
  recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
});

export default mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema);