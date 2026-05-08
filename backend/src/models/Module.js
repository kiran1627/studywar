const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    days: { type: Number, required: true, min: 1 },
    order: { type: Number, required: true },
    icon: { type: String, default: '📚' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Module', moduleSchema);
