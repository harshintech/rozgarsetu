import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { LANGUAGES, INDIAN_STATES } from '../utils/constants';
import './Setup.css';

const SKILL_SUGGESTIONS = ['Cleaning','Sweeping','Security Guard','Driver','Labor','Helper','Cook','Electrician','Plumber','Gardener','Delivery','Carpenter','Painter','Peon','Nurse','Caretaker','Watchman','Mason','Welder','AC Repair','Lift Operator'];

export default function WorkerSetup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    skills: [],
    skillInput: '',
    experienceYears: 0,
    expectedDailyWage: '',
    languages: [],
    availability: 'available',
    description: '',
    city: '', state: '', address: '', pincode: '',
  });
  const [loading, setLoading] = useState(false);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const addSkill = (skill) => {
    const s = skill.trim();
    if (s && !form.skills.includes(s)) setForm(f => ({ ...f, skills: [...f.skills, s], skillInput: '' }));
  };

  const removeSkill = (s) => setForm(f => ({ ...f, skills: f.skills.filter(x => x !== s) }));

  const toggleLang = (lang) => {
    setForm(f => ({
      ...f,
      languages: f.languages.includes(lang) ? f.languages.filter(l => l !== lang) : [...f.languages, lang]
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (form.skills.length === 0) return toast.error('Add at least one skill');
    if (!form.expectedDailyWage) return toast.error('Enter expected daily wage');
    setLoading(true);
    try {
      await api.post('/workers/profile', {
        skills: form.skills,
        experienceYears: Number(form.experienceYears),
        expectedDailyWage: Number(form.expectedDailyWage),
        languages: form.languages,
        availability: form.availability,
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
          <div className="setup-step-badge">Step 1 of 1</div>
          <h1 className="page-title">Set Up Your Worker Profile 👷</h1>
          <p className="page-subtitle">Help employers find you by filling in your details</p>
        </div>

        <form onSubmit={submit} className="setup-form">
          {/* Skills */}
          <div className="setup-section card card-body">
            <h3 className="setup-section-title">🛠️ Skills & Expertise</h3>

            <div className="form-group">
              <label className="form-label">Add Skills *</label>
              <div className="skill-input-row">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Type a skill and press Enter"
                  value={form.skillInput}
                  onChange={e => setForm(f => ({ ...f, skillInput: e.target.value }))}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(form.skillInput); } }}
                />
                <button type="button" className="btn btn-primary" onClick={() => addSkill(form.skillInput)}>Add</button>
              </div>
              <div className="skill-suggestions">
                {SKILL_SUGGESTIONS.filter(s => !form.skills.includes(s)).slice(0, 10).map(s => (
                  <button key={s} type="button" className="suggestion-chip" onClick={() => addSkill(s)}>+ {s}</button>
                ))}
              </div>
              {form.skills.length > 0 && (
                <div className="selected-skills">
                  {form.skills.map(s => (
                    <span key={s} className="chip selected-chip">
                      {s} <button type="button" onClick={() => removeSkill(s)}>×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Experience (Years)</label>
                <input name="experienceYears" type="number" className="form-input" value={form.experienceYears} onChange={handle} min={0} max={50} />
              </div>
              <div className="form-group">
                <label className="form-label">Expected Daily Wage (₹) *</label>
                <input name="expectedDailyWage" type="number" className="form-input" placeholder="e.g. 500" value={form.expectedDailyWage} onChange={handle} required min={1} />
              </div>
              <div className="form-group">
                <label className="form-label">Availability</label>
                <select name="availability" className="form-input" value={form.availability} onChange={handle}>
                  <option value="available">✅ Available</option>
                  <option value="busy">🟡 Busy</option>
                  <option value="offline">🔴 Offline</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">About Yourself</label>
              <textarea name="description" className="form-input" placeholder="Describe your work experience, strengths, availability..." value={form.description} onChange={handle} rows={3} />
            </div>
          </div>

          {/* Languages */}
          <div className="setup-section card card-body">
            <h3 className="setup-section-title">🗣️ Languages You Speak</h3>
            <div className="lang-grid">
              {LANGUAGES.map(lang => (
                <label key={lang} className={`lang-chip ${form.languages.includes(lang) ? 'selected' : ''}`}>
                  <input type="checkbox" hidden checked={form.languages.includes(lang)} onChange={() => toggleLang(lang)} />
                  {lang}
                </label>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="setup-section card card-body">
            <h3 className="setup-section-title">📍 Your Location</h3>
            <div className="form-group">
              <label className="form-label">Address</label>
              <input name="address" className="form-input" placeholder="House/Street" value={form.address} onChange={handle} />
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
            {loading ? 'Saving…' : '🎉 Complete Setup & Go to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
