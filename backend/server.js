import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT ?? 3001;

async function main() {
  await connectDB();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] UTPT Backend running on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error('[FATAL] Server failed to start:', err.message);
  process.exit(1);
});
