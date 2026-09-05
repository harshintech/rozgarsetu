import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate, STATUS_BADGE, getInitials, DURATION_OPTIONS } from '../utils/constants';
import ReviewModal from '../components/ReviewModal';
import './Requests.css';

export default function Requests() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isWorker = user?.role === 'worker';

  // Workers primarily receive; employers primarily send.
  // Default active tab based on role
  const [activeTab, setActiveTab] = useState(isWorker ? 'received' : 'sent');
  const [received, setReceived] = useState([]);  // hire requests sent TO me
  const [sent, setSent] = useState([]);           // hire requests I sent
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [reviewTarget, setReviewTarget] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      // Workers receive requests; employers send them — but both can see both sides
      const [recRes, sentRes] = await Promise.allSettled([
        api.get('/hire-requests/received'),
        api.get('/hire-requests/sent'),
      ]);
      setReceived(recRes.status === 'fulfilled' ? recRes.value.data : []);
      setSent(sentRes.status === 'fulfilled' ? sentRes.value.data : []);
    } catch (err) {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    setActionLoading(id + action);
    try {
      await api.patch(`/hire-requests/${id}/${action}`);
      toast.success(`Request ${action}ed!`);
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action}`);
    } finally {
      setActionLoading('');
    }
  };

  const currentList = activeTab === 'received' ? received : sent;
  const filtered = filterStatus === 'all' ? currentList : currentList.filter(r => r.status === filterStatus);

  const statusCounts = currentList.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="page-content">
      <div className="container">
        <div style={{ marginBottom: 24 }}>
          <h1 className="page-title">📨 Hire Requests</h1>
          <p className="page-subtitle">
            {received.length} received · {sent.length} sent
          </p>
        </div>

        {/* Received / Sent tab switcher */}
        <div className="apps-main-tabs" style={{ marginBottom: 20 }}>
          <button
            className={`apps-main-tab ${activeTab === 'received' ? 'active' : ''}`}
            onClick={() => { setActiveTab('received'); setFilterStatus('all'); }}
          >
            <span className="amt-icon">📥</span>
            <div>
              <div className="amt-label">Received</div>
              <div className="amt-sub">Hire requests sent to you</div>
            </div>
            {received.filter(r => r.status === 'pending').length > 0 && (
              <span className="amt-count">{received.filter(r => r.status === 'pending').length} new</span>
            )}
          </button>
          <button
            className={`apps-main-tab ${activeTab === 'sent' ? 'active' : ''}`}
            onClick={() => { setActiveTab('sent'); setFilterStatus('all'); }}
          >
            <span className="amt-icon">📤</span>
            <div>
              <div className="amt-label">Sent</div>
              <div className="amt-sub">Hire requests you sent to others</div>
            </div>
            {sent.length > 0 && <span className="amt-count">{sent.length}</span>}
          </button>
        </div>

        {/* Status filter tabs */}
        <div className="tabs" style={{ marginBottom: 24 }}>
          {['all', 'pending', 'accepted', 'rejected', 'cancelled', 'completed'].map(s => (
            <button
              key={s}
              className={`tab-btn ${filterStatus === s ? 'active' : ''}`}
              onClick={() => setFilterStatus(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
              {s !== 'all' && statusCounts[s] ? (
                <span className="tab-count">{statusCounts[s]}</span>
              ) : null}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h3>
              {filterStatus !== 'all'
                ? `No ${filterStatus} requests`
                : activeTab === 'received'
                  ? 'No hire requests received yet'
                  : 'No hire requests sent yet'}
            </h3>
            <p>
              {activeTab === 'received'
                ? 'When someone wants to hire you directly, it will appear here.'
                : 'Browse workers and send hire requests to get started.'}
            </p>
            {activeTab === 'sent' && (
              <button className="btn btn-primary mt-2" onClick={() => navigate('/workers')}>
                Browse Workers
              </button>
            )}
          </div>
        ) : (
          <div className="requests-list">
            {filtered.map(req => {
              // For received tab: the "other person" is the sender (employerId)
              // For sent tab: the "other person" is the recipient (workerId)
              const other = activeTab === 'received' ? req.employerId : req.workerId;
              const durationLabel = DURATION_OPTIONS.find(d => d.value == req.durationInDays)?.label
                || `${req.durationInDays} days`;

              return (
                <div key={req._id} className="request-card card">
                  <div className="request-card-body">
                    {/* Person info */}
                    <div className="request-person">
                      {other?.avatarUrl
                        ? <img src={other.avatarUrl} alt="" className="avatar avatar-md" />
                        : <div className="avatar avatar-md">{getInitials(other?.name)}</div>
                      }
                      <div className="request-person-info">
                        <div className="request-person-name">{other?.name || '—'}</div>
                        {other?.location?.city && (
                          <div className="request-person-sub">📍 {other.location.city}</div>
                        )}
                        {other?.phone && user && (
                          <div className="request-person-sub">📱 {other.phone}</div>
                        )}
                        <div className="request-person-sub" style={{ marginTop: 4 }}>
                          {activeTab === 'received' ? '👉 They want to hire you' : '👉 You sent this request'}
                        </div>
                      </div>
                      <span className={`badge ${STATUS_BADGE[req.status]} request-status-badge`}>
                        {req.status}
                      </span>
                    </div>

                    {/* Job details */}
                    <div className="request-details">
                      <div className="request-detail-grid">
                        <div className="req-detail-item">
                          <span className="req-detail-label">Daily Pay</span>
                          <span className="req-detail-value">{formatCurrency(req.salary)}</span>
                        </div>
                        <div className="req-detail-item">
                          <span className="req-detail-label">Duration</span>
                          <span className="req-detail-value">{durationLabel}</span>
                        </div>
                        <div className="req-detail-item">
                          <span className="req-detail-label">Start Date</span>
                          <span className="req-detail-value">{formatDate(req.startDate)}</span>
                        </div>
                        <div className="req-detail-item">
                          <span className="req-detail-label">Total Pay</span>
                          <span className="req-detail-value" style={{ color: 'var(--primary)', fontWeight: 800 }}>
                            {formatCurrency(req.salary * req.durationInDays)}
                          </span>
                        </div>
                      </div>
                      {req.description && (
                        <div className="request-description">
                          <span>📋</span>
                          <span>{req.description}</span>
                        </div>
                      )}
                      <div className="request-meta">Sent {formatDate(req.createdAt)}</div>
                    </div>

                    {/* Actions */}
                    <div className="request-actions">
                      {/* Received + pending → accept / reject */}
                      {activeTab === 'received' && req.status === 'pending' && (
                        <>
                          <button
                            className="btn btn-success"
                            onClick={() => handleAction(req._id, 'accept')}
                            disabled={!!actionLoading}
                          >
                            {actionLoading === req._id + 'accept' ? '…' : '✅ Accept'}
                          </button>
                          <button
                            className="btn btn-danger"
                            onClick={() => handleAction(req._id, 'reject')}
                            disabled={!!actionLoading}
                          >
                            {actionLoading === req._id + 'reject' ? '…' : '✗ Reject'}
                          </button>
                        </>
                      )}
                      {/* Sent + pending → cancel */}
                      {activeTab === 'sent' && req.status === 'pending' && (
                        <button
                          className="btn btn-ghost"
                          onClick={() => handleAction(req._id, 'cancel')}
                          disabled={!!actionLoading}
                        >
                          Cancel Request
                        </button>
                      )}
                      {/* Sent + accepted → mark complete */}
                      {activeTab === 'sent' && req.status === 'accepted' && (
                        <button
                          className="btn btn-success"
                          onClick={() => handleAction(req._id, 'complete')}
                          disabled={!!actionLoading}
                        >
                          ✅ Mark as Completed
                        </button>
                      )}
                      {/* Completed → review */}
                      {req.status === 'completed' && (
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => setReviewTarget({ req, other })}
                        >
                          ⭐ Leave Review
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {reviewTarget && (
        <ReviewModal
          reviewee={reviewTarget.other}
          hireRequestId={reviewTarget.req._id}
          onClose={() => setReviewTarget(null)}
          onSuccess={loadAll}
        />
      )}
    </div>
  );
}
