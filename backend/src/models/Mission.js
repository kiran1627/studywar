const mongoose = require('mongoose');

const missionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  xpReward: { type: Number, default: 50 },
  completed: { type: Boolean, default: false },
  date: { type: String, required: true }, // YYYY-MM-DD
  type: { type: String, enum: ['study', 'problem', 'timer', 'streak'], default: 'study' }
}, { timestamps: true });

missionSchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model('Mission', missionSchema);
