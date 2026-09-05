const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// POST /api/auth/send-otp
const sendOTP = async (req, res) => {
  const { phone, name, role } = req.body;
  if (!phone) return res.status(400).json({ message: 'Phone number required' });

  try {
    let user = await User.findOne({ phone });
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    if (user) {
      user.otp = otp;
      user.otpExpiry = otpExpiry;
      await user.save();
      console.log(`\n📱 OTP for ${phone}: ${otp}\n`);
      return res.json({ message: 'OTP sent', isNewUser: false });
    } else {
      if (!name || !role) return res.status(400).json({ message: 'Name and role required for new users' });
      user = await User.create({ phone, name, role, otp, otpExpiry });
      console.log(`\n📱 OTP for ${phone}: ${otp}\n`);
      return res.json({ message: 'OTP sent', isNewUser: true });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/verify-otp
const verifyOTP = async (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) return res.status(400).json({ message: 'Phone and OTP required' });

  try {
    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
    if (user.otpExpiry < new Date()) return res.status(400).json({ message: 'OTP expired' });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const token = generateToken(user._id);
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        avatarUrl: user.avatarUrl,
        location: user.location,
        isVerified: user.isVerified,
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/check-phone
const checkPhone = async (req, res) => {
  const { phone } = req.body;
  try {
    const user = await User.findOne({ phone });
    res.json({ exists: !!user, role: user?.role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { sendOTP, verifyOTP, checkPhone };
