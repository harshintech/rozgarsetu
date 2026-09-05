import React from 'react';

export default function StarRating({ rating = 0, size = 14 }) {
  return (
    <span className="stars" style={{ fontSize: size }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= Math.round(rating) ? 'star-filled' : 'star-empty'}>★</span>
      ))}
      <span style={{ fontSize: size * 0.85, color: 'var(--text-muted)', marginLeft: 4, fontFamily: 'var(--font-body)' }}>
        {Number(rating).toFixed(1)}
      </span>
    </span>
  );
}
