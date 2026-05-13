import './config/env.js';
import { connectDB }              from './config/db.js';
import app                        from './app.js';
import { scheduleCodingSync }     from './jobs/syncCodingStats.job.js';
import { scheduleGithubSync }     from './jobs/syncGithubStats.job.js';
import { scheduleLeaderboardBuild }from './jobs/buildLeaderboard.job.js';

const PORT = process.env.PORT || 5001;

async function start() {
  await connectDB(process.env.MONGO_URI);

  scheduleCodingSync(process.env.CRON_CODING_SYNC   || '0 2 * * *');
  scheduleGithubSync(process.env.CRON_GITHUB_SYNC    || '0 3 * * *');
  scheduleLeaderboardBuild(process.env.CRON_LEADERBOARD || '0 4 * * *');

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[server] UTPT API running on http://localhost:${PORT}`);
    console.log(`[server] Environment: ${process.env.NODE_ENV}`);
  });
}

start().catch((err) => {
  console.error('[server] Fatal startup error:', err);
  process.exit(1);
});
