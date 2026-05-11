const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseName: { type: String, required: true },
  issueDate: { type: Date, default: Date.now },
  certificateId: { type: String, unique: true, required: true },
  pdfUrl: String,
  metadata: {
    score: Number,
    completionDate: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Certificate', certificateSchema);
