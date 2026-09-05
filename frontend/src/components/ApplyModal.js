import React, { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { formatCurrency, formatDate } from '../utils/constants';

export default function ApplyModal({ job, onClose, onSuccess }) {
  const [form, setForm] = useState({ expectedSalary: job?.salary || '', message: '' });
  const [loading, setLoading] = useState(false);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    if (!form.expectedSalary) return toast.error('Enter your expected salary');
    setLoading(true);
    try {
      await api.post('/applications', {
        jobId: job._id,
        expectedSalary: Number(form.expectedSalary),
        message: form.message,
      });
      toast.success('Application submitted!');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Apply for Job</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div style={{ background: 'var(--primary-light)', borderRadius: 'var(--radius-sm)', padding: '14px 16px', marginBottom: 20 }}>
            <div style={{ fontWeight: 700, fontFamily: 'var(--font-heading)', fontSize: '1rem' }}>{job.title}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>
              {formatCurrency(job.salary)}/day · Starts {formatDate(job.startDate)} · {job.durationInDays} days
            </div>
          </div>

          <form onSubmit={submit}>
            <div className="form-group">
              <label className="form-label">Your Expected Salary (₹/day) *</label>
              <input name="expectedSalary" type="number" className="form-input" value={form.expectedSalary} onChange={handle} placeholder={`Employer offers ${formatCurrency(job.salary)}`} required min={1} />
            </div>
            <div className="form-group">
              <label className="form-label">Cover Message (Optional)</label>
              <textarea name="message" className="form-input" rows={4} value={form.message} onChange={handle} placeholder="Introduce yourself, mention your experience, why you're a good fit..." />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button type="button" className="btn btn-ghost btn-block" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? 'Submitting…' : '📝 Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
