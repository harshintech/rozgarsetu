import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getInitials, formatCurrency, STATUS_BADGE } from '../utils/constants';
import StarRating from './StarRating';

export default function WorkerCard({ profile, onHire, showHireBtn = true }) {
  const navigate = useNavigate();
  const user = profile.userId;
  if (!user) return null;

  const availDot = { available: 'avail-available', busy: 'avail-busy', offline: 'avail-offline' };

  return (
    <div className="worker-card card" onClick={() => navigate(`/workers/${user._id}`)}>
      <div className="worker-card-top">
        {user.avatarUrl
          ? <img src={user.avatarUrl} alt={user.name} className="avatar avatar-lg" />
          : <div className="avatar avatar-lg">{getInitials(user.name)}</div>
        }
        <div className="worker-card-info">
          <h3 className="worker-name">{user.name}</h3>
          <StarRating rating={profile.rating} size={13} />
          <div className="worker-avail">
            <span className={`avail-dot ${availDot[profile.availability]}`} />
            <span className="avail-text">{profile.availability}</span>
          </div>
        </div>
      </div>

      <div className="worker-card-body">
        {user.location?.city && (
          <div className="worker-meta">
            <span>📍</span>
            <span>{user.location.city}{user.location.state ? `, ${user.location.state}` : ''}</span>
          </div>
        )}
        <div className="worker-meta">
          <span>💰</span>
          <span>{formatCurrency(profile.expectedDailyWage)} / day</span>
        </div>
        <div className="worker-meta">
          <span>🏆</span>
          <span>{profile.totalJobsCompleted} jobs done · {profile.experienceYears}yr exp</span>
        </div>

        {profile.skills?.length > 0 && (
          <div className="worker-skills">
            {profile.skills.slice(0, 3).map((s, i) => (
              <span key={i} className="chip">{s}</span>
            ))}
            {profile.skills.length > 3 && (
              <span className="chip" style={{ background: '#f0f0f0', color: '#666' }}>+{profile.skills.length - 3}</span>
            )}
          </div>
        )}
      </div>

      {showHireBtn && (
        <div className="worker-card-footer">
          <button
            className={`btn btn-sm w-full ${profile.availability === 'available' ? 'btn-primary' : 'btn-outline'}`}
            onClick={e => { e.stopPropagation(); if (onHire) onHire(profile); else navigate(`/workers/${user._id}`); }}
            disabled={profile.availability === 'offline'}
          >
            {profile.availability === 'available' ? '⚡ Hire Now' : profile.availability === 'busy' ? '📋 View Profile' : '🔴 Offline'}
          </button>
        </div>
      )}
    </div>
  );
}
