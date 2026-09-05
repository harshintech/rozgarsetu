const mongoose = require('mongoose');

const workerProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  skills: [{ type: String, trim: true }],
  experienceYears: { type: Number, default: 0 },
  expectedDailyWage: { type: Number, default: 0 },
  languages: [{ type: String }],
  availability: { type: String, enum: ['available', 'busy', 'offline'], default: 'available' },
  description: { type: String, default: '' },
  rating: { type: Number, default: 0 },
  totalJobsCompleted: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('WorkerProfile', workerProfileSchema);
