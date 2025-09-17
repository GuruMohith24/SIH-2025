// src/lib/database.ts
import mongoose from 'mongoose';

const connectToDatabase = async () => {
  // If we're already connected, don't create a new connection
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  
  // Otherwise, create a new connection
  return mongoose.connect(process.env.MONGODB_URI!);
};

export default connectToDatabase;