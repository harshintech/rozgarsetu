import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { JOB_CATEGORIES, DURATION_OPTIONS, INDIAN_STATES } from '../utils/constants';
import './PostJob.css';

export default function PostJob() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    category: '',
    description: '',
    salary: '',
    durationInDays: 1,
    startDate: new Date().toISOString().split('T')[0],
    address: '',
    city: '',
    state: '',
  });
  const [loading, setLoading] = useState(false);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    if (!form.title || !form.category || !form.description || !form.salary) {
      return toast.error('Please fill all required fields');
    }
    setLoading(true);
    try {
      const res = await api.post('/jobs', {
        title: form.title,
        category: form.category,
        description: form.description,
        salary: Number(form.salary),
        durationInDays: Number(form.durationInDays),
        startDate: form.startDate,
        location: { address: form.address, city: form.city, state: form.state },
      });
      toast.success('Job posted successfully!');
      navigate(`/jobs/${res.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content">
      <div className="container">
        <button className="back-btn-page" onClick={() => navigate(-1)}>← Back</button>

        <div className="postjob-layout">
          <div className="postjob-form-col">
            <div className="postjob-header">
              <h1 className="page-title">Post a New Job 💼</h1>
              <p className="page-subtitle">Fill in the details to attract the right workers</p>
            </div>

            <form onSubmit={submit} className="postjob-form">
              {/* Basic Info */}
              <div className="card card-body postjob-section">
                <h3 className="detail-section-title">📋 Job Information</h3>

                <div className="form-group">
                  <label className="form-label">Job Title *</label>
                  <input name="title" className="form-input" placeholder="e.g. Need 2 Cleaners for Office" value={form.title} onChange={handle} required />
                </div>

                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <div className="category-picker">
                    {JOB_CATEGORIES.map(cat => (
                      <label key={cat.value} className={`cat-pick-chip ${form.category === cat.value ? 'selected' : ''}`}>
                        <input type="radio" hidden name="category" value={cat.value} checked={form.category === cat.value} onChange={handle} />
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Job Description *</label>
                  <textarea
                    name="description"
                    className="form-input"
                    rows={5}
                    placeholder="Describe the work in detail: timings, requirements, what tools/equipment will be provided, expectations..."
                    value={form.description}
                    onChange={handle}
                    required
                  />
                </div>
              </div>

              {/* Pay & Duration */}
              <div className="card card-body postjob-section">
                <h3 className="detail-section-title">💰 Pay & Duration</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Daily Salary (₹) *</label>
                    <input name="salary" type="number" className="form-input" placeholder="e.g. 500" value={form.salary} onChange={handle} required min={1} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Duration</label>
                    <select name="durationInDays" className="form-input" value={form.durationInDays} onChange={handle}>
                      {DURATION_OPTIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Start Date *</label>
                    <input name="startDate" type="date" className="form-input" value={form.startDate} onChange={handle} required min={new Date().toISOString().split('T')[0]} />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="card card-body postjob-section">
                <h3 className="detail-section-title">📍 Job Location</h3>
                <div className="form-group">
                  <label className="form-label">Address / Area</label>
                  <input name="address" className="form-input" placeholder="Street or area name" value={form.address} onChange={handle} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input name="city" className="form-input" placeholder="e.g. Ahmedabad" value={form.city} onChange={handle} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State</label>
                    <select name="state" className="form-input" value={form.state} onChange={handle}>
                      <option value="">Select State</option>
                      {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                {loading ? 'Posting…' : '🚀 Post Job Now'}
              </button>
            </form>
          </div>

          {/* Preview Panel */}
          <div className="postjob-preview-col">
            <div className="postjob-preview card card-body" style={{ position: 'sticky', top: 88 }}>
              <h3 className="detail-section-title">👁️ Preview</h3>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>How your job will appear to workers</div>

              <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-sm)', padding: '16px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: '1.6rem' }}>{JOB_CATEGORIES.find(c => c.value === form.category)?.icon || '💼'}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontFamily: 'var(--font-heading)' }}>{form.title || 'Job Title'}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{form.category || 'Category'}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <div>💰 {form.salary ? `₹${form.salary}/day` : '₹ —'}</div>
                  <div>⏳ {DURATION_OPTIONS.find(d => d.value == form.durationInDays)?.label || '—'}</div>
                  <div>📅 {form.startDate || '—'}</div>
                  {form.city && <div>📍 {form.city}{form.state ? `, ${form.state}` : ''}</div>}
                </div>
                {form.description && (
                  <p style={{ marginTop: 10, fontSize: '0.82rem', color: '#555', lineHeight: 1.5 }}>
                    {form.description.slice(0, 120)}{form.description.length > 120 ? '…' : ''}
                  </p>
                )}
              </div>

              {form.salary && form.durationInDays && (
                <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--primary-light)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--primary)' }}>
                    ₹{(form.salary * form.durationInDays).toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total estimated payout</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
