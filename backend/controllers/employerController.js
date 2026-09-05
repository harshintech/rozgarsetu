const EmployerProfile = require('../models/EmployerProfile');

// GET /api/employers/:id
const getEmployerById = async (req, res) => {
  try {
    const profile = await EmployerProfile.findOne({ userId: req.params.id })
      .populate('userId', 'name avatarUrl location phone');
    if (!profile) return res.status(404).json({ message: 'Employer not found' });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/employers/my-profile
const getMyProfile = async (req, res) => {
  try {
    const profile = await EmployerProfile.findOne({ userId: req.user._id });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/employers/profile
const createOrUpdateProfile = async (req, res) => {
  try {
    const { companyName, businessType, description } = req.body;
    const profile = await EmployerProfile.findOneAndUpdate(
      { userId: req.user._id },
      { userId: req.user._id, companyName, businessType, description },
      { new: true, upsert: true, runValidators: true }
    );
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getEmployerById, getMyProfile, createOrUpdateProfile };
