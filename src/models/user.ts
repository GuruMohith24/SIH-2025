// src/models/user.ts
import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  image: { type: String },
  emailVerified: { type: Date }, // NextAuth uses this
  role: {
    type: String,
    enum: ["user", "alumni", "admin"],
    default: "user",
    required: true
  },
}, {
  timestamps: true,
  // Let's keep this for now, it's good for debugging
  strict: false,
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;