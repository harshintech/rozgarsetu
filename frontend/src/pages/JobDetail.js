import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate, STATUS_BADGE, getInitials, JOB_CATEGORIES } from '../utils/constants';
import StarRating from '../components/StarRating';
import ApplyModal from '../components/ApplyModal';
import ReviewModal from '../components/ReviewModal';
import './DetailPage.css';

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);
  const [showApply, setShowApply] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [actionLoading, setActionLoading] = useState('');

  const isEmployer = user?.role === 'employer';
  const isOwner = user && String(job?.employerId?._id || job?.employerId) === String(user?._id);

  useEffect(() => { loadJob(); }, [id]);

  const loadJob = async () => {
    setLoading(true);
    try {
      const [jobRes, revRes] = await Promise.all([
        api.get(`/jobs/${id}`),
        api.get(`/reviews/${id}`),
      ]);
      setJob(jobRes.data);
      setReviews(revRes.data);

      if (user?.role === 'worker') {
        const myApps = await api.get('/applications/my-applications');
        setApplied(myApps.data.some(a => a.jobId?._id === id));
      }
      if (isOwner || (user && jobRes.data.employerId?._id === user?._id)) {
        const appRes = await api.get(`/applications/job/${id}`);
        setApplications(appRes.data);
      }
    } catch (err) {
      toast.error('Failed to load job');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptApp = async (appId) => {
    setActionLoading(appId);
    try {
      await api.patch(`/applications/${appId}/accept`);
      toast.success('Applicant accepted!');
      loadJob();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setActionLoading(''); }
  };

  const handleRejectApp = async (appId) => {
    setActionLoading(appId + 'r');
    try {
      await api.patch(`/applications/${appId}/reject`);
      toast.success('Application rejected');
      loadJob();
    } catch (err) {
      toast.error('Failed');
    } finally { setActionLoading(''); }
  };

  const handleComplete = async () => {
    if (!window.confirm('Mark this job as completed?')) return;
    try {
      await api.patch(`/jobs/${id}/complete`);
      toast.success('Job marked as completed!');
      loadJob();
    } catch (err) { toast.error('Failed'); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this job? This cannot be undone.')) return;
    try {
      await api.delete(`/jobs/${id}`);
      toast.success('Job deleted');
      navigate('/jobs');
    } catch (err) { toast.error('Failed to delete'); }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!job) return <div className="loading-center"><h3>Job not found</h3></div>;

  const cat = JOB_CATEGORIES.find(c => c.value === job.category);
  const employer = job.employerId;

  return (
    <div className="page-content">
      <div className="container">
        <button className="back-btn-page" onClick={() => navigate(-1)}>← Back to Jobs</button>

        {/* Job Header */}
        <div className="job-detail-header">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <span style={{ fontSize: '2.2rem' }}>{cat?.icon || '💼'}</span>
                <span className={`badge ${STATUS_BADGE[job.status]}`} style={{ fontSize: '0.85rem' }}>{job.status}</span>
              </div>
              <h1 className="job-detail-title">{job.title}</h1>
              <div className="job-detail-meta">
                <div className="job-detail-meta-item">💰 <strong>{formatCurrency(job.salary)}/day</strong></div>
                <div className="job-detail-meta-item">📅 Starts <strong>{formatDate(job.startDate)}</strong></div>
                <div className="job-detail-meta-item">⏳ <strong>{job.durationInDays} days</strong></div>
                {job.location?.city && <div className="job-detail-meta-item">📍 <strong>{job.location.city}{job.location.state && `, ${job.location.state}`}</strong></div>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {user && !isOwner && job.status === 'open' && (
                <button className={`btn ${applied ? 'btn-ghost' : 'btn-primary'} btn-lg`} onClick={() => !applied && setShowApply(true)} disabled={applied}>
                  {applied ? '✅ Applied' : '📝 Apply Now'}
                </button>
              )}
              {isOwner && job.status === 'assigned' && (
                <button className="btn btn-success" onClick={handleComplete}>✅ Mark Complete</button>
              )}
              {isOwner && job.status === 'open' && (
                <button className="btn btn-danger btn-sm" onClick={handleDelete}>🗑️ Delete</button>
              )}
              {job.status === 'completed' && user && (
                <button className="btn btn-outline" onClick={() => setShowReview(true)}>⭐ Review</button>
              )}
            </div>
          </div>
        </div>

        <div className="detail-layout">
          {/* Left */}
          <div className="detail-sidebar">
            {/* Employer Info */}
            {employer && (
              <div className="card card-body" style={{ marginBottom: 16 }}>
                <h3 className="detail-section-title">🏢 Posted By</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {employer.avatarUrl
                    ? <img src={employer.avatarUrl} alt="" className="avatar avatar-md" />
                    : <div className="avatar avatar-md">{getInitials(employer.name)}</div>
                  }
                  <div>
                    <div style={{ fontWeight: 700 }}>{employer.name}</div>
                    {employer.location?.city && <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>📍 {employer.location.city}</div>}
                    {user && employer.phone && <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>📱 {employer.phone}</div>}
                  </div>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="card card-body">
              <h3 className="detail-section-title">📊 Job Details</h3>
              <div className="detail-meta-list">
                <div className="detail-meta-row"><span className="meta-icon">🏷️</span><span>Category: <strong>{job.category}</strong></span></div>
                <div className="detail-meta-row"><span className="meta-icon">💵</span><span>Total Pay: <strong>{formatCurrency(job.salary * job.durationInDays)}</strong></span></div>
                <div className="detail-meta-row"><span className="meta-icon">📅</span><span>Duration: <strong>{job.durationInDays} days</strong></span></div>
                <div className="detail-meta-row"><span className="meta-icon">📝</span><span>Applicants: <strong>{applications.length}</strong></span></div>
                {job.assignedWorker && (
                  <div className="detail-meta-row">
                    <span className="meta-icon">👷</span>
                    <span>Worker: <strong>{job.assignedWorker.name}</strong></span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="detail-main">
            {/* Description */}
            <div className="card card-body detail-section">
              <h3 className="detail-section-title">📋 Job Description</h3>
              <p className="detail-description" style={{ whiteSpace: 'pre-wrap' }}>{job.description}</p>
            </div>

            {/* Applications - visible to employer/owner */}
            {isOwner && applications.length > 0 && (
              <div className="card card-body detail-section">
                <h3 className="detail-section-title">👥 Applications ({applications.length})</h3>
                <div className="applicants-list">
                  {applications.map(app => {
                    const w = app.workerId;
                    return (
                      <div key={app._id} className="applicant-row">
                        {w?.avatarUrl
                          ? <img src={w.avatarUrl} alt="" className="avatar avatar-md" />
                          : <div className="avatar avatar-md">{getInitials(w?.name)}</div>
                        }
                        <div className="applicant-info">
                          <div className="applicant-name">{w?.name}</div>
                          <div className="applicant-sub">
                            Expected: {formatCurrency(app.expectedSalary)}/day
                            {app.message && ` · "${app.message.slice(0, 60)}${app.message.length > 60 ? '…' : ''}"`}
                          </div>
                          {w?.location?.city && <div className="applicant-sub">📍 {w.location.city}</div>}
                        </div>
                        <span className={`badge ${STATUS_BADGE[app.status]}`}>{app.status}</span>
                        {app.status === 'pending' && job.status === 'open' && (
                          <div className="applicant-actions">
                            <button className="btn btn-success btn-sm" onClick={() => handleAcceptApp(app._id)} disabled={actionLoading === app._id}>
                              {actionLoading === app._id ? '…' : '✅ Accept'}
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleRejectApp(app._id)} disabled={actionLoading === app._id + 'r'}>
                              {actionLoading === app._id + 'r' ? '…' : '✗ Reject'}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="card card-body detail-section">
              <h3 className="detail-section-title">⭐ Reviews</h3>
              {reviews.length === 0
                ? <p className="text-muted" style={{ fontSize: '0.9rem' }}>No reviews yet</p>
                : <div className="reviews-list">
                    {reviews.map(r => (
                      <div key={r._id} className="review-item">
                        <div className="review-header">
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className="avatar avatar-sm">{getInitials(r.reviewerId?.name)}</div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{r.reviewerId?.name}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDate(r.createdAt)}</div>
                            </div>
                          </div>
                          <StarRating rating={r.rating} size={13} />
                        </div>
                        {r.comment && <p className="review-comment">{r.comment}</p>}
                      </div>
                    ))}
                  </div>
              }
            </div>
          </div>
        </div>
      </div>

      {showApply && <ApplyModal job={job} onClose={() => setShowApply(false)} onSuccess={() => { setApplied(true); loadJob(); }} />}
      {showReview && <ReviewModal reviewee={employer} jobId={id} onClose={() => setShowReview(false)} onSuccess={loadJob} />}
    </div>
  );
}
