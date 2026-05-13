import dotenv from 'dotenv';
dotenv.config();

const required = ['MONGO_URI', 'JWT_SECRET'];

for (const key of required) {
  if (!process.env[key]) {
    console.error(`[env] Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

export const env = {
  PORT:               process.env.PORT || 5001,
  NODE_ENV:           process.env.NODE_ENV || 'development',
  MONGO_URI:          process.env.MONGO_URI,
  JWT_SECRET:         process.env.JWT_SECRET,
  JWT_EXPIRES_IN:     process.env.JWT_EXPIRES_IN || '7d',
  GITHUB_TOKEN:       process.env.GITHUB_TOKEN || '',
  LEETCODE_BASE_URL:  process.env.LEETCODE_BASE_URL || 'https://leetcode.com/graphql',
  CODEFORCES_BASE_URL:process.env.CODEFORCES_BASE_URL || 'https://codeforces.com/api',
  CRON_CODING_SYNC:   process.env.CRON_CODING_SYNC  || '0 2 * * *',
  CRON_GITHUB_SYNC:   process.env.CRON_GITHUB_SYNC  || '0 3 * * *',
  CRON_LEADERBOARD:   process.env.CRON_LEADERBOARD  || '0 4 * * *',
};
