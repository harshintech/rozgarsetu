const WorkerProfile = require('../models/WorkerProfile');
const User = require('../models/User');

// GET /api/workers - list all workers with filters
const getWorkers = async (req, res) => {
  try {
    const { skill, city, availability, minWage, maxWage, page = 1, limit = 12 } = req.query;
    let profileQuery = {};
    if (skill) profileQuery.skills = { $in: [new RegExp(skill, 'i')] };
    if (availability) profileQuery.availability = availability;
    if (minWage || maxWage) {
      profileQuery.expectedDailyWage = {};
      if (minWage) profileQuery.expectedDailyWage.$gte = Number(minWage);
      if (maxWage) profileQuery.expectedDailyWage.$lte = Number(maxWage);
    }

    let userQuery = { role: 'worker', isVerified: true };
    if (city) userQuery['location.city'] = new RegExp(city, 'i');

    const users = await User.find(userQuery).select('_id');
    const userIds = users.map(u => u._id);
    profileQuery.userId = { $in: userIds };

    const total = await WorkerProfile.countDocuments(profileQuery);
    const profiles = await WorkerProfile.find(profileQuery)
      .populate('userId', 'name avatarUrl location phone')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ rating: -1 });

    res.json({ profiles, total, pages: Math.ceil(total / limit), page: Number(page) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/workers/:id
const getWorkerById = async (req, res) => {
  try {
    const profile = await WorkerProfile.findOne({ userId: req.params.id })
      .populate('userId', 'name avatarUrl location phone');
    if (!profile) return res.status(404).json({ message: 'Worker not found' });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/workers/my-profile
const getMyProfile = async (req, res) => {
  try {
    const profile = await WorkerProfile.findOne({ userId: req.user._id });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/workers/profile
const createOrUpdateProfile = async (req, res) => {
  try {
    const { skills, experienceYears, expectedDailyWage, languages, availability, description } = req.body;
    const profile = await WorkerProfile.findOneAndUpdate(
      { userId: req.user._id },
      { userId: req.user._id, skills, experienceYears, expectedDailyWage, languages, availability, description },
      { new: true, upsert: true, runValidators: true }
    );
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/workers/availability
const updateAvailability = async (req, res) => {
  try {
    const { availability } = req.body;
    const profile = await WorkerProfile.findOneAndUpdate(
      { userId: req.user._id },
      { availability },
      { new: true }
    );
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getWorkers, getWorkerById, getMyProfile, createOrUpdateProfile, updateAvailability };
