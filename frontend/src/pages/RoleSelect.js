import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

export default function RoleSelect() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 24 }}>
      <div style={{ maxWidth: 640, width: '100%', textAlign: 'center' }}>
        <div className="brand-logo brand-logo-lg" style={{ margin: '0 auto 12px' }}>RS</div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>
          Welcome to Rozgar Setu
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 40, fontSize: '1.05rem' }}>
          रोजगार सेतु — What brings you here today?
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Worker Card */}
          <div
            className="card card-body"
            style={{ cursor: 'pointer', padding: 36, transition: 'var(--transition)', border: '2px solid var(--border)' }}
            onClick={() => navigate('/login?role=worker')}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>👷</div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: 10 }}>I Want Work</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>
              I'm a cleaner, driver, cook, guard, helper or any skilled worker looking for daily or full-time jobs.
            </p>
            <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
              {['Cleaning','Driving','Cooking','Security','Labor'].map(s => (
                <span key={s} style={{ fontSize: '0.72rem', background: 'var(--primary-light)', color: 'var(--primary)', padding: '3px 10px', borderRadius: 0, fontWeight: 600 }}>{s}</span>
              ))}
            </div>
            <button className="btn btn-primary btn-block" style={{ marginTop: 20 }}>Register as Worker →</button>
          </div>

          {/* Hire Card */}
          <div
            className="card card-body"
            style={{ cursor: 'pointer', padding: 36, transition: 'var(--transition)', border: '2px solid var(--border)' }}
            onClick={() => navigate('/login?role=employer')}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🏠</div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: 10 }}>I Need Help</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>
              I'm a homeowner, shopkeeper, farmer, or company looking to hire workers for daily or long-term work.
            </p>
            <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
              {['Home','Shop','Farm','Office','Factory'].map(s => (
                <span key={s} style={{ fontSize: '0.72rem', background: 'var(--primary-light)', color: 'var(--primary)', padding: '3px 10px', borderRadius: 0, fontWeight: 600 }}>{s}</span>
              ))}
            </div>
            <button className="btn btn-block btn-primary" style={{ marginTop: 20 }}>
              Start Hiring Free →
            </button>
          </div>
        </div>

        <p style={{ marginTop: 24, color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          Already have an account?{' '}
          <span style={{ color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }} onClick={() => navigate('/login')}>
            Login here
          </span>
        </p>
      </div>
    </div>
  );
}
