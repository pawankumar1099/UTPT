import 'dotenv/config';
import cron from 'node-cron';
import { connectDB } from './config/db.js';
import { syncAllCodingStats } from './jobs/syncCodingStats.job.js';
import { syncAllGithubStats } from './jobs/syncGithubStats.job.js';
import { buildLeaderboardSnapshots } from './jobs/buildLeaderboard.job.js';

async function runFullSync() {
  console.log('\n========================================');
  console.log('  UTPT Data Sync — Full Sync Starting');
  console.log('========================================\n');
  try {
    await syncAllCodingStats();
  } catch (err) {
    console.error('[FATAL] Coding sync failed:', err.message);
  }
  try {
    await syncAllGithubStats();
  } catch (err) {
    console.error('[FATAL] GitHub sync failed:', err.message);
  }
  try {
    await buildLeaderboardSnapshots();
  } catch (err) {
    console.error('[FATAL] Leaderboard build failed:', err.message);
  }
  console.log('========================================');
  console.log('  Full Sync Complete');
  console.log('========================================\n');
}

async function main() {
  await connectDB();

  const CODING_CRON    = process.env.CRON_CODING_SYNC    ?? '0 2 * * *';
  const GITHUB_CRON    = process.env.CRON_GITHUB_SYNC    ?? '0 3 * * *';
  const LEADERBOARD_CRON = process.env.CRON_LEADERBOARD  ?? '0 4 * * *';

  cron.schedule(CODING_CRON, async () => {
    console.log('[CRON] Coding stats sync triggered');
    try { await syncAllCodingStats(); } catch (e) { console.error(e.message); }
  });

  cron.schedule(GITHUB_CRON, async () => {
    console.log('[CRON] GitHub stats sync triggered');
    try { await syncAllGithubStats(); } catch (e) { console.error(e.message); }
  });

  cron.schedule(LEADERBOARD_CRON, async () => {
    console.log('[CRON] Leaderboard build triggered');
    try { await buildLeaderboardSnapshots(); } catch (e) { console.error(e.message); }
  });

  console.log(`[CRON] Coding sync scheduled:    ${CODING_CRON}`);
  console.log(`[CRON] GitHub sync scheduled:    ${GITHUB_CRON}`);
  console.log(`[CRON] Leaderboard scheduled:    ${LEADERBOARD_CRON}`);

  const RUN_ON_START = process.env.RUN_ON_START !== 'false';
  if (RUN_ON_START) {
    console.log('\n[Startup] Running initial sync immediately...');
    await runFullSync();
  } else {
    console.log('\n[Startup] Skipping initial sync (RUN_ON_START=false)');
    console.log('[Startup] Waiting for scheduled cron triggers...\n');
  }

  process.on('SIGINT', async () => {
    console.log('\n[Shutdown] Received SIGINT — exiting gracefully');
    process.exit(0);
  });
  process.on('SIGTERM', async () => {
    console.log('\n[Shutdown] Received SIGTERM — exiting gracefully');
    process.exit(0);
  });

  setInterval(() => {}, 1 << 30);
}

main().catch(err => {
  console.error('[FATAL] Service crashed:', err);
  process.exit(1);
});
