const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  targetValue: { type: Number, required: true },
  currentValue: { type: Number, default: 0 },
  deadline: { type: Date },
  status: { type: String, enum: ['active', 'completed', 'failed'], default: 'active' },
  type: { type: String, enum: ['xp', 'problems', 'streak', 'modules'], required: true }
}, { timestamps: true });

module.exports = mongoose.model('Goal', goalSchema);
