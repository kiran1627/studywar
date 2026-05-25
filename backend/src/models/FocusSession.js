const mongoose = require('mongoose');

const focusSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },
    sessionType: { type: String, enum: ['morning', 'evening'], required: true },
    focusMinutes: { type: Number, required: true, min: 0 },
    problemsSolved: { type: Number, default: 0, min: 0 },
    topic: { type: String, default: '' },
    notes: { type: String, default: '' },
    xpEarned: { type: Number, default: 0, min: 0 },
    completed: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Prevent duplicate sessions (same user, same day, same session type)
focusSessionSchema.index({ userId: 1, date: 1, sessionType: 1 }, { unique: true });

// Auto-calculate XP before saving
focusSessionSchema.pre('save', function (next) {
  if (this.isNew || this.isModified('problemsSolved')) {
    // 20 XP for completing a session + 5 XP per problem solved
    this.xpEarned = 20 + (this.problemsSolved * 5);
  }
  next();
});

module.exports = mongoose.model('FocusSession', focusSessionSchema);
