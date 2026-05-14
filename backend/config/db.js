import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI environment variable is not set');
  await mongoose.connect(uri, { dbName: 'utpt_db' });
  console.log('[DB] Connected to MongoDB — utpt_db');
}
