import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { INDIAN_STATES } from '../utils/constants';
import './Setup.css';

// Hiring types — individuals first, businesses after
const HIRING_TYPES = [
  { icon: '🏠', label: 'Home Owner', desc: 'Need help at my house' },
  { icon: '🧓', label: 'Senior / Family', desc: 'Need a helper or caretaker' },
  { icon: '🏗️', label: 'Small Construction', desc: 'Building / renovation work' },
  { icon: '🛒', label: 'Shop Owner', desc: 'Need staff for my shop' },
  { icon: '🍽️', label: 'Restaurant / Dhaba', desc: 'Cook, helper, cleaner needed' },
  { icon: '🏢', label: 'Company / Office', desc: 'Office staff or security' },
  { icon: '🏭', label: 'Factory / Warehouse', desc: 'Labor or loading workers' },
  { icon: '🚚', label: 'Logistics', desc: 'Delivery or driving staff' },
  { icon: '🏥', label: 'Hospital / Clinic', desc: 'Medical support staff' },
  { icon: '🏫', label: 'School / College', desc: 'Peon, security, cleaning' },
  { icon: '🌿', label: 'Farm / Agriculture', desc: 'Farm labor workers' },
  { icon: '💼', label: 'Other', desc: 'Something else' },
];

export default function EmployerSetup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    companyName: '', businessType: '', description: '',
    city: '', state: '', address: '', pincode: '',
  });
  const [loading, setLoading] = useState(false);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.businessType) return toast.error('Please select who you are');
    setLoading(true);
    try {
      await api.post('/employers/profile', {
        companyName: form.companyName,
        businessType: form.businessType,
        description: form.description,
      });
      await api.put('/users/me', {
        location: { city: form.city, state: form.state, address: form.address, pincode: form.pincode }
      });
      toast.success('Profile created! Welcome to Rozgar Setu 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="setup-page page-content">
      <div className="container">
        <div className="setup-header">
          <div className="setup-step-badge emp">Quick Setup</div>
          <h1 className="page-title">Who are you hiring for? 🙋</h1>
          <p className="page-subtitle">
            Whether you're a homeowner, shopkeeper, or company — workers are ready to help you!
          </p>
        </div>

        <form onSubmit={submit} className="setup-form">

          {/* Who you are */}
          <div className="setup-section card card-body">
            <h3 className="setup-section-title">🙋 I am a… *</h3>
            <div className="hiring-type-grid">
              {HIRING_TYPES.map(ht => (
                <label
                  key={ht.label}
                  className={`hiring-type-card ${form.businessType === ht.label ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    hidden
                    name="businessType"
                    value={ht.label}
                    checked={form.businessType === ht.label}
                    onChange={handle}
                  />
                  <span className="ht-icon">{ht.icon}</span>
                  <span className="ht-label">{ht.label}</span>
                  <span className="ht-desc">{ht.desc}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Optional name */}
          <div className="setup-section card card-body">
            <h3 className="setup-section-title">📛 Your Name / Organisation <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.85rem' }}>(optional)</span></h3>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <input
                name="companyName"
                className="form-input"
                placeholder="e.g. Sharma Ji, or Sharma Constructions — leave blank if you prefer"
                value={form.companyName}
                onChange={handle}
              />
            </div>
          </div>

          {/* What help you need */}
          <div className="setup-section card card-body">
            <h3 className="setup-section-title">💬 What kind of help do you need? <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.85rem' }}>(optional)</span></h3>
            <textarea
              name="description"
              className="form-input"
              placeholder="e.g. I need a cleaner to clean my 2BHK flat once a week, or I need a driver Mon–Sat from 9am–6pm..."
              value={form.description}
              onChange={handle}
              rows={3}
              style={{ marginBottom: 0 }}
            />
          </div>

          {/* Location */}
          <div className="setup-section card card-body">
            <h3 className="setup-section-title">📍 Your Location <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.85rem' }}>(helps workers nearby find you)</span></h3>
            <div className="form-group">
              <label className="form-label">Address / Area</label>
              <input name="address" className="form-input" placeholder="e.g. Andheri West, Near Station" value={form.address} onChange={handle} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">City</label>
                <input name="city" className="form-input" placeholder="e.g. Mumbai" value={form.city} onChange={handle} />
              </div>
              <div className="form-group">
                <label className="form-label">State</label>
                <select name="state" className="form-input" value={form.state} onChange={handle}>
                  <option value="">Select State</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Pincode</label>
                <input name="pincode" className="form-input" placeholder="400001" value={form.pincode} onChange={handle} maxLength={6} />
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? 'Saving…' : '🎉 Start Finding Workers'}
          </button>
        </form>
      </div>
    </div>
  );
}
