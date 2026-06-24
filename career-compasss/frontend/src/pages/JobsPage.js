import React, { useEffect, useState, useCallback } from 'react';
import api from '../utils/api';
import JobCard from '../components/JobCard';
import './JobsPage.css';

const CAREER_CATEGORIES = [
  'Software Engineer','Data Scientist','UX/UI Designer','Product Manager',
  'Cybersecurity Analyst','DevOps Engineer','Machine Learning Engineer',
  'Business Analyst','Financial Analyst','Digital Marketer',
  'Healthcare Administrator','Biomedical Researcher','Graphic Designer',
  'Content Writer','Environmental Scientist','Teacher/Educator',
  'Mechanical Engineer','Electrical Engineer','Lawyer/Legal Analyst','Social Worker',
];

const LIMIT = 12;

export default function JobsPage() {
  const [jobs,     setJobs]     = useState([]);
  const [total,    setTotal]    = useState(0);
  const [offset,   setOffset]   = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [query,    setQuery]    = useState('');
  const [selected, setSelected] = useState([]);

  const fetchJobs = useCallback(async (q, cats, off) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: LIMIT, offset: off });
      if (q)             params.set('q', q);
      if (cats.length)   params.set('careers', cats.join(','));
      const res = await api.get(`/jobs/?${params}`);
      setJobs(res.data.jobs || []);
      setTotal(res.data.total || 0);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs(query, selected, offset);
  }, [fetchJobs, query, selected, offset]);

  const toggleCat = (cat) => {
    setOffset(0);
    setSelected(s => s.includes(cat) ? s.filter(c => c !== cat) : [...s, cat]);
  };

  const handleSearch = e => {
    setOffset(0);
    setQuery(e.target.value);
  };

  const pages    = Math.ceil(total / LIMIT);
  const currentP = Math.floor(offset / LIMIT) + 1;

  return (
    <div className="jobs-layout">
      <div className="container">
        {/* Header */}
        <div className="jobs-header fade-up">
          <div>
            <h1>Live Job Board</h1>
            <p style={{ color: 'var(--text-2)', marginTop: 4 }}>
              {total} positions across 20 career categories
            </p>
          </div>
          <div className="search-box">
            <span className="search-icon">⌕</span>
            <input
              className="search-input"
              placeholder="Search by title or company…"
              value={query}
              onChange={handleSearch}
            />
          </div>
        </div>

        <div className="jobs-layout-inner">
          {/* Sidebar filters */}
          <aside className="jobs-sidebar">
            <div className="card">
              <h3 style={{ marginBottom: 14, fontSize: '0.9rem' }}>Filter by Career</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {CAREER_CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => toggleCat(cat)}
                    className={`filter-btn ${selected.includes(cat) ? 'active' : ''}`}
                  >
                    <span>{cat}</span>
                    {selected.includes(cat) && <span>✓</span>}
                  </button>
                ))}
              </div>
              {selected.length > 0 && (
                <button
                  className="btn btn-ghost"
                  style={{ width: '100%', marginTop: 12, justifyContent: 'center', fontSize: '0.82rem' }}
                  onClick={() => { setSelected([]); setOffset(0); }}
                >
                  Clear filters
                </button>
              )}
            </div>
          </aside>

          {/* Main content */}
          <div className="jobs-main">
            {/* Active filters */}
            {selected.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                <span style={{ color: 'var(--text-2)', fontSize: '0.82rem', alignSelf: 'center' }}>Filtering:</span>
                {selected.map(c => (
                  <button key={c} className="badge badge-blue" style={{ cursor: 'pointer', border: 'none' }}
                    onClick={() => toggleCat(c)}>
                    {c} ✕
                  </button>
                ))}
              </div>
            )}

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
                <div className="spinner" style={{ width: 48, height: 48 }} />
              </div>
            ) : jobs.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: 48 }}>
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>◉</div>
                <h3>No jobs found</h3>
                <p style={{ color: 'var(--text-2)' }}>Try adjusting your search or filters.</p>
              </div>
            ) : (
              <div className="jobs-grid-main">
                {jobs.map(job => <JobCard key={job.id} job={job} />)}
              </div>
            )}

            {/* Pagination */}
            {pages > 1 && (
              <div className="pagination">
                <button className="btn btn-ghost" disabled={offset === 0}
                  onClick={() => setOffset(o => Math.max(0, o - LIMIT))}>
                  ← Prev
                </button>
                <span style={{ color: 'var(--text-2)', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>
                  Page {currentP} of {pages}
                </span>
                <button className="btn btn-ghost" disabled={offset + LIMIT >= total}
                  onClick={() => setOffset(o => o + LIMIT)}>
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
