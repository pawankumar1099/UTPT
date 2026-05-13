import mongoose from 'mongoose';

export async function connectDB(uri) {
  try {
    const conn = await mongoose.connect(uri);
    console.log(`[db] MongoDB connected: ${conn.connection.host}`);
    await dropStaleIndexes(conn.connection);
  } catch (err) {
    console.error(`[db] Connection failed: ${err.message}`);
    process.exit(1);
  }
}

async function dropStaleIndexes(connection) {
  try {
    const db = connection.db;
    const collections = await db.listCollections({ name: 'users' }).toArray();
    if (collections.length === 0) return;

    const indexes = await db.collection('users').indexes();
    const stale = indexes.filter((idx) => idx.name === 'password_1');
    if (stale.length > 0) {
      await db.collection('users').dropIndex('password_1');
      console.log('[db] Dropped stale index: password_1');
    }
  } catch (err) {
    console.warn(`[db] Could not clean stale indexes: ${err.message}`);
  }
}
