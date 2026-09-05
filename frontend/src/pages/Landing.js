import React from 'react';
import { Link } from 'react-router-dom';
import { JOB_CATEGORIES } from '../utils/constants';
import './Landing.css';

const STATS = [
  { value: '10,000+', label: 'Registered Workers' },
  { value: '5,000+', label: 'Jobs Posted' },
  { value: '50+', label: 'Job Categories' },
  { value: '98%', label: 'Satisfaction Rate' },
];

const HOW_WORKER = [
  { icon: '📱', title: 'Sign Up', desc: 'Register with your phone number in 60 seconds' },
  { icon: '🛠️', title: 'Build Profile', desc: 'Add your skills, experience & expected wages' },
  { icon: '💼', title: 'Get Hired', desc: 'Apply to jobs or receive direct hire requests' },
];

const HOW_EMPLOYER = [
  { icon: '📱', title: 'Sign Up Free', desc: 'Anyone can register — homeowner, shopkeeper, farmer, company' },
  { icon: '👷', title: 'Find Workers', desc: 'Browse cleaners, drivers, helpers near your city' },
  { icon: '✅', title: 'Hire Directly', desc: 'Call them, send a request, or post a job — no middleman' },
];

export default function Landing() {
  return (
    <div className="landing">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg-shapes">
          <div className="shape shape-1" />
          <div className="shape shape-2" />
        </div>
        <div className="container hero-content">
          <div className="hero-text">
            <div className="hero-badge">🌉 India's Trusted Hiring Bridge</div>
            <h1 className="hero-title">
              Need a Cleaner,<br />
              Driver or Helper?<br />
              <span>Find One Today.</span>
            </h1>
            <p className="hero-subtitle">
              Rozgar Setu is for <strong>everyone</strong> — homeowners, shopkeepers, farmers, offices.
              Hire a cleaner for your house, a driver for your car, a helper for your farm.
              No middleman. Direct contact. Starting ₹200/day.
            </p>
            <div className="hero-actions">
              <Link to="/login?role=employer" className="btn btn-primary btn-lg">
                🏠 I Need to Hire
              </Link>
              <Link to="/login?role=worker" className="btn btn-outline btn-lg">
                👷 I'm Looking for Work
              </Link>
            </div>
            <div className="hero-trust-row">
              <span>✅ Free to use</span>
              <span>✅ No middleman</span>
              <span>✅ Direct contact</span>
            </div>
          </div>
          <div className="hero-illustration">
            <div className="hero-card-float card-1">
              <span>🧹</span> Cleaning Staff Available
              <span className="badge badge-success" style={{marginLeft:8}}>Now</span>
            </div>
            <div className="hero-card-float card-2">
              <span>⭐⭐⭐⭐⭐</span><br/>
              <small>"Found a great driver in 10 minutes!"</small>
            </div>
            <div className="hero-emoji-grid">
              {['👷','🚗','🧹','💂','🔧','🍳','📦','🪚'].map((e,i) => (
                <div key={i} className="emoji-cell">{e}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="container stats-grid">
          {STATS.map((s, i) => (
            <div key={i} className="stat-item">
              <div className="stat-num">{s.value}</div>
              <div className="stat-lbl">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Who can hire */}
      <section className="who-section">
        <div className="container">
          <div className="text-center mb-3">
            <h2 className="section-title">Who Can <span style={{color:'var(--primary)'}}>Hire?</span></h2>
            <p className="section-sub">Rozgar Setu is for every Indian — not just companies</p>
          </div>
          <div className="who-grid">
            {[
              { icon: '🏠', title: 'Homeowners', desc: 'Need a maid, cook, or gardener for your home?' },
              { icon: '🧓', title: 'Senior Citizens', desc: 'Need a daily helper or caretaker at home?' },
              { icon: '🛒', title: 'Shop Owners', desc: 'Need a delivery boy or helper for your shop?' },
              { icon: '🏗️', title: 'Builders', desc: 'Need labor workers for construction or renovation?' },
              { icon: '🌾', title: 'Farmers', desc: 'Need workers for harvesting or daily farm work?' },
              { icon: '🍽️', title: 'Restaurants', desc: 'Need a cook, cleaner or serving staff?' },
            ].map((w, i) => (
              <div key={i} className="who-card">
                <span className="who-icon">{w.icon}</span>
                <h4 className="who-title">{w.title}</h4>
                <p className="who-desc">{w.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-3">
            <Link to="/login?role=employer" className="btn btn-primary btn-lg">
              🏠 Yes, I Need Help → Sign Up Free
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="categories-section">
        <div className="container">
          <div className="text-center mb-3">
            <h2 className="section-title">Browse by <span style={{color:'var(--primary)'}}>Category</span></h2>
            <p className="section-sub">Find workers across 15+ job types</p>
          </div>
          <div className="categories-grid">
            {JOB_CATEGORIES.slice(0, 12).map((cat, i) => (
              <Link key={i} to={`/workers?skill=${cat.value}`} className="cat-tile">
                <span className="cat-icon">{cat.icon}</span>
                <span className="cat-label">{cat.label}</span>
              </Link>
            ))}
          </div>
          <div className="text-center mt-3">
            <Link to="/workers" className="btn btn-outline">View All Categories →</Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="how-section">
        <div className="container">
          <h2 className="section-title text-center">How It <span style={{color:'var(--primary)'}}>Works</span></h2>
          <div className="how-cols">
            <div className="how-col">
              <div className="how-col-header">
                <span className="how-role-badge">👷 For Workers</span>
              </div>
              {HOW_WORKER.map((step, i) => (
                <div key={i} className="how-step">
                  <div className="how-step-num">{i + 1}</div>
                  <div>
                    <div className="how-step-icon">{step.icon}</div>
                    <h4>{step.title}</h4>
                    <p>{step.desc}</p>
                  </div>
                </div>
              ))}
              <Link to="/login?role=worker" className="btn btn-primary btn-block mt-2">Start as Worker →</Link>
            </div>

            <div className="how-divider" />

            <div className="how-col">
              <div className="how-col-header">
                <span className="how-role-badge emp">🏠 For Anyone Who Needs Help</span>
              </div>
              {HOW_EMPLOYER.map((step, i) => (
                <div key={i} className="how-step">
                  <div className="how-step-num emp">{i + 1}</div>
                  <div>
                    <div className="how-step-icon">{step.icon}</div>
                    <h4>{step.title}</h4>
                    <p>{step.desc}</p>
                  </div>
                </div>
              ))}
              <Link to="/login?role=employer" className="btn btn-outline btn-block mt-2">Start Hiring Today →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container cta-inner">
          <h2>Ready to get started?</h2>
          <p>Join thousands of workers and employers on Rozgar Setu today.</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginTop: 24 }}>
            <Link to="/workers" className="btn btn-lg" style={{ background: '#fff', color: 'var(--primary)' }}>Browse Workers</Link>
            <Link to="/jobs" className="btn btn-outline btn-lg">Browse Jobs</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-inner">
          <div className="footer-brand">
            <span className="brand-logo">RS</span>
            <span className="brand-text" style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--primary)' }}>
              Rozgar Setu
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            रोजगार सेतु — Bridging workers and employers across India.
          </p>
          <div className="footer-links">
            <Link to="/workers">Find Workers</Link>
            <Link to="/jobs">Browse Jobs</Link>
            <Link to="/login">Login</Link>
          </div>
          <p style={{ color: '#adb5bd', fontSize: '0.78rem', marginTop: 12 }}>
            © 2024 Rozgar Setu · Final Year Project Demonstration
          </p>
        </div>
      </footer>
    </div>
  );
}
