import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getInitials } from '../utils/constants';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');

  const handleLogout = () => { logout(); navigate('/'); setMenuOpen(false); };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/workers?skill=${encodeURIComponent(search.trim())}`);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="brand-logo">RS</span>
          <span className="brand-text">Rozgar Setu</span>
        </Link>

        <form className="navbar-search" onSubmit={handleSearch}>
          <input
            className="search-input"
            placeholder="Search workers, skills..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button type="submit" className="search-btn">🔍</button>
        </form>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          {user ? (
            <>
              <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <Link to="/workers" className={`nav-link ${isActive('/workers') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Workers</Link>
              <Link to="/jobs" className={`nav-link ${isActive('/jobs') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Jobs</Link>
              <Link to="/requests" className={`nav-link ${isActive('/requests') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Requests</Link>
              <Link to="/applications" className={`nav-link ${isActive('/applications') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Applications</Link>
              <Link to="/jobs/post" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>+ Post Job</Link>
              <div className="nav-divider" />
              <Link to="/profile" className="nav-avatar-link" onClick={() => setMenuOpen(false)}>
                {user.avatarUrl
                  ? <img src={user.avatarUrl} alt={user.name} className="avatar avatar-sm" />
                  : <div className="avatar avatar-sm">{getInitials(user.name)}</div>
                }
                <span className="nav-name">{user.name.split(' ')[0]}</span>
              </Link>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/workers" className="nav-link" onClick={() => setMenuOpen(false)}>Find Workers</Link>
              <Link to="/jobs" className="nav-link" onClick={() => setMenuOpen(false)}>Browse Jobs</Link>
              <Link to="/login" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>Login / Sign Up</Link>
            </>
          )}
        </div>

        <button className="hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
          <span /><span /><span />
        </button>
      </div>
    </nav>
  );
}
