import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate, STATUS_BADGE, getInitials } from '../utils/constants';
import './Applications.css';

export default function Applications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('inbox');
  const [myJobs, setMyJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobApps, setJobApps] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [myApps, setMyApps] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [jobsRes, appsRes] = await Promise.allSettled([
        api.get('/jobs/my-jobs'),
        api.get('/applications/my-applications'),
      ]);
      const jobs = jobsRes.status === 'fulfilled' ? jobsRes.value.data : [];
      const apps = appsRes.status === 'fulfilled' ? appsRes.value.data : [];
      setMyJobs(jobs);
      setMyApps(apps);
      if (jobs.length > 0) selectJob(jobs[0]);
    } catch (err) {
      toast.error('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const selectJob = async (job) => {
    setSelectedJob(job);
    setAppsLoading(true);
    try {
      const res = await api.get(`/applications/job/${job._id}`);
      setJobApps(res.data);
    } catch { setJobApps([]); }
    finally { setAppsLoading(false); }
  };

  const handleAccept = async (appId) => {
    setActionLoading(appId);
    try {
      await api.patch(`/applications/${appId}/accept`);
      toast.success('Applicant accepted! Job assigned.');
      selectJob(selectedJob);
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setActionLoading(''); }
  };

  const handleReject = async (appId) => {
    setActionLoading(appId + 'r');
    try {
      await api.patch(`/applications/${appId}/reject`);
      toast.success('Application rejected');
      selectJob(selectedJob);
    } catch { toast.error('Failed'); }
    finally { setActionLoading(''); }
  };

  const filteredApps = filterStatus === 'all' ? myApps : myApps.filter(a => a.status === filterStatus);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="page-content">
      <div className="container">
        <div style={{ marginBottom: 24 }}>
          <h1 className="page-title">📋 Applications</h1>
          <p className="page-subtitle">
            {myJobs.length} job{myJobs.length !== 1 ? 's' : ''} posted · {myApps.length} application{myApps.length !== 1 ? 's' : ''} submitted
          </p>
        </div>

        {/* Main tab switcher */}
        <div className="apps-main-tabs">
          <button className={`apps-main-tab ${activeTab === 'inbox' ? 'active' : ''}`} onClick={() => setActiveTab('inbox')}>
            <span className="amt-icon">📥</span>
            <div>
              <div className="amt-label">Applications Inbox</div>
              <div className="amt-sub">People who applied to your jobs</div>
            </div>
            {myJobs.length > 0 && <span className="amt-count">{myJobs.length} jobs</span>}
          </button>
          <button className={`apps-main-tab ${activeTab === 'mine' ? 'active' : ''}`} onClick={() => setActiveTab('mine')}>
            <span className="amt-icon">📤</span>
            <div>
              <div className="amt-label">My Applications</div>
              <div className="amt-sub">Jobs you applied to</div>
            </div>
            {myApps.length > 0 && <span className="amt-count">{myApps.length}</span>}
          </button>
        </div>

        {/* TAB: INBOX */}
        {activeTab === 'inbox' && (
          myJobs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">💼</div>
              <h3>No jobs posted yet</h3>
              <p>Post a job to receive applications. Anyone can post — homeowners, shops, companies!</p>
              <button className="btn btn-primary mt-2" onClick={() => navigate('/jobs/post')}>+ Post a Job</button>
            </div>
          ) : (
            <div className="employer-apps-layout">
              <div className="jobs-panel">
                <div className="jobs-panel-header">My Posted Jobs</div>
                {myJobs.map(job => (
                  <div key={job._id} className={`job-panel-item ${selectedJob?._id === job._id ? 'active' : ''}`} onClick={() => selectJob(job)}>
                    <div className="job-panel-title">{job.title}</div>
                    <div className="job-panel-meta">{job.category} · <span className={`badge ${STATUS_BADGE[job.status]} badge-sm`}>{job.status}</span></div>
                  </div>
                ))}
                <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
                  <button className="btn btn-primary btn-sm btn-block" onClick={() => navigate('/jobs/post')}>+ Post New Job</button>
                </div>
              </div>

              <div className="apps-panel">
                {!selectedJob ? (
                  <div className="empty-state"><div className="empty-state-icon">👈</div><h3>Select a job</h3><p>Choose a job to see applicants</p></div>
                ) : (
                  <>
                    <div className="apps-panel-header">
                      <div>
                        <div className="apps-panel-title">{selectedJob.title}</div>
                        <div className="apps-panel-sub">{jobApps.length} applicant{jobApps.length !== 1 ? 's' : ''} · <span className={`badge ${STATUS_BADGE[selectedJob.status]} badge-sm`}>{selectedJob.status}</span></div>
                      </div>
                      <button className="btn btn-outline btn-sm" onClick={() => navigate(`/jobs/${selectedJob._id}`)}>View Job →</button>
                    </div>

                    {appsLoading ? (
                      <div className="loading-center"><div className="spinner" /></div>
                    ) : jobApps.length === 0 ? (
                      <div className="empty-state"><div className="empty-state-icon">📭</div><h3>No applications yet</h3><p>Workers will apply and appear here.</p></div>
                    ) : (
                      <div className="applicants-list" style={{ padding: '0 4px' }}>
                        {jobApps.map(app => {
                          const w = app.workerId;
                          return (
                            <div key={app._id} className="applicant-row-full">
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                                {w?.avatarUrl ? <img src={w.avatarUrl} alt="" className="avatar avatar-md" /> : <div className="avatar avatar-md">{getInitials(w?.name)}</div>}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div className="app-worker-name" onClick={() => navigate(`/workers/${w?._id}`)}>{w?.name}</div>
                                  <div className="app-worker-meta">Asking: <strong>{formatCurrency(app.expectedSalary)}/day</strong>{w?.location?.city && ` · 📍 ${w.location.city}`}</div>
                                  {app.message && <div className="app-worker-message">"{app.message}"</div>}
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>Applied {formatDate(app.createdAt)}</div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                                <span className={`badge ${STATUS_BADGE[app.status]}`}>{app.status}</span>
                                {app.status === 'pending' && selectedJob.status === 'open' && (
                                  <div style={{ display: 'flex', gap: 6 }}>
                                    <button className="btn btn-success btn-sm" onClick={() => handleAccept(app._id)} disabled={!!actionLoading}>{actionLoading === app._id ? '…' : '✅ Accept'}</button>
                                    <button className="btn btn-danger btn-sm" onClick={() => handleReject(app._id)} disabled={!!actionLoading}>{actionLoading === app._id + 'r' ? '…' : '✗ Reject'}</button>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )
        )}

        {/* TAB: MY APPLICATIONS */}
        {activeTab === 'mine' && (
          <>
            <div className="tabs">
              {['all', 'pending', 'accepted', 'rejected'].map(s => (
                <button key={s} className={`tab-btn ${filterStatus === s ? 'active' : ''}`} onClick={() => setFilterStatus(s)}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                  {s !== 'all' && <span style={{ marginLeft: 4, fontSize: '0.75rem' }}>({myApps.filter(a => a.status === s).length})</span>}
                </button>
              ))}
            </div>

            {filteredApps.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <h3>{filterStatus !== 'all' ? `No ${filterStatus} applications` : "You haven't applied to any jobs yet"}</h3>
                <p>Browse available jobs and apply to get started.</p>
                <button className="btn btn-primary mt-2" onClick={() => navigate('/jobs')}>Browse Jobs</button>
              </div>
            ) : (
              <div className="applications-list">
                {filteredApps.map(app => {
                  const job = app.jobId;
                  return (
                    <div key={app._id} className="app-card card" onClick={() => job?._id && navigate(`/jobs/${job._id}`)}>
                      <div className="app-card-body">
                        <div className="app-job-info">
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="app-job-title">{job?.title || 'Job'}</div>
                            <div className="app-job-meta">
                              {job?.category}{job?.salary ? ` · Offers ${formatCurrency(job.salary)}/day` : ''}{` · Your ask: ${formatCurrency(app.expectedSalary)}/day`}
                            </div>
                            {job?.location?.city && <div className="app-job-meta">📍 {job.location.city}</div>}
                            {app.message && <div className="app-message">"{app.message.slice(0, 120)}{app.message.length > 120 ? '…' : ''}"</div>}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                            <span className={`badge ${STATUS_BADGE[app.status]}`}>{app.status}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDate(app.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
