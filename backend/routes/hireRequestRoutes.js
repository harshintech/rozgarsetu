const express = require('express');
const router = express.Router();
const {
  sendHireRequest, getReceivedRequests, getSentRequests,
  acceptRequest, rejectRequest, cancelRequest, completeRequest
} = require('../controllers/hireRequestController');
const { protect } = require('../middleware/authMiddleware');

// Any logged-in user can send a hire request to another user
router.post('/', protect, sendHireRequest);

// "Received" = requests where I am the workerId (the one being hired)
router.get('/received', protect, getReceivedRequests);

// "Sent" = requests where I am the employerId (the one doing the hiring)
router.get('/sent', protect, getSentRequests);

// The recipient accepts/rejects
router.patch('/:id/accept', protect, acceptRequest);
router.patch('/:id/reject', protect, rejectRequest);

// The sender cancels or marks complete
router.patch('/:id/cancel', protect, cancelRequest);
router.patch('/:id/complete', protect, completeRequest);

module.exports = router;
