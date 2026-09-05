const mongoose = require('mongoose');

const employerProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  companyName: { type: String, default: '' },
  businessType: { type: String, default: '' },
  description: { type: String, default: '' },
  rating: { type: Number, default: 0 },
  totalHires: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('EmployerProfile', employerProfileSchema);
