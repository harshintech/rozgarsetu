import React, { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { DURATION_OPTIONS, getInitials } from '../utils/constants';

export default function HireModal({ worker, onClose, onSuccess }) {
  const user = worker?.userId;
  const [form, setForm] = useState({
    salary: '',
    durationInDays: 1,
    startDate: new Date().toISOString().split('T')[0],
    description: '',
  });
  const [loading, setLoading] = useState(false);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    if (!form.salary || !form.startDate) return toast.error('Fill all required fields');
    setLoading(true);
    try {
      await api.post('/hire-requests', {
        workerId: user._id,
        salary: Number(form.salary),
        durationInDays: Number(form.durationInDays),
        startDate: form.startDate,
        description: form.description,
      });
      toast.success('Hire request sent!');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Send Hire Request</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, padding: '12px 16px', background: 'var(--primary-light)', borderRadius: 'var(--radius-sm)' }}>
            {user?.avatarUrl
              ? <img src={user.avatarUrl} alt={user.name} className="avatar avatar-md" />
              : <div className="avatar avatar-md">{getInitials(user?.name)}</div>
            }
            <div>
              <div style={{ fontWeight: 700, fontFamily: 'var(--font-heading)' }}>{user?.name}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {worker?.skills?.slice(0, 2).join(', ')}
              </div>
            </div>
          </div>

          <form onSubmit={submit}>
            <div className="form-group">
              <label className="form-label">Daily Salary (₹) *</label>
              <input name="salary" type="number" placeholder="e.g. 500" className="form-input" value={form.salary} onChange={handle} required min={1} />
            </div>
            <div className="form-group">
              <label className="form-label">Duration</label>
              <select name="durationInDays" className="form-input" value={form.durationInDays} onChange={handle}>
                {DURATION_OPTIONS.map(d => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Start Date *</label>
              <input name="startDate" type="date" className="form-input" value={form.startDate} onChange={handle} required min={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="form-group">
              <label className="form-label">Job Description / Message</label>
              <textarea name="description" className="form-input" placeholder="Describe the work, timings, requirements..." value={form.description} onChange={handle} rows={3} />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button type="button" className="btn btn-ghost btn-block" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? 'Sending…' : '📨 Send Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
