const mongoose = require('mongoose');

const dayProgressSchema = new mongoose.Schema(
  {
    learning: { type: Boolean, default: false },
    practice: { type: Boolean, default: false },
    build: { type: Boolean, default: false },
  },
  { _id: false }
);

const instituteProgressSchema = new mongoose.Schema(
  {
    currentDay: { type: Number, default: 1 },
    xp: { type: Number, default: 0, min: 0 },
    unlockedModules: { type: [String], default: ['data-foundations'] },
    completedDays: { type: Map, of: [Number], default: {} },
    dayProgress: { type: Map, of: dayProgressSchema, default: {} },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    picture: { type: String, default: '' },
    score: { type: Number, default: 0, min: 0 },
    streak: { type: Number, default: 0, min: 0 },
    lastActiveDate: { type: String, default: null },
    xp: { type: Number, default: 0, min: 0 },
    level: { type: Number, default: 0, min: 0 },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    instituteProgress: { type: instituteProgressSchema, default: () => ({}) },
    fcmToken: { type: String, default: null },
  },
  { timestamps: true }
);

userSchema.index({ score: -1 });

module.exports = mongoose.model('User', userSchema);
