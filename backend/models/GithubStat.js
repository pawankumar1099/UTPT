import mongoose from 'mongoose';

const repoSchema = new mongoose.Schema(
  { repoId: String, name: String, commits: Number, language: String, updatedAt: Date,
    status: { type: String, enum: ['Active','Inactive'] } },
  { _id: false }
);

const eventSchema = new mongoose.Schema(
  { type: { type: String, enum: ['push','pr','fork','star'] },
    repo: String, message: String, branch: String, ago: String, occurredAt: Date },
  { _id: false }
);

const githubStatSchema = new mongoose.Schema(
  { userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    totalCommits: { type: Number, default: 0 }, totalCommitsChange: Number,
    pullRequests: Number, pullRequestsChange: Number, repositories: Number,
    status: { type: String, enum: ['Active','Inactive'] },
    contributionHeatmap: [Number],
    calendarDays: [String], weekLabels: [String],
    commitsOverTime: [{ date: String, commits: Number, _id: false }],
    githubScore: { type: Number, default: 0 },
    topRepositories: [repoSchema], recentEvents: [eventSchema],
    lastSyncedAt: Date },
  { timestamps: true }
);

githubStatSchema.index({ githubScore: -1 });

export default mongoose.model('GithubStat', githubStatSchema);
