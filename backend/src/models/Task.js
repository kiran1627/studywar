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

taskSchema.post('save', async function (doc) {
  try {
    const Task = mongoose.model('Task');
    const User = mongoose.model('User');

    const tasks = await Task.find({ userId: doc.userId });
    const totalSessions = tasks.reduce((acc, t) => acc + (t.morning ? 1 : 0) + (t.evening ? 1 : 0), 0);
    const totalProblems = tasks.reduce((acc, t) => acc + (t.problems || 0), 0);
    const xp = totalSessions * 40 + totalProblems * 10;

    let level = 0;
    if (xp >= 700) level = 3;
    else if (xp >= 300) level = 2;
    else if (xp >= 100) level = 1;

    await User.findByIdAndUpdate(doc.userId, { xp, level });
  } catch (err) {
    console.error('Error calculating XP and Level:', err);
  }
});

module.exports = mongoose.model('Task', taskSchema);
