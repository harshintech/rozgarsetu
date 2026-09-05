const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');
const WorkerProfile = require('../models/WorkerProfile');

// GET /api/jobs
const getJobs = async (req, res) => {
  try {
    const { category, city, status = 'open', page = 1, limit = 12 } = req.query;
    let query = { status };
    if (category) query.category = category;
    if (city) query['location.city'] = new RegExp(city, 'i');

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .populate('employerId', 'name avatarUrl location')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ jobs, total, pages: Math.ceil(total / limit), page: Number(page) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/jobs/:id
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('employerId', 'name avatarUrl location phone')
      .populate('assignedWorker', 'name avatarUrl');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/jobs/my-jobs (employer)
const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ employerId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/jobs
const createJob = async (req, res) => {
  try {
    const { title, category, description, salary, durationInDays, startDate, location } = req.body;
    const job = await Job.create({
      employerId: req.user._id,
      title, category, description, salary, durationInDays, startDate, location
    });
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/jobs/:id
const updateJob = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, employerId: req.user._id });
    if (!job) return res.status(404).json({ message: 'Job not found or unauthorized' });
    Object.assign(job, req.body);
    await job.save();
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/jobs/:id
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, employerId: req.user._id });
    if (!job) return res.status(404).json({ message: 'Job not found or unauthorized' });
    res.json({ message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/jobs/:id/complete
const markJobComplete = async (req, res) => {
  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, employerId: req.user._id, status: 'assigned' },
      { status: 'completed' },
      { new: true }
    );
    if (!job) return res.status(404).json({ message: 'Job not found or not in assigned state' });
    // Update worker stats
    if (job.assignedWorker) {
      await WorkerProfile.findOneAndUpdate(
        { userId: job.assignedWorker },
        { $inc: { totalJobsCompleted: 1 } }
      );
    }
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getJobs, getJobById, getMyJobs, createJob, updateJob, deleteJob, markJobComplete };
