import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, batch, branch, specialization } = req.body;
  if (!name || !email || !password) throw new ApiError(400, 'name, email and password are required');

  const exists = await User.findOne({ email });
  if (exists) throw new ApiError(409, 'Email already registered');

  const user = await User.create({
    name,
    email,
    passwordHash: password,
    role: role ?? 'student',
    batch,
    branch,
    specialization,
  });

  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  res.status(201).json({
    success: true,
    data: {
      token,
      user: {
        _id:   user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
        avatarUrl: user.avatarUrl,
        batch: user.batch,
        branch: user.branch,
      },
    },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, 'email and password are required');

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(401, 'Invalid email or password');

  const match = await user.comparePassword(password);
  if (!match) throw new ApiError(401, 'Invalid email or password');

  user.lastActive = new Date();
  await user.save({ validateBeforeSave: false });

  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  res.json({
    success: true,
    data: {
      token,
      user: {
        _id:   user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
        avatarUrl: user.avatarUrl,
        batch: user.batch,
        branch: user.branch,
      },
    },
  });
});

export const getMe = asyncHandler(async (req, res) => {
  const { _id, name, email, role, batch, branch, specialization, avatarUrl, joinedAt } = req.user;
  res.json({ success: true, data: { _id, name, email, role, batch, branch, specialization, avatarUrl, joinedAt } });
});
