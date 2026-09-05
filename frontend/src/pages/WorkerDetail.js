import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate, getInitials } from '../utils/constants';
import StarRating from '../components/StarRating';
import HireModal from '../components/HireModal';
import ReviewModal from '../components/ReviewModal';
import './DetailPage.css';

export default function WorkerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHire, setShowHire] = useState(false);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`/workers/${id}`),
      api.get(`/reviews/${id}`),
    ]).then(([profRes, revRes]) => {
      setProfile(profRes.data);
      setReviews(revRes.data);
    }).catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-center"><div className="spinner" /><p>Loading profile…</p></div>;
  if (!profile) return <div className="loading-center"><h3>Worker not found</h3></div>;

  const worker = profile.userId;
  const availColors = { available: 'badge-success', busy: 'badge-warning', offline: 'badge-secondary' };

  return (
    <div className="page-content">
      <div className="container">
        <button className="back-btn-page" onClick={() => navigate(-1)}>← Back</button>

        <div className="detail-layout">
          {/* Left: Profile Card */}
          <div className="detail-sidebar">
            <div className="card">
              <div className="detail-avatar-section">
                {worker.avatarUrl
                  ? <img src={worker.avatarUrl} alt={worker.name} className="avatar avatar-xl detail-avatar" />
                  : <div className="avatar avatar-xl detail-avatar">{getInitials(worker.name)}</div>
                }
                <span className={`badge ${availColors[profile.availability]} detail-avail-badge`}>
                  {profile.availability}
                </span>
              </div>
              <div className="detail-card-body">
                <h1 className="detail-name">{worker.name}</h1>
                <StarRating rating={profile.rating} size={15} />

                <div className="detail-meta-list">
                  {worker.location?.city && (
                    <div className="detail-meta-row">
                      <span className="meta-icon">📍</span>
                      <span>{worker.location.address && `${worker.location.address}, `}{worker.location.city}{worker.location.state && `, ${worker.location.state}`}</span>
                    </div>
                  )}
                  <div className="detail-meta-row">
                    <span className="meta-icon">💰</span>
                    <span><strong>{formatCurrency(profile.expectedDailyWage)}</strong> per day</span>
                  </div>
                  <div className="detail-meta-row">
                    <span className="meta-icon">🏆</span>
                    <span>{profile.totalJobsCompleted} jobs completed</span>
                  </div>
                  <div className="detail-meta-row">
                    <span className="meta-icon">📅</span>
                    <span>{profile.experienceYears} year{profile.experienceYears !== 1 ? 's' : ''} experience</span>
                  </div>
                  {worker.phone && user && (
                    <div className="detail-meta-row">
                      <span className="meta-icon">📱</span>
                      <span>{worker.phone}</span>
                    </div>
                  )}
                </div>

                {user && user._id !== id && (
                  <button
                    className="btn btn-primary btn-block mt-2"
                    onClick={() => setShowHire(true)}
                    disabled={profile.availability === 'offline'}
                  >
                    ⚡ Send Hire Request
                  </button>
                )}
                {user && user._id !== id && (
                  <button className="btn btn-outline btn-block mt-1" onClick={() => setShowReview(true)}>
                    ⭐ Write a Review
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right: Details */}
          <div className="detail-main">
            {/* Skills */}
            {profile.skills?.length > 0 && (
              <div className="card card-body detail-section">
                <h3 className="detail-section-title">🛠️ Skills</h3>
                <div className="skills-list">
                  {profile.skills.map((s, i) => <span key={i} className="chip">{s}</span>)}
                </div>
              </div>
            )}

            {/* About */}
            {profile.description && (
              <div className="card card-body detail-section">
                <h3 className="detail-section-title">📋 About</h3>
                <p className="detail-description">{profile.description}</p>
              </div>
            )}

            {/* Languages */}
            {profile.languages?.length > 0 && (
              <div className="card card-body detail-section">
                <h3 className="detail-section-title">🗣️ Languages</h3>
                <div className="skills-list">
                  {profile.languages.map((l, i) => (
                    <span key={i} className="chip" style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)' }}>{l}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="card card-body detail-section">
              <h3 className="detail-section-title">⭐ Reviews ({reviews.length})</h3>
              {reviews.length === 0 ? (
                <p className="text-muted" style={{ fontSize: '0.9rem' }}>No reviews yet</p>
              ) : (
                <div className="reviews-list">
                  {reviews.map(r => (
                    <div key={r._id} className="review-item">
                      <div className="review-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {r.reviewerId?.avatarUrl
                            ? <img src={r.reviewerId.avatarUrl} alt="" className="avatar avatar-sm" />
                            : <div className="avatar avatar-sm">{getInitials(r.reviewerId?.name)}</div>
                          }
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{r.reviewerId?.name}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{formatDate(r.createdAt)}</div>
                          </div>
                        </div>
                        <StarRating rating={r.rating} size={13} />
                      </div>
                      {r.comment && <p className="review-comment">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showHire && <HireModal worker={profile} onClose={() => setShowHire(false)} onSuccess={() => {}} />}
      {showReview && <ReviewModal reviewee={worker} onClose={() => setShowReview(false)} onSuccess={() => api.get(`/reviews/${id}`).then(r => setReviews(r.data))} />}
    </div>
  );
}
