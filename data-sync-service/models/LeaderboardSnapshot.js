import mongoose from 'mongoose';

const entrySchema = new mongoose.Schema(
  {
    userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name:          String,
    avatarUrl:     String,
    batch:         String,
    branch:        String,
    leetcodeScore: Number,
    githubScore:   Number,
    totalScore:    Number,
    rank:          Number,
  },
  { _id: false }
);

const leaderboardSnapshotSchema = new mongoose.Schema(
  {
    platform:    { type: String, enum: ['leetcode', 'github', 'combined'], required: true },
    period:      { type: String, enum: ['weekly', 'monthly'], required: true },
    periodStart: Date,
    periodEnd:   Date,
    entries:     [entrySchema],
    builtAt:     { type: Date, default: Date.now },
  },
  { timestamps: true }
);

leaderboardSnapshotSchema.index({ platform: 1, period: 1 }, { unique: true });

export default mongoose.model('LeaderboardSnapshot', leaderboardSnapshotSchema);
