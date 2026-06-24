import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import CareerCard from '../components/CareerCard';
import ResultsDashboard from '../components/ResultsDashboard';
import JobCard from '../components/JobCard';
import './DashboardPage.css';

const STAT_CARDS = [
  { icon: '◈', label: 'AI Recommendations', key: 'rec_count',  color: 'var(--accent)' },
  { icon: '◉', label: 'Jobs Explored',       key: 'job_clicks', color: 'var(--accent-2)' },
  { icon: '◎', label: 'Profile Strength',    key: 'strength',   color: 'var(--accent-3)' },
  { icon: '◷', label: 'Search History',      key: 'history',    color: 'var(--accent-4)' },
];

function profileStrength(profile) {
  const fields = ['full_name','education','field_of_study','location','bio'];
  let score = 0;
  fields.forEach(f => { if (profile[f]) score += 14; });
  if ((profile.skills    || []).length >= 3) score += 15;
  if ((profile.interests || []).length >= 2) score += 15;
  return Math.min(score, 100);
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [lastRec,   setLastRec]   = useState([]);
  const [featJobs,  setFeatJobs]  = useState([]);
  const [recHistory, setHistory]  = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [histRes] = await Promise.all([
          api.get('/career/history'),
        ]);
        const hist = histRes.data.history || [];
        setHistory(hist);
        if (hist.length > 0) {
          const latestRecs = hist[0].results || [];
          setLastRec(latestRecs.slice(0, 3));

          // fetch jobs for top career
          const topCareers = latestRecs.slice(0, 3).map(r => r.career).join(',');
          const jobRes = await api.get(`/jobs/?careers=${encodeURIComponent(topCareers)}&limit=4`);
          setFeatJobs(jobRes.data.jobs || []);
        } else {
          const jobRes = await api.get('/jobs/?limit=4');
          setFeatJobs(jobRes.data.jobs || []);
        }
      } catch { /* silent */ } finally {
        setLoading(false);
      }
    })();
  }, []);

  const profile  = user?.profile || {};
  const strength = profileStrength(profile);
  const stats = {
    rec_count:  recHistory.length,
    job_clicks: (user?.job_click_history || []).length,
    strength:   `${strength}%`,
    history:    recHistory.length,
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="dashboard-layout">
      <div className="container">
        {/* Header */}
        <div className="dash-header fade-up">
          <div>
            <p style={{ color: 'var(--text-2)', fontSize: '0.85rem', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>
              {greeting()},
            </p>
            <h1 style={{ fontSize: '2rem' }}>
              {profile.full_name || user?.username} <span style={{ color: 'var(--accent)' }}>👋</span>
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link to="/recommend" className="btn btn-primary">Get AI Recommendations →</Link>
            <Link to="/jobs"      className="btn btn-outline">Browse Jobs</Link>
          </div>
        </div>

        {/* Quiz CTA banner */}
        <div className="card fade-up" style={{
          marginBottom: 24,
          background: 'linear-gradient(135deg, rgba(129,140,248,0.12), rgba(56,189,248,0.08))',
          borderColor: 'rgba(129,140,248,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: '2.2rem' }}>◆</span>
            <div>
              <h3 style={{ marginBottom: 4, fontSize: '1.05rem' }}>
                Not sure where to start? Take the Career Discovery Quiz
              </h3>
              <p style={{ color: 'var(--text-2)', fontSize: '0.87rem' }}>
                20 questions · 5 minutes · Get a full career roadmap
              </p>
            </div>
          </div>
          <Link to="/quiz" className="btn btn-primary" style={{ flexShrink: 0 }}>
            Start Quiz →
          </Link>
        </div>
        {strength < 80 && (
          <div className="card fade-up" style={{ marginBottom: 24, background: 'rgba(56,189,248,0.05)', borderColor: 'rgba(56,189,248,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <p style={{ fontWeight: 600, marginBottom: 4 }}>
                  ⚡ Complete your profile to improve recommendations
                </p>
                <p style={{ color: 'var(--text-2)', fontSize: '0.88rem' }}>
                  Profile is {strength}% complete. Add skills, interests and experience for better matches.
                </p>
              </div>
              <Link to="/profile" className="btn btn-outline" style={{ flexShrink: 0 }}>
                Update Profile
              </Link>
            </div>
            <div className="progress-bar" style={{ marginTop: 12 }}>
              <div className="progress-fill" style={{ width: `${strength}%` }} />
            </div>
          </div>
        )}

        {/* Stat cards */}
        <div className="stats-grid fade-up">
          {STAT_CARDS.map(({ icon, label, key, color }) => (
            <div className="card stat-card" key={key}>
              <div className="stat-icon" style={{ color }}>{icon}</div>
              <div>
                <div className="stat-value" style={{ color }}>{stats[key]}</div>
                <div className="stat-label">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="dash-grid">
          {/* Latest recommendations */}
          <section>
            <div className="section-header">
              <h2>Latest Recommendations</h2>
              <Link to="/recommend" className="btn btn-ghost" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
                Refresh →
              </Link>
            </div>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                <div className="spinner" />
              </div>
            ) : lastRec.length === 0 ? (
              <div className="empty-state card">
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>◈</div>
                <h3>No recommendations yet</h3>
                <p>Answer a few questions and our AI will suggest your ideal career paths.</p>
                <Link to="/recommend" className="btn btn-primary" style={{ marginTop: 16 }}>
                  Get Started →
                </Link>
              </div>
            ) : (
              <ResultsDashboard recommendations={lastRec} />
            )}
          </section>

          {/* Featured jobs */}
          <section>
            <div className="section-header">
              <h2>Featured Jobs</h2>
              <Link to="/jobs" className="btn btn-ghost" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
                All Jobs →
              </Link>
            </div>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                <div className="spinner" />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {featJobs.map(job => <JobCard key={job.id} job={job} />)}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
