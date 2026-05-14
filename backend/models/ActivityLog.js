import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  { userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['solve','commit','rank','streak','pr'], required: true },
    text: { type: String, required: true } },
  { timestamps: true }
);

activityLogSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('ActivityLog', activityLogSchema);
