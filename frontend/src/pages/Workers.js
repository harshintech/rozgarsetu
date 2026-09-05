import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { JOB_CATEGORIES } from '../utils/constants';
import WorkerCard from '../components/WorkerCard';
import HireModal from '../components/HireModal';
import '../components/WorkerCard.css';

export default function Workers() {
  const [workers, setWorkers] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hireTarget, setHireTarget] = useState(null);
  const [params, setParams] = useSearchParams();
  const { user } = useAuth();

  const [filters, setFilters] = useState({
    skill: params.get('skill') || '',
    city: params.get('city') || '',
    availability: '',
    minWage: '',
    maxWage: '',
  });

  const fetchWorkers = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page: pg, limit: 12 });
      if (filters.skill) q.set('skill', filters.skill);
      if (filters.city) q.set('city', filters.city);
      if (filters.availability) q.set('availability', filters.availability);
      if (filters.minWage) q.set('minWage', filters.minWage);
      if (filters.maxWage) q.set('maxWage', filters.maxWage);
      const res = await api.get(`/workers?${q}`);
      setWorkers(res.data.profiles);
      setTotal(res.data.total);
      setPages(res.data.pages);
      setPage(pg);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchWorkers(1); }, [fetchWorkers]);

  const handleFilter = e => {
    e.preventDefault();
    fetchWorkers(1);
  };

  const resetFilters = () => {
    setFilters({ skill: '', city: '', availability: '', minWage: '', maxWage: '' });
  };

  const SKILLS = ['Cleaning','Security Guard','Driver','Labor','Cook','Electrician','Plumber','Gardener','Delivery','Carpenter','Painter'];

  return (
    <div className="page-content">
      <div className="container">
        <div style={{ marginBottom: 24 }}>
          <h1 className="page-title">Browse Workers 👷</h1>
          <p className="page-subtitle">{total} workers found across India</p>
        </div>

        {/* Category Pills */}
        <div className="category-pills">
          <button className={`category-pill ${!filters.skill ? 'active' : ''}`} onClick={() => { setFilters(f => ({ ...f, skill: '' })); }}>
            All Categories
          </button>
          {SKILLS.map(s => (
            <button key={s} className={`category-pill ${filters.skill === s ? 'active' : ''}`} onClick={() => setFilters(f => ({ ...f, skill: s }))}>
              {JOB_CATEGORIES.find(c => c.value === s)?.icon || '💼'} {s}
            </button>
          ))}
        </div>

        {/* Filter Bar */}
        <form className="filter-bar" onSubmit={handleFilter}>
          <div className="filter-row">
            <div className="filter-group">
              <label className="filter-label">Skill</label>
              <input className="form-input" placeholder="e.g. Driver, Cook…" value={filters.skill} onChange={e => setFilters(f => ({ ...f, skill: e.target.value }))} />
            </div>
            <div className="filter-group">
              <label className="filter-label">City</label>
              <input className="form-input" placeholder="e.g. Mumbai…" value={filters.city} onChange={e => setFilters(f => ({ ...f, city: e.target.value }))} />
            </div>
            <div className="filter-group">
              <label className="filter-label">Availability</label>
              <select className="form-input" value={filters.availability} onChange={e => setFilters(f => ({ ...f, availability: e.target.value }))}>
                <option value="">All</option>
                <option value="available">✅ Available</option>
                <option value="busy">🟡 Busy</option>
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">Min Wage (₹/day)</label>
              <input className="form-input" type="number" placeholder="0" value={filters.minWage} onChange={e => setFilters(f => ({ ...f, minWage: e.target.value }))} min={0} />
            </div>
            <div className="filter-group">
              <label className="filter-label">Max Wage (₹/day)</label>
              <input className="form-input" type="number" placeholder="Any" value={filters.maxWage} onChange={e => setFilters(f => ({ ...f, maxWage: e.target.value }))} min={0} />
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <button type="submit" className="btn btn-primary">Search</button>
              <button type="button" className="btn btn-ghost" onClick={resetFilters}>Reset</button>
            </div>
          </div>
        </form>

        {/* Results */}
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : workers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👷</div>
            <h3>No workers found</h3>
            <p>Try changing your filters or search terms</p>
          </div>
        ) : (
          <>
            <div className="workers-grid">
              {workers.map(profile => {
                const isMe = user && String(profile.userId?._id) === String(user._id);
                return (
                  <WorkerCard
                    key={profile._id}
                    profile={profile}
                    showHireBtn={!!user && !isMe}
                    onHire={setHireTarget}
                  />
                );
              })}
            </div>

            {pages > 1 && (
              <div className="pagination">
                <button className="page-btn" onClick={() => fetchWorkers(page - 1)} disabled={page === 1}>‹</button>
                {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                  <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => fetchWorkers(p)}>{p}</button>
                ))}
                <button className="page-btn" onClick={() => fetchWorkers(page + 1)} disabled={page === pages}>›</button>
              </div>
            )}
          </>
        )}
      </div>

      {hireTarget && (
        <HireModal worker={hireTarget} onClose={() => setHireTarget(null)} onSuccess={() => fetchWorkers(page)} />
      )}
    </div>
  );
}
