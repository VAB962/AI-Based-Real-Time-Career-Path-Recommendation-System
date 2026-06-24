import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './HistoryPage.css';

export default function HistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState('recommendations');

  useEffect(() => {
    api.get('/career/history')
      .then(r => setHistory(r.data.history || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const jobHistory = (user?.job_click_history || []).slice().reverse();

  return (
    <div className="history-layout">
      <div className="container">
        <div className="history-header fade-up">
          <h1>Activity History</h1>
          <p style={{ color: 'var(--text-2)', marginTop: 4 }}>
            Your career searches and job interactions
          </p>
        </div>

        {/* Tab switcher */}
        <div className="tab-bar fade-up">
          <button
            className={`tab-btn ${tab === 'recommendations' ? 'active' : ''}`}
            onClick={() => setTab('recommendations')}
          >
            ◈ Recommendations ({history.length})
          </button>
          <button
            className={`tab-btn ${tab === 'jobs' ? 'active' : ''}`}
            onClick={() => setTab('jobs')}
          >
            ◉ Job Clicks ({jobHistory.length})
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div className="spinner" style={{ width: 48, height: 48 }} />
          </div>
        ) : tab === 'recommendations' ? (
          history.length === 0 ? (
            <div className="card empty-state">
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>◈</div>
              <h3>No recommendation history yet</h3>
              <p style={{ color: 'var(--text-2)' }}>Try the AI recommendation tool to get started.</p>
            </div>
          ) : (
            <div className="history-list">
              {history.map((entry, i) => (
                <div key={i} className="card history-item fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                  <div className="history-item-header">
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-2)', marginBottom: 4 }}>
                        {new Date(entry.timestamp).toLocaleString()}
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <span className="badge badge-blue">{entry.input?.education}</span>
                        <span className="badge badge-green">{entry.input?.years_of_experience}yr exp</span>
                        <span className="badge badge-indigo">
                          {(entry.input?.skills || []).length} skills
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Skills snapshot */}
                  {(entry.input?.skills || []).length > 0 && (
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', margin: '10px 0' }}>
                      {entry.input.skills.slice(0, 8).map(s => (
                        <span key={s} style={{
                          padding: '2px 7px',
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid var(--border)',
                          borderRadius: 4,
                          fontSize: '0.73rem',
                          color: 'var(--text-2)',
                        }}>{s}</span>
                      ))}
                      {entry.input.skills.length > 8 && (
                        <span style={{ fontSize: '0.73rem', color: 'var(--text-2)', alignSelf: 'center' }}>
                          +{entry.input.skills.length - 8}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Results */}
                  <div className="rec-results-row">
                    {(entry.results || []).slice(0, 5).map((r, j) => (
                      <div key={j} className="rec-result-chip">
                        <span style={{ fontSize: '1rem' }}>{r.icon || '💼'}</span>
                        <div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{r.career}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--accent)' }}>
                            {Math.round((r.score || 0) * 100)}% match
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          jobHistory.length === 0 ? (
            <div className="card empty-state">
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>◉</div>
              <h3>No job clicks yet</h3>
              <p style={{ color: 'var(--text-2)' }}>Browse the job board and click Apply to track here.</p>
            </div>
          ) : (
            <div className="history-list">
              {jobHistory.map((j, i) => (
                <div key={i} className="card job-click-item fade-up" style={{ animationDelay: `${i * 40}ms` }}>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 2 }}>{j.title}</div>
                    <div style={{ fontSize: '0.88rem', color: 'var(--accent)' }}>{j.company}</div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-2)' }}>
                    {new Date(j.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
