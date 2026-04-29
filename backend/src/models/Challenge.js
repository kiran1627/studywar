const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema(
  {
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    title: { type: String, required: true, trim: true },
    durationDays: { type: Number, required: true, min: 3, max: 7 },
    startDate: { type: Date, required: true, default: Date.now },
    endDate: { 
      type: Date, 
      required: true, 
      default: function() {
        const date = new Date();
        date.setDate(date.getDate() + this.durationDays);
        return date;
      }
    },
    status: { type: String, enum: ['active', 'completed'], default: 'active' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Challenge', challengeSchema);
