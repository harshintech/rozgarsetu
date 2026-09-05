const express = require('express');
const router = express.Router();
const { getJobs, getJobById, getMyJobs, createJob, updateJob, deleteJob, markJobComplete } = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');

// Both workers AND employers can post and manage jobs
router.get('/', getJobs);
router.get('/my-jobs', protect, getMyJobs);
router.post('/', protect, createJob);
router.get('/:id', getJobById);
router.put('/:id', protect, updateJob);
router.delete('/:id', protect, deleteJob);
router.patch('/:id/complete', protect, markJobComplete);

module.exports = router;
