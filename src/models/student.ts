
import mongoose, { Document, Schema } from 'mongoose';

export interface IStudent extends Document {
  name: string;
  class: string;
  rollNumber: number;
  faceDescriptors?: number[][]; // For face recognition
  qrCodeId?: string; // Unique ID for QR code
  photoUrl?: string; // Optional photo for verification
}

const StudentSchema: Schema = new Schema({
  name: { type: String, required: true },
  class: { type: String, required: true },
  rollNumber: { type: Number, required: true, unique: true },
  faceDescriptors: { type: [[Number]] }, // 2D array for face-api.js descriptors
  qrCodeId: { type: String, unique: true, sparse: true }, // Unique ID for QR code generation
  photoUrl: { type: String } // Optional URL for student photo
});

export default mongoose.models.Student || mongoose.model<IStudent>('Student', StudentSchema);
