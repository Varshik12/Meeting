import mongoose from 'mongoose';

let dbConnected = false;

export async function connectDB() {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!mongoUri) {
    console.warn('⚠️ [MongoDB] MONGO_URI not defined in environment. Running in in-memory mode.');
    return false;
  }

  try {
    await mongoose.connect(mongoUri);
    dbConnected = true;
    console.log('✅ [MongoDB] Connected to MongoDB Atlas successfully.');
    return true;
  } catch (error) {
    console.error('❌ [MongoDB] Connection error:', error.message);
    dbConnected = false;
    return false;
  }
}

export function isDbConnected() {
  return dbConnected && mongoose.connection.readyState === 1;
}
