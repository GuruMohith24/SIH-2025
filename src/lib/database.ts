// src/lib/database.ts
import mongoose from 'mongoose';

const connectToDatabase = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    // Allow app to run without DB in local demo mode
    return;
  }
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  return mongoose.connect(uri);
};

export default connectToDatabase;