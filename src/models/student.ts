
import mongoose, { Document, Schema } from 'mongoose';

export interface IStudent extends Document {
  name: string;
  class: string;
  rollNumber: number;
}

const StudentSchema: Schema = new Schema({
  name: { type: String, required: true },
  class: { type: String, required: true },
  rollNumber: { type: Number, required: true, unique: true },
});

export default mongoose.models.Student || mongoose.model<IStudent>('Student', StudentSchema);
