import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const STEPS = { PHONE: 'phone', OTP: 'otp' };

export default function Login() {
  const [step, setStep] = useState(STEPS.PHONE);
  const [isNewUser, setIsNewUser] = useState(false);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('worker');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [receivedOtp, setReceivedOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    const r = params.get('role');
    if (r === 'employer' || r === 'worker') setRole(r);
  }, [params]);

  useEffect(() => {
    if (timer > 0) { const t = setTimeout(() => setTimer(t => t - 1), 1000); return () => clearTimeout(t); }
  }, [timer]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!phone || phone.length < 10) return toast.error('Enter a valid phone number');
    setLoading(true);
    try {
      // Check if phone exists first
      const check = await api.post('/auth/check-phone', { phone });
      const body = check.data.exists
        ? { phone }
        : { phone, name: name.trim(), role };

      if (!check.data.exists && !name.trim()) {
        toast.error('Enter your name to register');
        setLoading(false);
        return;
      }

      const res = await api.post('/auth/send-otp', body);
      setIsNewUser(res.data.isNewUser);
      if (res.data.otp) {
        setReceivedOtp(res.data.otp);
      }
      toast.success('OTP sent!');
      setStep(STEPS.OTP);
      setTimer(60);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus();
  };

  const handleOtpKey = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) document.getElementById(`otp-${idx - 1}`)?.focus();
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      document.getElementById('otp-5')?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpStr = otp.join('');
    if (otpStr.length < 6) return toast.error('Enter 6-digit OTP');
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { phone, otp: otpStr });
      login(res.data.token, res.data.user);
      toast.success(`Welcome, ${res.data.user.name}!`);
      if (isNewUser) {
        navigate(res.data.user.role === 'worker' ? '/setup/worker' : '/setup/employer');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <span className="brand-logo brand-logo-lg">RS</span>
          <h1>Rozgar Setu</h1>
          <p>रोजगार सेतु</p>
        </div>
        <div className="auth-tagline">
          <h2>Your Bridge to<br /><span>Better Opportunities</span></h2>
          <p>Connect with employers and workers across India. Find jobs or hire skilled workers in minutes.</p>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-box">
          {step === STEPS.PHONE ? (
            <>
              <h2 className="auth-title">Welcome 👋</h2>
              <p className="auth-sub">Sign in or create a new account</p>

              <form onSubmit={handleSendOTP}>
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <div className="phone-input-wrap">
                    <span className="phone-prefix">🇮🇳 +91</span>
                    <input
                      type="tel"
                      className="form-input phone-input"
                      placeholder="Enter 10-digit number"
                      value={phone}
                      onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      maxLength={10}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Your Name <span className="text-muted">(for new users)</span></label>
                  <input type="text" className="form-input" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} />
                </div>

                <div className="form-group">
                  <label className="form-label">I want to…</label>
                  <div className="role-toggle">
                    <button type="button" className={`role-btn ${role === 'worker' ? 'active' : ''}`} onClick={() => setRole('worker')}>
                      👷 Find Work
                    </button>
                    <button type="button" className={`role-btn ${role === 'employer' ? 'active' : ''}`} onClick={() => setRole('employer')}>
                      🏠 Hire Someone
                    </button>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 6 }}>
                    {role === 'worker'
                      ? '👷 Register as a worker — find cleaning, driving, labor jobs & more'
                      : '🏠 Hire workers for your home, shop, office or farm — anyone can hire!'
                    }
                  </p>
                </div>

                <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                  {loading ? 'Sending…' : 'Get OTP →'}
                </button>
              </form>

              <p className="auth-note">
                <span>🔒</span> Demo Mode: OTP will be displayed on screen
              </p>
            </>
          ) : (
            <>
              <button className="back-btn" onClick={() => { setStep(STEPS.PHONE); setOtp(['','','','','','']); }}>
                ← Back
              </button>
              <h2 className="auth-title">Enter OTP</h2>
              <p className="auth-sub">Sent to +91 {phone}</p>

              {receivedOtp ? (
                <div className="otp-display-banner">
                  <div className="otp-display-header">
                    <span>🔑</span> DEMO OTP CODE
                  </div>
                  <div className="otp-display-code">{receivedOtp}</div>
                  <button
                    type="button"
                    className="otp-autofill-btn"
                    onClick={() => {
                      setOtp(receivedOtp.split(''));
                    }}
                  >
                    ⚡ Auto-fill OTP
                  </button>
                </div>
              ) : (
                <div className="otp-hint">
                  📋 Check your server console/terminal for the OTP
                </div>
              )}

              <form onSubmit={handleVerify}>
                <div className="otp-inputs" onPaste={handleOtpPaste}>
                  {otp.map((val, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className="otp-box"
                      value={val}
                      onChange={e => handleOtpChange(e.target.value, i)}
                      onKeyDown={e => handleOtpKey(e, i)}
                    />
                  ))}
                </div>

                <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                  {loading ? 'Verifying…' : '✅ Verify & Continue'}
                </button>

                <div style={{ textAlign: 'center', marginTop: 16 }}>
                  {timer > 0
                    ? <span className="text-muted" style={{ fontSize: '0.88rem' }}>Resend in {timer}s</span>
                    : <button type="button" className="btn btn-ghost btn-sm" onClick={handleSendOTP}>Resend OTP</button>
                  }
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
