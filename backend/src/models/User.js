const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    picture: { type: String, default: '' },
    score: { type: Number, default: 0, min: 0 },
    streak: { type: Number, default: 0, min: 0 },
    lastActiveDate: { type: String, default: null },
  },
  { timestamps: true }
);

userSchema.index({ score: -1 });

module.exports = mongoose.model('User', userSchema);
