const express = require('express');
const router = express.Router();
const { getEmployerById, getMyProfile, createOrUpdateProfile } = require('../controllers/employerController');
const { protect, requireRole } = require('../middleware/authMiddleware');

router.get('/my-profile', protect, requireRole('employer'), getMyProfile);
router.post('/profile', protect, requireRole('employer'), createOrUpdateProfile);
router.get('/:id', getEmployerById);

module.exports = router;
