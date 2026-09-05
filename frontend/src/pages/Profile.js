import React, { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { getInitials, INDIAN_STATES, LANGUAGES, DURATION_OPTIONS } from '../utils/constants';
import StarRating from '../components/StarRating';
import './Profile.css';
import './Setup.css';

const SKILL_SUGGESTIONS = ['Cleaning','Sweeping','Security Guard','Driver','Labor','Helper','Cook','Electrician','Plumber','Gardener','Delivery','Carpenter','Painter','Peon','Caretaker','Watchman'];
const BUSINESS_TYPES = [
  { icon: '🏠', label: 'Home Owner' },
  { icon: '🧓', label: 'Senior / Family' },
  { icon: '🏗️', label: 'Small Construction' },
  { icon: '🛒', label: 'Shop Owner' },
  { icon: '🍽️', label: 'Restaurant / Dhaba' },
  { icon: '🏢', label: 'Company / Office' },
  { icon: '🏭', label: 'Factory / Warehouse' },
  { icon: '🚚', label: 'Logistics' },
  { icon: '🏥', label: 'Hospital / Clinic' },
  { icon: '🏫', label: 'School / College' },
  { icon: '🌿', label: 'Farm / Agriculture' },
  { icon: '💼', label: 'Other' },
];

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const isWorker = user?.role === 'worker';
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileRef = useRef();

  // Editable fields
  const [userForm, setUserForm] = useState({ name: '', address: '', city: '', state: '', pincode: '' });
  const [workerForm, setWorkerForm] = useState({ skills: [], skillInput: '', experienceYears: 0, expectedDailyWage: '', languages: [], availability: 'available', description: '' });
  const [employerForm, setEmployerForm] = useState({ companyName: '', businessType: '', description: '' });

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const endpoint = isWorker ? '/workers/my-profile' : '/employers/my-profile';
      const [profRes, revRes] = await Promise.all([
        api.get(endpoint),
        api.get(`/reviews/${user._id}`),
      ]);
      setProfile(profRes.data);
      setReviews(revRes.data);

      setUserForm({
        name: user.name || '',
        address: user.location?.address || '',
        city: user.location?.city || '',
        state: user.location?.state || '',
        pincode: user.location?.pincode || '',
      });

      if (isWorker && profRes.data) {
        setWorkerForm({
          skills: profRes.data.skills || [],
          skillInput: '',
          experienceYears: profRes.data.experienceYears || 0,
          expectedDailyWage: profRes.data.expectedDailyWage || '',
          languages: profRes.data.languages || [],
          availability: profRes.data.availability || 'available',
          description: profRes.data.description || '',
        });
      }
      if (!isWorker && profRes.data) {
        setEmployerForm({
          companyName: profRes.data.companyName || '',
          businessType: profRes.data.businessType || '',
          description: profRes.data.description || '',
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/users/me', {
        name: userForm.name,
        location: { address: userForm.address, city: userForm.city, state: userForm.state, pincode: userForm.pincode },
      });
      await refreshUser();
      toast.success('Profile updated!');
    } catch (err) {
      toast.error('Failed to save');
    } finally { setSaving(false); }
  };

  const handleWorkerSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/workers/profile', {
        skills: workerForm.skills,
        experienceYears: Number(workerForm.experienceYears),
        expectedDailyWage: Number(workerForm.expectedDailyWage),
        languages: workerForm.languages,
        availability: workerForm.availability,
        description: workerForm.description,
      });
      toast.success('Worker profile updated!');
      loadProfile();
    } catch (err) {
      toast.error('Failed to save');
    } finally { setSaving(false); }
  };

  const handleEmployerSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/employers/profile', employerForm);
      toast.success('Employer profile updated!');
      loadProfile();
    } catch (err) {
      toast.error('Failed to save');
    } finally { setSaving(false); }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    setAvatarUploading(true);
    try {
      await api.post('/users/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      await refreshUser();
      toast.success('Photo updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally { setAvatarUploading(false); }
  };

  const addSkill = (s) => {
    const skill = s.trim();
    if (skill && !workerForm.skills.includes(skill)) {
      setWorkerForm(f => ({ ...f, skills: [...f.skills, skill], skillInput: '' }));
    }
  };

  const removeSkill = (s) => setWorkerForm(f => ({ ...f, skills: f.skills.filter(x => x !== s) }));

  const toggleLang = (lang) => setWorkerForm(f => ({
    ...f,
    languages: f.languages.includes(lang) ? f.languages.filter(l => l !== lang) : [...f.languages, lang]
  }));

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="page-content">
      <div className="container">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-header-content">
            <div className="profile-avatar-wrap">
              {user?.avatarUrl
                ? <img src={user.avatarUrl} alt={user.name} className="avatar avatar-xl profile-avatar-img" />
                : <div className="avatar avatar-xl">{getInitials(user?.name)}</div>
              }
              <button className="avatar-edit-btn" onClick={() => fileRef.current.click()} disabled={avatarUploading} title="Change photo">
                {avatarUploading ? '…' : '📷'}
              </button>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleAvatarUpload} />
            </div>
            <div className="profile-header-info">
              <h1 className="profile-name">{user?.name}</h1>
              <div className="profile-header-meta">
                <span className={`badge ${isWorker ? 'badge-primary' : 'badge-info'}`}>
                  {isWorker ? '👷 Worker' : '🏢 Employer'}
                </span>
                {user?.location?.city && <span>📍 {user.location.city}{user.location.state && `, ${user.location.state}`}</span>}
                {user?.phone && <span>📱 {user.phone}</span>}
              </div>
              {profile?.rating > 0 && (
                <div style={{ marginTop: 8 }}>
                  <StarRating rating={profile.rating} size={15} />
                </div>
              )}
              {isWorker && profile && (
                <div style={{ marginTop: 8 }}>
                  <span className={`badge badge-${profile.availability === 'available' ? 'success' : profile.availability === 'busy' ? 'warning' : 'secondary'}`} style={{ textTransform: 'capitalize' }}>
                    ● {profile.availability}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>✏️ Edit Profile</button>
          {isWorker && <button className={`tab-btn ${activeTab === 'skills' ? 'active' : ''}`} onClick={() => setActiveTab('skills')}>🛠️ Skills & Job</button>}
          {!isWorker && <button className={`tab-btn ${activeTab === 'business' ? 'active' : ''}`} onClick={() => setActiveTab('business')}>🏠 Hiring Info</button>}
          <button className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>⭐ Reviews ({reviews.length})</button>
        </div>

        {/* Tab: Basic Info */}
        {activeTab === 'profile' && (
          <form onSubmit={handleUserSave} className="card card-body profile-form">
            <h3 className="detail-section-title">👤 Personal Information</h3>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-input" value={userForm.name} onChange={e => setUserForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input className="form-input" value={user?.phone} disabled style={{ background: '#f8f9fa', cursor: 'not-allowed' }} />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Phone cannot be changed</span>
            </div>
            <div className="divider" />
            <h3 className="detail-section-title">📍 Location</h3>
            <div className="form-group">
              <label className="form-label">Address</label>
              <input className="form-input" placeholder="Street / Area" value={userForm.address} onChange={e => setUserForm(f => ({ ...f, address: e.target.value }))} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">City</label>
                <input className="form-input" placeholder="City" value={userForm.city} onChange={e => setUserForm(f => ({ ...f, city: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">State</label>
                <select className="form-input" value={userForm.state} onChange={e => setUserForm(f => ({ ...f, state: e.target.value }))}>
                  <option value="">Select</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Pincode</label>
                <input className="form-input" placeholder="400001" value={userForm.pincode} onChange={e => setUserForm(f => ({ ...f, pincode: e.target.value }))} maxLength={6} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ alignSelf: 'flex-start' }}>
              {saving ? 'Saving…' : '💾 Save Changes'}
            </button>
          </form>
        )}

        {/* Tab: Worker Skills */}
        {activeTab === 'skills' && isWorker && (
          <form onSubmit={handleWorkerSave} className="card card-body profile-form">
            <h3 className="detail-section-title">🛠️ Skills & Availability</h3>

            <div className="form-group">
              <label className="form-label">Skills</label>
              <div style={{ display: 'flex', gap: 10 }}>
                <input
                  className="form-input"
                  placeholder="Add a skill and press Enter"
                  value={workerForm.skillInput}
                  onChange={e => setWorkerForm(f => ({ ...f, skillInput: e.target.value }))}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(workerForm.skillInput); } }}
                />
                <button type="button" className="btn btn-primary" onClick={() => addSkill(workerForm.skillInput)}>Add</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                {SKILL_SUGGESTIONS.filter(s => !workerForm.skills.includes(s)).slice(0, 8).map(s => (
                  <button key={s} type="button" className="suggestion-chip" onClick={() => addSkill(s)}>+ {s}</button>
                ))}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                {workerForm.skills.map(s => (
                  <span key={s} className="selected-chip">
                    {s} <button type="button" onClick={() => removeSkill(s)}>×</button>
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Experience (Years)</label>
                <input type="number" className="form-input" value={workerForm.experienceYears} onChange={e => setWorkerForm(f => ({ ...f, experienceYears: e.target.value }))} min={0} />
              </div>
              <div className="form-group">
                <label className="form-label">Expected Daily Wage (₹)</label>
                <input type="number" className="form-input" placeholder="e.g. 500" value={workerForm.expectedDailyWage} onChange={e => setWorkerForm(f => ({ ...f, expectedDailyWage: e.target.value }))} min={1} />
              </div>
              <div className="form-group">
                <label className="form-label">Availability</label>
                <select className="form-input" value={workerForm.availability} onChange={e => setWorkerForm(f => ({ ...f, availability: e.target.value }))}>
                  <option value="available">✅ Available</option>
                  <option value="busy">🟡 Busy</option>
                  <option value="offline">🔴 Offline</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Languages</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {LANGUAGES.map(lang => (
                  <label key={lang} className={`lang-chip ${workerForm.languages.includes(lang) ? 'selected' : ''}`}>
                    <input type="checkbox" hidden checked={workerForm.languages.includes(lang)} onChange={() => toggleLang(lang)} />
                    {lang}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">About Yourself</label>
              <textarea className="form-input" rows={4} value={workerForm.description} onChange={e => setWorkerForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe your experience..." />
            </div>

            <button type="submit" className="btn btn-primary" disabled={saving} style={{ alignSelf: 'flex-start' }}>
              {saving ? 'Saving…' : '💾 Save Worker Profile'}
            </button>
          </form>
        )}

        {/* Tab: Employer Business */}
        {activeTab === 'business' && !isWorker && (
          <form onSubmit={handleEmployerSave} className="card card-body profile-form">
            <h3 className="detail-section-title">🏠 Who Are You Hiring For?</h3>
            <div className="form-group">
              <label className="form-label">Your Name / Organisation <span className="text-muted">(optional)</span></label>
              <input className="form-input" placeholder="e.g. Sharma Ji, or ABC Shop, or leave blank" value={employerForm.companyName} onChange={e => setEmployerForm(f => ({ ...f, companyName: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">I am a</label>
              <div className="hiring-type-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                {BUSINESS_TYPES.map(bt => (
                  <label key={bt.label} className={`hiring-type-card ${employerForm.businessType === bt.label ? 'selected' : ''}`}>
                    <input type="radio" hidden name="businessType" value={bt.label} checked={employerForm.businessType === bt.label} onChange={e => setEmployerForm(f => ({ ...f, businessType: e.target.value }))} />
                    <span className="ht-icon">{bt.icon}</span>
                    <span className="ht-label">{bt.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">What Kind of Help Do You Need?</label>
              <textarea className="form-input" rows={4} value={employerForm.description} onChange={e => setEmployerForm(f => ({ ...f, description: e.target.value }))} placeholder="e.g. I need a cleaner for my home twice a week, or I need a driver from Monday to Saturday..." />
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ alignSelf: 'flex-start' }}>
              {saving ? 'Saving…' : '💾 Save Business Profile'}
            </button>
          </form>
        )}

        {/* Tab: Reviews */}
        {activeTab === 'reviews' && (
          <div className="card card-body">
            <h3 className="detail-section-title">⭐ Reviews Received ({reviews.length})</h3>
            {profile?.rating > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, padding: '16px', background: 'var(--primary-light)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)' }}>{Number(profile.rating).toFixed(1)}</div>
                  <StarRating rating={profile.rating} size={16} />
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                </div>
              </div>
            )}
            {reviews.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 0' }}>
                <div className="empty-state-icon">⭐</div>
                <h3>No reviews yet</h3>
                <p>Complete jobs to start receiving reviews</p>
              </div>
            ) : (
              <div className="reviews-list">
                {reviews.map(r => (
                  <div key={r._id} className="review-item">
                    <div className="review-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar avatar-sm">{getInitials(r.reviewerId?.name)}</div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{r.reviewerId?.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(r.createdAt).toLocaleDateString('en-IN')}</div>
                        </div>
                      </div>
                      <StarRating rating={r.rating} size={14} />
                    </div>
                    {r.comment && <p className="review-comment">{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
