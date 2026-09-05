import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatDate, STATUS_BADGE, JOB_CATEGORIES } from '../utils/constants';

export default function JobCard({ job, onApply, showApplyBtn = true, applied = false }) {
  const navigate = useNavigate();
  const employer = job.employerId;
  const cat = JOB_CATEGORIES.find(c => c.value === job.category);

  return (
    <div className="job-card card" onClick={() => navigate(`/jobs/${job._id}`)}>
      <div className="job-card-header">
        <div className="job-cat-icon">{cat?.icon || '💼'}</div>
        <div className="job-card-title-wrap">
          <h3 className="job-title">{job.title}</h3>
          <span className="job-category">{job.category}</span>
        </div>
        <span className={`badge ${STATUS_BADGE[job.status]}`}>{job.status}</span>
      </div>

      <div className="job-card-body">
        <div className="job-detail-row">
          <span>💰</span><span>{formatCurrency(job.salary)} / day</span>
        </div>
        <div className="job-detail-row">
          <span>📅</span><span>Starts {formatDate(job.startDate)} · {job.durationInDays} days</span>
        </div>
        {job.location?.city && (
          <div className="job-detail-row">
            <span>📍</span><span>{job.location.city}{job.location.state ? `, ${job.location.state}` : ''}</span>
          </div>
        )}
        {employer?.name && (
          <div className="job-detail-row">
            <span>🏢</span><span>{employer.name}</span>
          </div>
        )}
        {job.description && (
          <p className="job-desc">{job.description.slice(0, 100)}{job.description.length > 100 ? '…' : ''}</p>
        )}
      </div>

      {showApplyBtn && job.status === 'open' && (
        <div className="job-card-footer">
          <button
            className={`btn btn-sm w-full ${applied ? 'btn-ghost' : 'btn-primary'}`}
            onClick={e => { e.stopPropagation(); if (!applied && onApply) onApply(job); else navigate(`/jobs/${job._id}`); }}
            disabled={applied}
          >
            {applied ? '✅ Applied' : '📝 Apply Now'}
          </button>
        </div>
      )}
    </div>
  );
}
