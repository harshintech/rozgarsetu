import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { JOB_CATEGORIES } from '../utils/constants';
import JobCard from '../components/JobCard';
import ApplyModal from '../components/ApplyModal';
import '../components/JobCard.css';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [applyTarget, setApplyTarget] = useState(null);
  const [appliedIds, setAppliedIds] = useState(new Set());
  const { user } = useAuth();

  const [filters, setFilters] = useState({ category: '', city: '', status: 'open' });

  const fetchJobs = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page: pg, limit: 12 });
      if (filters.category) q.set('category', filters.category);
      if (filters.city) q.set('city', filters.city);
      if (filters.status) q.set('status', filters.status);
      const res = await api.get(`/jobs?${q}`);
      setJobs(res.data.jobs);
      setTotal(res.data.total);
      setPages(res.data.pages);
      setPage(pg);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchJobs(1); }, [fetchJobs]);

  useEffect(() => {
    if (user) {
      api.get('/applications/my-applications').then(res => {
        setAppliedIds(new Set(res.data.map(a => a.jobId?._id)));
      }).catch(() => {});
    }
  }, [user]);

  return (
    <div className="page-content">
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="page-title">Browse Jobs 💼</h1>
            <p className="page-subtitle">{total} jobs available</p>
          </div>
          {user && (
            <Link to="/jobs/post" className="btn btn-primary">+ Post a Job</Link>
          )}
        </div>

        {/* Category Pills */}
        <div className="category-pills">
          <button className={`category-pill ${!filters.category ? 'active' : ''}`} onClick={() => setFilters(f => ({ ...f, category: '' }))}>
            All Jobs
          </button>
          {JOB_CATEGORIES.slice(0, 10).map(cat => (
            <button key={cat.value} className={`category-pill ${filters.category === cat.value ? 'active' : ''}`} onClick={() => setFilters(f => ({ ...f, category: cat.value }))}>
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="filter-bar">
          <div className="filter-row">
            <div className="filter-group">
              <label className="filter-label">Category</label>
              <select className="form-input" value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}>
                <option value="">All Categories</option>
                {JOB_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">City</label>
              <input className="form-input" placeholder="e.g. Delhi…" value={filters.city} onChange={e => setFilters(f => ({ ...f, city: e.target.value }))} />
            </div>
            <div className="filter-group">
              <label className="filter-label">Status</label>
              <select className="form-input" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
                <option value="open">Open</option>
                <option value="assigned">Assigned</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div style={{ alignSelf: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setFilters({ category: '', city: '', status: 'open' })}>Reset</button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : jobs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💼</div>
            <h3>No jobs found</h3>
            <p>Try changing your filters</p>
            {user && <Link to="/jobs/post" className="btn btn-primary mt-2">Post First Job</Link>}
          </div>
        ) : (
          <>
            <div className="jobs-grid">
              {jobs.map(job => {
                const isOwner = user && String(job.employerId?._id || job.employerId) === String(user._id);
                return (
                  <JobCard
                    key={job._id}
                    job={job}
                    showApplyBtn={!!user && !isOwner}
                    applied={appliedIds.has(job._id)}
                    onApply={setApplyTarget}
                  />
                );
              })}
            </div>
            {pages > 1 && (
              <div className="pagination">
                <button className="page-btn" onClick={() => fetchJobs(page - 1)} disabled={page === 1}>‹</button>
                {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                  <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => fetchJobs(p)}>{p}</button>
                ))}
                <button className="page-btn" onClick={() => fetchJobs(page + 1)} disabled={page === pages}>›</button>
              </div>
            )}
          </>
        )}
      </div>

      {applyTarget && (
        <ApplyModal
          job={applyTarget}
          onClose={() => setApplyTarget(null)}
          onSuccess={() => { fetchJobs(page); setAppliedIds(ids => new Set([...ids, applyTarget._id])); }}
        />
      )}
    </div>
  );
}
