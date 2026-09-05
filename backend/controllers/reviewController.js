const Review = require('../models/Review');
const WorkerProfile = require('../models/WorkerProfile');
const EmployerProfile = require('../models/EmployerProfile');

// POST /api/reviews
const createReview = async (req, res) => {
  try {
    const { revieweeId, rating, comment, jobId, hireRequestId } = req.body;
    const review = await Review.create({
      reviewerId: req.user._id, revieweeId, rating, comment, jobId, hireRequestId
    });

    // Update reviewee's average rating
    const reviews = await Review.find({ revieweeId });
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    // Update in whichever profile exists
    await WorkerProfile.findOneAndUpdate({ userId: revieweeId }, { rating: avg.toFixed(1) });
    await EmployerProfile.findOneAndUpdate({ userId: revieweeId }, { rating: avg.toFixed(1) });

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/reviews/:userId
const getReviewsForUser = async (req, res) => {
  try {
    const reviews = await Review.find({ revieweeId: req.params.userId })
      .populate('reviewerId', 'name avatarUrl role')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createReview, getReviewsForUser };
