import mongoose from 'mongoose';

export async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('[DB] MONGODB_URI is not configured. Persistence is unavailable.');
    return false;
  }

  try {
    await mongoose.connect(uri, {
      dbName: 'resume_analyzer',
      serverSelectionTimeoutMS: 10000,
    });
    console.info('[DB] Connected to MongoDB database resume_analyzer.');
    return true;
  } catch {
    console.error('[DB] MongoDB connection failed. Persistence is unavailable.');
    return false;
  }
}

export function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}
