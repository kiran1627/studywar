const mongoose = require('mongoose');

const roadmapSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  steps: [{
    title: { type: String, required: true },
    description: String,
    moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module' },
    type: { type: String, enum: ['module', 'task', 'external'], default: 'module' },
    url: String // For external resources
  }],
  isPublic: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Roadmap', roadmapSchema);
