const express = require('express');
const router = express.Router();
const { getMe, updateMe, uploadAvatar, deleteAvatar } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);
router.delete('/avatar', protect, deleteAvatar);

module.exports = router;
