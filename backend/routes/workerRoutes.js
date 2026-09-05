const express = require('express');
const router = express.Router();
const { getWorkers, getWorkerById, getMyProfile, createOrUpdateProfile, updateAvailability } = require('../controllers/workerController');
const { protect, requireRole } = require('../middleware/authMiddleware');

router.get('/', getWorkers);
router.get('/my-profile', protect, requireRole('worker'), getMyProfile);
router.post('/profile', protect, requireRole('worker'), createOrUpdateProfile);
router.patch('/availability', protect, requireRole('worker'), updateAvailability);
router.get('/:id', getWorkerById);

module.exports = router;
