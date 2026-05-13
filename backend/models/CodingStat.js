import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    problem:     String,
    difficulty:  { type: String, enum: ['Easy', 'Medium', 'Hard'] },
    status:      String,
    language:    String,
    submittedAt: Date,
    platform:    { type: String, enum: ['leetcode', 'codeforces'] },
  },
  { _id: false }
);

const platformStatSchema = new mongoose.Schema(
  {
    totalSolved:          { type: Number, default: 0 },
    easy:                 { solved: Number, total: Number, percentage: Number },
    medium:               { solved: Number, total: Number, percentage: Number },
    hard:                 { solved: Number, total: Number, percentage: Number },
    globalRanking:        Number,
    globalRankingChange:  Number,
    acceptanceRate:       Number,
    totalSubmissions:     Number,
    contestsParticipated: Number,
    contestRating:        Number,
    currentStreak:        { type: Number, default: 0 },
    longestStreak:        { type: Number, default: 0 },
    longestStreakRange:   String,
    recentSubmissions:    [submissionSchema],
  },
  { _id: false }
);

const codingStatSchema = new mongoose.Schema(
  {
    userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    leetcode:   platformStatSchema,
    codeforces: platformStatSchema,

    combined: {
      totalSolved:          Number,
      easy:                 { solved: Number, total: Number, percentage: Number },
      medium:               { solved: Number, total: Number, percentage: Number },
      hard:                 { solved: Number, total: Number, percentage: Number },
      acceptanceRate:       Number,
      totalSubmissions:     Number,
      contestsParticipated: Number,
      recentSubmissions:    [submissionSchema],
    },

    leetcodeScore:   { type: Number, default: 0 },
    codeforcesScore: { type: Number, default: 0 },

    problemsOverTime: [
      {
        date:       String,
        leetcode:   Number,
        codeforces: Number,
        total:      Number,
        _id:        false,
      },
    ],

    submissionCalendar: {
      leetcode:   [Number],
      codeforces: [Number],
      combined:   [Number],
    },

    lastSyncedAt: Date,
  },
  { timestamps: true }
);

codingStatSchema.index({ leetcodeScore: -1 });
codingStatSchema.index({ 'leetcode.currentStreak': -1 });

export default mongoose.model('CodingStat', codingStatSchema);
