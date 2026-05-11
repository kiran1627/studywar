const mongoose = require('mongoose');

const mockTestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  duration: { type: Number, required: true }, // in minutes
  questions: [{
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctOption: { type: Number, required: true },
    explanation: String
  }],
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('MockTest', mockTestSchema);
