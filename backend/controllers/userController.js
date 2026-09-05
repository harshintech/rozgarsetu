const User = require('../models/User');
const { cloudinary } = require('../config/cloudinary');

// GET /api/users/me
const getMe = async (req, res) => {
  res.json(req.user);
};

// PUT /api/users/me
const updateMe = async (req, res) => {
  const { name, location } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, location },
      { new: true, runValidators: true }
    ).select('-otp -otpExpiry');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/users/avatar
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    // Delete old avatar if exists
    if (req.user.avatarPublicId) {
      await cloudinary.uploader.destroy(req.user.avatarPublicId);
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatarUrl: req.file.path, avatarPublicId: req.file.filename },
      { new: true }
    ).select('-otp -otpExpiry');
    res.json({ avatarUrl: user.avatarUrl });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/users/avatar
const deleteAvatar = async (req, res) => {
  try {
    if (req.user.avatarPublicId) {
      await cloudinary.uploader.destroy(req.user.avatarPublicId);
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatarUrl: '', avatarPublicId: '' },
      { new: true }
    ).select('-otp -otpExpiry');
    res.json({ message: 'Avatar deleted', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getMe, updateMe, uploadAvatar, deleteAvatar };
