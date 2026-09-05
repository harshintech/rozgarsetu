const JobApplication = require('../models/JobApplication');
const Job = require('../models/Job');

// POST /api/applications
const applyToJob = async (req, res) => {
  try {
    const { jobId, expectedSalary, message } = req.body;
    const job = await Job.findById(jobId);
    if (!job || job.status !== 'open') return res.status(400).json({ message: 'Job not available' });

    // Cannot apply to your own posted job
    if (String(job.employerId) === String(req.user._id)) {
      return res.status(400).json({ message: 'You cannot apply to your own job' });
    }

    const existing = await JobApplication.findOne({ jobId, workerId: req.user._id });
    if (existing) return res.status(400).json({ message: 'Already applied' });

    const application = await JobApplication.create({
      jobId, workerId: req.user._id, expectedSalary, message
    });
    res.status(201).json(application);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/applications/my-applications (any role — returns apps submitted by this user)
const getMyApplications = async (req, res) => {
  try {
    const apps = await JobApplication.find({ workerId: req.user._id })
      .populate('jobId', 'title category salary status location employerId')
      .sort({ createdAt: -1 });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/applications/job/:jobId (job poster — any role)
const getJobApplications = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.jobId, employerId: req.user._id });
    if (!job) return res.status(403).json({ message: 'Unauthorized — you did not post this job' });

    const apps = await JobApplication.find({ jobId: req.params.jobId })
      .populate('workerId', 'name avatarUrl location phone')
      .sort({ createdAt: -1 });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/applications/:id/accept
const acceptApplication = async (req, res) => {
  try {
    const app = await JobApplication.findById(req.params.id).populate('jobId');
    if (!app) return res.status(404).json({ message: 'Application not found' });

    const job = await Job.findOne({ _id: app.jobId._id, employerId: req.user._id });
    if (!job) return res.status(403).json({ message: 'Unauthorized' });

    // Accept this, reject others
    await JobApplication.updateMany({ jobId: app.jobId._id, _id: { $ne: app._id } }, { status: 'rejected' });
    app.status = 'accepted';
    await app.save();

    job.status = 'assigned';
    job.assignedWorker = app.workerId;
    await job.save();

    res.json({ application: app, job });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/applications/:id/reject
const rejectApplication = async (req, res) => {
  try {
    const app = await JobApplication.findById(req.params.id).populate('jobId');
    if (!app) return res.status(404).json({ message: 'Application not found' });
    const job = await Job.findOne({ _id: app.jobId._id, employerId: req.user._id });
    if (!job) return res.status(403).json({ message: 'Unauthorized' });
    app.status = 'rejected';
    await app.save();
    res.json(app);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { applyToJob, getMyApplications, getJobApplications, acceptApplication, rejectApplication };
