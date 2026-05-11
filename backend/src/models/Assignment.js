const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  dueDate: { type: Date, required: true },
  maxPoints: { type: Number, default: 100 },
  attachments: [{
    name: String,
    url: String
  }],
  submissions: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: String,
    attachments: [{ name: String, url: String }],
    status: { type: String, enum: ['pending', 'graded'], default: 'pending' },
    grade: Number,
    feedback: String,
    submittedAt: { type: Date, default: Date.now }
  }],
  batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' }
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
