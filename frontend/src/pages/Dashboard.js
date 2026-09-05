import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate, STATUS_BADGE, getInitials } from '../utils/constants';
import StarRating from '../components/StarRating';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isWorker = user?.role === 'worker';

  const [profile, setProfile] = useState(null);
  const [myApps, setMyApps] = useState([]);       // jobs this user applied to
  const [myJobs, setMyJobs] = useState([]);        // jobs this user posted
  const [hireReqs, setHireReqs] = useState([]);    // hire requests (received if worker, sent if employer)
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posted'); // 'posted' | 'applied'

  useEffect(() => { loadDashboard(); }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const profileEndpoint = isWorker ? '/workers/my-profile' : '/employers/my-profile';
      const hireEndpoint = isWorker ? '/hire-requests/received' : '/hire-requests/sent';

      const [profRes, appsRes, jobsRes, hireRes] = await Promise.allSettled([
        api.get(profileEndpoint),
        api.get('/applications/my-applications'),
        api.get('/jobs/my-jobs'),
        api.get(hireEndpoint),
      ]);

      if (profRes.status === 'fulfilled') setProfile(profRes.value.data);
      if (appsRes.status === 'fulfilled') setMyApps(appsRes.value.data);
      if (jobsRes.status === 'fulfilled') setMyJobs(jobsRes.value.data);
      if (hireRes.status === 'fulfilled') setHireReqs(hireRes.value.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /><p>Loading dashboard…</p></div>;

  const pendingHireReqs = hireReqs.filter(r => r.status === 'pending').length;
  const pendingApps = myApps.filter(a => a.status === 'pending').length;
  const openJobs = myJobs.filter(j => j.status === 'open').length;

  return (
    <div className="page-content">
      <div className="container">

        {/* Welcome Banner */}
        <div className="dashboard-welcome">
          <div className="welcome-left">
            {user?.avatarUrl
              ? <img src={user.avatarUrl} alt={user.name} className="avatar avatar-xl" />
              : <div className="avatar avatar-xl">{getInitials(user?.name)}</div>
            }
            <div>
              <div className="welcome-greeting">Good day! 👋</div>
              <h1 className="welcome-name">{user?.name}</h1>
              <div className="welcome-meta">
                <span className={`badge ${isWorker ? 'badge-primary' : 'badge-info'}`}>
                  {isWorker ? '👷 Worker' : '🏢 Employer'}
                </span>
                {user?.location?.city && <span className="text-muted">📍 {user.location.city}</span>}
                {profile?.rating > 0 && <StarRating rating={profile.rating} />}
              </div>
              {isWorker && profile && (
                <div className="welcome-avail">
                  <span className={`avail-dot avail-${profile.availability}`} />
                  <span>{profile.availability === 'available' ? 'Available for work' : profile.availability === 'busy' ? 'Currently busy' : 'Offline'}</span>
                </div>
              )}
            </div>
          </div>
          <div className="welcome-actions">
            <Link to="/jobs/post" className="btn btn-primary">+ Post a Job</Link>
            <Link to="/jobs" className="btn btn-outline">Browse Jobs</Link>
            {isWorker && <Link to="/workers" className="btn btn-outline">Find Workers</Link>}
          </div>
        </div>

        {/* Stats — same for both roles now */}
        <div className="dashboard-stats">
          <StatCard icon="💼" value={myJobs.length} label="Jobs I Posted" color="primary" />
          <StatCard icon="🟢" value={openJobs} label="Open Jobs" color="success" />
          <StatCard icon="📝" value={myApps.length} label="Jobs I Applied To" color="info" />
          <StatCard icon="📨" value={pendingHireReqs} label={isWorker ? 'Pending Hire Requests' : 'Awaiting Response'} color="warning" />
        </div>

        {/* Profile incomplete warning */}
        {!profile && (
          <div className="alert alert-info">
            <span>ℹ️</span>
            <div>
              Your profile is incomplete.{' '}
              <Link to={isWorker ? '/setup/worker' : '/setup/employer'} style={{ fontWeight: 700, color: 'var(--primary)' }}>
                Complete your profile
              </Link>{' '}
              to get more visibility.
            </div>
          </div>
        )}

        <div className="dashboard-grid">
          <div>
            {/* Tab switcher for posted vs applied */}
            <div className="dash-tabs">
              <button className={`dash-tab ${activeTab === 'posted' ? 'active' : ''}`} onClick={() => setActiveTab('posted')}>
                💼 Jobs I Posted ({myJobs.length})
              </button>
              <button className={`dash-tab ${activeTab === 'applied' ? 'active' : ''}`} onClick={() => setActiveTab('applied')}>
                📝 Jobs I Applied To ({myApps.length})
              </button>
            </div>

            {activeTab === 'posted' ? (
              myJobs.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">💼</div>
                  <h3>No jobs posted yet</h3>
                  <p>Anyone can post a job — need a cleaner, helper, driver for a day? Post it!</p>
                  <Link to="/jobs/post" className="btn btn-primary mt-2">+ Post Your First Job</Link>
                </div>
              ) : (
                <div className="recent-list">
                  {myJobs.slice(0, 6).map(job => (
                    <JobRow key={job._id} job={job} navigate={navigate} />
                  ))}
                  {myJobs.length > 6 && (
                    <Link to="/applications" className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start', marginTop: 4 }}>
                      View all {myJobs.length} jobs →
                    </Link>
                  )}
                </div>
              )
            ) : (
              myApps.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📋</div>
                  <h3>No applications yet</h3>
                  <p>Browse available jobs and apply to get started!</p>
                  <Link to="/jobs" className="btn btn-primary mt-2">Browse Jobs</Link>
                </div>
              ) : (
                <div className="recent-list">
                  {myApps.slice(0, 6).map(app => (
                    <ApplicationRow key={app._id} app={app} />
                  ))}
                  {myApps.length > 6 && (
                    <Link to="/applications" className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start', marginTop: 4 }}>
                      View all {myApps.length} applications →
                    </Link>
                  )}
                </div>
              )
            )}
          </div>

          {/* Quick Actions */}
          <div>
            <div className="section-heading"><span>⚡ Quick Actions</span></div>
            <div className="quick-actions">
              <QuickAction icon="📝" label="Post a New Job" to="/jobs/post" />
              <QuickAction icon="🔍" label="Browse All Jobs" to="/jobs" />
              <QuickAction icon="👷" label="Browse Workers" to="/workers" />
              <QuickAction icon="📨" label={isWorker ? 'Hire Requests Received' : 'Hire Requests Sent'} to="/requests" />
              <QuickAction icon="📋" label="Applications Inbox" to="/applications" />
              <QuickAction icon="👤" label="Edit My Profile" to="/profile" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, value, label, color }) {
  const colors = { primary: 'var(--primary)', success: 'var(--success)', warning: 'var(--warning)', info: 'var(--info)' };
  return (
    <div className="dash-stat-card card card-body">
      <div className="dash-stat-icon" style={{ background: colors[color] + '18' }}>{icon}</div>
      <div className="dash-stat-value" style={{ color: colors[color] }}>{value}</div>
      <div className="dash-stat-label">{label}</div>
    </div>
  );
}

function ApplicationRow({ app }) {
  const job = app.jobId;
  return (
    <div className="recent-row">
      <div className="recent-row-left">
        <div className="recent-row-title">{job?.title || 'Job'}</div>
        <div className="recent-row-sub">{job?.category} · {formatCurrency(app.expectedSalary)}/day · {formatDate(app.createdAt)}</div>
      </div>
      <span className={`badge ${STATUS_BADGE[app.status]}`}>{app.status}</span>
    </div>
  );
}

function JobRow({ job, navigate }) {
  return (
    <div className="recent-row" onClick={() => navigate(`/jobs/${job._id}`)} style={{ cursor: 'pointer' }}>
      <div className="recent-row-left">
        <div className="recent-row-title">{job.title}</div>
        <div className="recent-row-sub">{job.category} · {formatCurrency(job.salary)}/day · {formatDate(job.startDate)}</div>
      </div>
      <span className={`badge ${STATUS_BADGE[job.status]}`}>{job.status}</span>
    </div>
  );
}

function QuickAction({ icon, label, to }) {
  return (
    <Link to={to} className="quick-action-item">
      <span className="qa-icon">{icon}</span>
      <span className="qa-label">{label}</span>
      <span className="qa-arrow">→</span>
    </Link>
  );
}
