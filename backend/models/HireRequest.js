const mongoose = require('mongoose');

const hireRequestSchema = new mongoose.Schema({
  employerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  salary: { type: Number, required: true },
  durationInDays: { type: Number, required: true },
  startDate: { type: Date, required: true },
  description: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'cancelled', 'completed'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('HireRequest', hireRequestSchema);
