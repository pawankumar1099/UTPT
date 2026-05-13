import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name:               { type: String, required: true, trim: true },
    email:              { type: String, required: true, unique: true, lowercase: true },
    passwordHash:       { type: String, required: true },
    role:               { type: String, enum: ['student', 'trainer'], default: 'student' },
    avatarUrl:          { type: String, default: '' },
    batch:              { type: String },
    branch:             { type: String },
    specialization:     { type: String },
    leetcodeUsername:   { type: String, default: '' },
    codeforcesUsername: { type: String, default: '' },
    githubUsername:     { type: String, default: '' },
    assignedBatch:      { type: String },
    isActive:           { type: Boolean, default: true },
    lastActive:         { type: Date, default: Date.now },
    joinedAt:           { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
