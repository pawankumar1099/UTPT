import 'dotenv/config';
import mongoose from 'mongoose';

async function fixEmailIndex() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI not set');

  await mongoose.connect(uri, { dbName: 'utpt_db' });
  console.log('[DB] Connected');

  const db = mongoose.connection.db;
  const collection = db.collection('users');

  const indexes = await collection.indexes();
  console.log('[DB] Existing indexes:', indexes.map(i => i.name));

  const hasOldIndex = indexes.some(i => i.name === 'email_1');
  if (hasOldIndex) {
    await collection.dropIndex('email_1');
    console.log('[DB] Dropped old email_1 index');
  } else {
    console.log('[DB] No old email_1 index found — nothing to drop');
  }

  await collection.createIndex({ email: 1 }, { unique: true, sparse: true, background: true });
  console.log('[DB] Created new sparse unique email index');

  await mongoose.disconnect();
  console.log('[DB] Done');
}

fixEmailIndex().catch(err => {
  console.error('[FATAL]', err.message);
  process.exit(1);
});
