const express = require('express');
const router = express.Router();
const { applyToJob, getMyApplications, getJobApplications, acceptApplication, rejectApplication } = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');

// Any verified user can apply to jobs (not their own), and manage applications for jobs they posted
router.post('/', protect, applyToJob);
router.get('/my-applications', protect, getMyApplications);
router.get('/job/:jobId', protect, getJobApplications);
router.patch('/:id/accept', protect, acceptApplication);
router.patch('/:id/reject', protect, rejectApplication);

module.exports = router;
