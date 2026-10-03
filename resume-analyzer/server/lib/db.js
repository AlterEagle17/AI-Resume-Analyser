import mongoose from 'mongoose';

let connectionPromise;

export async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) return true;
  if (connectionPromise) return connectionPromise;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('[DB] MONGODB_URI is not configured. Persistence is unavailable.');
    return false;
  }

  connectionPromise = mongoose.connect(uri, {
      dbName: 'resume_analyzer',
      serverSelectionTimeoutMS: 10000,
    })
    .then(() => {
      console.info('[DB] Connected to MongoDB database resume_analyzer.');
      return true;
    })
    .catch(() => {
      console.error('[DB] MongoDB connection failed. Persistence is unavailable.');
      return false;
    });

  return connectionPromise;
}

export function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}
