const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true }, // URL or Emoji
  criteria: {
    type: { type: String, enum: ['xp', 'streak', 'tasks', 'manual'], default: 'manual' },
    value: { type: Number, default: 0 }
  },
  rarity: { type: String, enum: ['common', 'rare', 'epic', 'legendary'], default: 'common' },
  color: { type: String, default: '#7c3aed' }
}, { timestamps: true });

module.exports = mongoose.model('Badge', badgeSchema);
