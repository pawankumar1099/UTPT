import mongoose from 'mongoose';

const immersionExamSchema = new mongoose.Schema(
  { week: { type: Number, required: true, unique: true },
    title: String, topic: String, date: Date, duration: Number,
    totalStudents: Number, appeared: Number, passed: Number,
    avgScore: Number, avgScoreChange: Number,
    highestScore: Number, lowestScore: Number, passPercent: Number,
    scoreDistribution: [{ range: String, count: Number, _id: false }],
    topScorers: [{ userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: String, avatarUrl: String, score: Number, rank: Number, _id: false }],
    isPublished: { type: Boolean, default: false } },
  { timestamps: true }
);

export default mongoose.model('ImmersionExam', immersionExamSchema);
