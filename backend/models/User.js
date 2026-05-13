import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
  {
    name:           { type: String, required: true, trim: true },
    email:          { type: String, required: true, unique: true, lowercase: true },
    passwordHash:   { type: String, required: true },
    role:           { type: String, enum: ['student', 'trainer'], default: 'student' },

    avatarUrl:      { type: String, default: '' },
    batch:          { type: String },
    branch:         { type: String },
    specialization: { type: String },

    leetcodeUsername:   { type: String, default: '' },
    codeforcesUsername: { type: String, default: '' },
    githubUsername:     { type: String, default: '' },

    assignedBatch:  { type: String },

    isActive:   { type: Boolean, default: true },
    lastActive: { type: Date, default: Date.now },
    joinedAt:   { type: Date, default: Date.now },
  },
  { timestamps: true }
);

userSchema.index({ role: 1, lastActive: -1 });
userSchema.index({ batch: 1, branch: 1 });

userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

export default mongoose.model('User', userSchema);
