const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },
    morning: { type: Boolean, default: false },
    evening: { type: Boolean, default: false },
    problems: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

taskSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Task', taskSchema);
