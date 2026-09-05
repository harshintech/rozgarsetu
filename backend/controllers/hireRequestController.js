const HireRequest = require('../models/HireRequest');
const EmployerProfile = require('../models/EmployerProfile');

// POST /api/hire-requests
const sendHireRequest = async (req, res) => {
  try {
    const { workerId, salary, durationInDays, startDate, description } = req.body;

    if (String(workerId) === String(req.user._id)) {
      return res.status(400).json({ message: 'You cannot send a hire request to yourself' });
    }

    const request = await HireRequest.create({
      employerId: req.user._id, workerId, salary, durationInDays, startDate, description
    });
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/hire-requests/received (worker)
const getReceivedRequests = async (req, res) => {
  try {
    const requests = await HireRequest.find({ workerId: req.user._id })
      .populate('employerId', 'name avatarUrl location phone')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/hire-requests/sent (employer)
const getSentRequests = async (req, res) => {
  try {
    const requests = await HireRequest.find({ employerId: req.user._id })
      .populate('workerId', 'name avatarUrl location phone')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/hire-requests/:id/accept
const acceptRequest = async (req, res) => {
  try {
    const request = await HireRequest.findOne({ _id: req.params.id, workerId: req.user._id, status: 'pending' });
    if (!request) return res.status(404).json({ message: 'Request not found' });
    request.status = 'accepted';
    await request.save();
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/hire-requests/:id/reject
const rejectRequest = async (req, res) => {
  try {
    const request = await HireRequest.findOne({ _id: req.params.id, workerId: req.user._id, status: 'pending' });
    if (!request) return res.status(404).json({ message: 'Request not found' });
    request.status = 'rejected';
    await request.save();
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/hire-requests/:id/cancel
const cancelRequest = async (req, res) => {
  try {
    const request = await HireRequest.findOne({ _id: req.params.id, employerId: req.user._id });
    if (!request) return res.status(404).json({ message: 'Request not found' });
    request.status = 'cancelled';
    await request.save();
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/hire-requests/:id/complete
const completeRequest = async (req, res) => {
  try {
    const request = await HireRequest.findOne({ _id: req.params.id, employerId: req.user._id, status: 'accepted' });
    if (!request) return res.status(404).json({ message: 'Request not found or not accepted' });
    request.status = 'completed';
    await request.save();
    // Increment employer totalHires
    await EmployerProfile.findOneAndUpdate({ userId: req.user._id }, { $inc: { totalHires: 1 } });
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { sendHireRequest, getReceivedRequests, getSentRequests, acceptRequest, rejectRequest, cancelRequest, completeRequest };
