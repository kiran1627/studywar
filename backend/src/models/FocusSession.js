const mongoose = require('mongoose');

const focusSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },
    sessionType: { type: String, enum: ['morning', 'evening', 'institute'], required: true },
    focusMinutes: { type: Number, required: true, min: 0 },
    problemsSolved: { type: Number, default: 0, min: 0 },
    topic: { type: String, default: '' },
    notes: { type: String, default: '' },
    xpEarned: { type: Number, default: 0, min: 0 },
    completed: { type: Boolean, default: true },

    // Institute-specific fields
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'expert'],
      default: 'medium',
    },
    aiSummary: { type: String, default: '' },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

// Prevent duplicate morning/evening sessions (same user, same day, same type)
// Institute sessions are NOT unique-constrained — users can have multiple per day
focusSessionSchema.index(
  { userId: 1, date: 1, sessionType: 1 },
  {
    unique: true,
    partialFilterExpression: { sessionType: { $in: ['morning', 'evening'] } },
  }
);

// General query index for institute sessions
focusSessionSchema.index({ userId: 1, sessionType: 1, date: -1 });

const DIFFICULTY_BONUS = { easy: 0, medium: 5, hard: 10, expert: 20 };

// Auto-calculate XP before saving
focusSessionSchema.pre('save', function (next) {
  if (this.isNew || this.isModified('problemsSolved') || this.isModified('difficulty')) {
    if (this.sessionType === 'institute') {
      // 25 base XP + 5 per problem + difficulty bonus
      const bonus = DIFFICULTY_BONUS[this.difficulty] || 0;
      this.xpEarned = 25 + (this.problemsSolved * 5) + bonus;
    } else {
      // 20 XP for completing a session + 5 XP per problem solved
      this.xpEarned = 20 + (this.problemsSolved * 5);
    }
  }
  next();
});

module.exports = mongoose.model('FocusSession', focusSessionSchema);
