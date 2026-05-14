import mongoose from 'mongoose';

const immersionResultSchema = new mongoose.Schema(
  { userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    week: { type: Number, required: true },
    marks: { type: Number, required: true, min: 0, max: 100 },
    status: { type: String, enum: ['Pass','Fail'] },
    grade: { type: String, enum: ['Good','Average','Poor'] },
    weakArea: { type: String, default: null },
    rank: Number,
    submittedAt: { type: Date, default: Date.now } },
  { timestamps: true }
);

immersionResultSchema.index({ userId: 1, week: 1 }, { unique: true });
immersionResultSchema.index({ week: 1, marks: -1 });

export default mongoose.model('ImmersionResult', immersionResultSchema);
