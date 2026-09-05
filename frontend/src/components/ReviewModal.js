import React, { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { getInitials } from '../utils/constants';

export default function ReviewModal({ reviewee, jobId, hireRequestId, onClose, onSuccess }) {
  const [rating, setRating] = useState(5);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/reviews', {
        revieweeId: reviewee._id,
        rating,
        comment,
        jobId,
        hireRequestId,
      });
      toast.success('Review submitted!');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const displayRating = hovered || rating;
  const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Leave a Review</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            {reviewee?.avatarUrl
              ? <img src={reviewee.avatarUrl} alt={reviewee.name} className="avatar avatar-lg" style={{ margin: '0 auto 10px' }} />
              : <div className="avatar avatar-lg" style={{ margin: '0 auto 10px' }}>{getInitials(reviewee?.name)}</div>
            }
            <div style={{ fontWeight: 700, fontFamily: 'var(--font-heading)' }}>{reviewee?.name}</div>
          </div>

          <form onSubmit={submit}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
                {[1,2,3,4,5].map(s => (
                  <span
                    key={s}
                    style={{ fontSize: '2.2rem', cursor: 'pointer', color: s <= displayRating ? 'var(--warning)' : '#dee2e6', transition: 'color 0.15s' }}
                    onClick={() => setRating(s)}
                    onMouseEnter={() => setHovered(s)}
                    onMouseLeave={() => setHovered(0)}
                  >★</span>
                ))}
              </div>
              <div style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '1rem' }}>{labels[displayRating]}</div>
            </div>

            <div className="form-group">
              <label className="form-label">Your Comment</label>
              <textarea className="form-input" rows={4} value={comment} onChange={e => setComment(e.target.value)} placeholder="Share your experience working with this person..." />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" className="btn btn-ghost btn-block" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? 'Submitting…' : '⭐ Submit Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
