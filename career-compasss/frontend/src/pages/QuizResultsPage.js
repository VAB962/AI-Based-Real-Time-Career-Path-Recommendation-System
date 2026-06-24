import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import './QuizResultsPage.css';

export default function QuizResultsPage() {
  const { state }  = useLocation();
  const navigate   = useNavigate();

  const [activeCareer, setActiveCareer] = useState(0);
  const [roadmap,      setRoadmap]      = useState(state?.roadmap || null);
  const [roadmapFor,   setRoadmapFor]   = useState(state?.roadmap_for || '');
  const [loadingMap,   setLoadingMap]   = useState(false);
  const [activePhase,  setActivePhase]  = useState(0);
  const [revealed,     setRevealed]     = useState(false);

  const topCareers = state?.top_careers || [];

  useEffect(() => {
    // Trigger reveal animation
    const t = setTimeout(() => setRevealed(true), 100);
    return () => clearTimeout(t);
  }, []);

  // When user clicks a different career, fetch its roadmap
  const switchCareer = async (idx) => {
    setActiveCareer(idx);
    setActivePhase(0);
    const career = topCareers[idx]?.career;
    if (!career) return;
    if (career === roadmapFor) return;
    setLoadingMap(true);
    try {
      const res = await api.get(`/quiz/roadmap/${encodeURIComponent(career)}`);
      setRoadmap(res.data.roadmap);
      setRoadmapFor(career);
    } catch { /* silent */ } finally {
      setLoadingMap(false);
    }
  };

  if (!state || topCareers.length === 0) {
    return (
      <div style={{ padding: 60, textAlign: 'center' }}>
        <p style={{ color: 'var(--text-2)' }}>No results found.</p>
        <Link to="/quiz" className="btn btn-primary" style={{ marginTop: 16 }}>Take the Quiz</Link>
      </div>
    );
  }

  const career = topCareers[activeCareer];
  const phases = roadmap?.phases || [];

  return (
    <div className="results-layout">
      <div className="container">

        {/* ── Hero banner ── */}
        <div className={`results-hero ${revealed ? 'revealed' : ''}`}>
          <div className="hero-confetti" aria-hidden>
            {['◈','◉','◎','⬡','◷','◆','◇','○'].map((s,i) => (
              <span key={i} className="confetti-piece" style={{ '--i': i }}>{s}</span>
            ))}
          </div>
          <div className="hero-text">
            <p className="hero-eyebrow">Your Quiz Results Are In 🎉</p>
            <h1>You're Built for <span className="hero-highlight">{career?.career}</span></h1>
            <p className="hero-sub">
              Based on your 20 answers, here are your top career matches and a step-by-step roadmap to get there.
            </p>
          </div>
        </div>

        {/* ── Top 5 career matches ── */}
        <section className="matches-section">
          <h2 className="section-title">Top 5 Career Matches</h2>
          <div className="matches-grid">
            {topCareers.map((c, i) => (
              <button
                key={c.career}
                className={`match-card ${activeCareer === i ? 'active' : ''}`}
                onClick={() => switchCareer(i)}
                style={{ '--card-color': c.color || '#38bdf8' }}
              >
                <div className="match-rank">#{i + 1}</div>
                <div className="match-icon">{c.icon}</div>
                <div className="match-name">{c.career}</div>
                <div className="match-score-bar">
                  <div
                    className="match-score-fill"
                    style={{ width: `${Math.round(c.score * 100)}%` }}
                  />
                </div>
                <div className="match-pct">{Math.round(c.score * 100)}% match</div>
                <div className="match-meta">
                  <span>{c.avg_salary}</span>
                  <span className="match-growth">↑{c.growth}</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* ── Roadmap section ── */}
        <section className="roadmap-section">
          <div className="roadmap-header">
            <div>
              <h2 className="section-title" style={{ marginBottom: 6 }}>
                {loadingMap ? 'Loading Roadmap…' : `Your ${roadmapFor} Roadmap`}
              </h2>
              {roadmap?.description && (
                <p className="roadmap-desc">{roadmap.description}</p>
              )}
            </div>
            {/* Key stats */}
            {roadmap && (
              <div className="roadmap-stats">
                <div className="rstat">
                  <div className="rstat-label">AVG SALARY</div>
                  <div className="rstat-value">{roadmap.avg_salary}</div>
                </div>
                <div className="rstat">
                  <div className="rstat-label">JOB GROWTH</div>
                  <div className="rstat-value growth">{roadmap.job_growth}</div>
                </div>
              </div>
            )}
          </div>

          {loadingMap ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
              <div className="spinner" style={{ width: 48, height: 48 }} />
            </div>
          ) : (
            <>
              {/* Phase tabs */}
              <div className="phase-tabs">
                {phases.map((ph, i) => (
                  <button
                    key={i}
                    className={`phase-tab ${activePhase === i ? 'active' : ''} ${i < activePhase ? 'done' : ''}`}
                    onClick={() => setActivePhase(i)}
                  >
                    <div className="phase-tab-num">{i + 1}</div>
                    <div className="phase-tab-info">
                      <div className="phase-tab-title">{ph.title}</div>
                      <div className="phase-tab-dur">{ph.duration}</div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Active phase detail */}
              {phases[activePhase] && (
                <div className="phase-detail card fade-up" key={activePhase}>
                  <div className="phase-detail-header">
                    <div className="phase-number-big">Phase {phases[activePhase].phase}</div>
                    <div>
                      <h3 className="phase-detail-title">{phases[activePhase].title}</h3>
                      <span className="badge badge-blue">{phases[activePhase].duration}</span>
                    </div>
                  </div>

                  {/* Steps */}
                  <div className="phase-steps">
                    <h4 className="steps-label">Action Steps</h4>
                    <ol className="steps-list">
                      {phases[activePhase].steps.map((step, i) => (
                        <li key={i} className="step-item" style={{ animationDelay: `${i * 80}ms` }}>
                          <div className="step-num">{i + 1}</div>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Resources */}
                  {phases[activePhase].resources?.length > 0 && (
                    <div className="phase-resources">
                      <h4 className="steps-label">Recommended Resources</h4>
                      <div className="resources-grid">
                        {phases[activePhase].resources.map((r, i) => (
                          <a
                            key={i}
                            href={r.startsWith('http') ? r : `https://${r}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="resource-chip"
                          >
                            <span className="resource-icon">🔗</span>
                            {r}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Phase nav buttons */}
                  <div className="phase-nav">
                    <button
                      className="btn btn-ghost"
                      disabled={activePhase === 0}
                      onClick={() => setActivePhase(p => p - 1)}
                    >
                      ← Previous Phase
                    </button>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {phases.map((_, i) => (
                        <div
                          key={i}
                          className={`phase-dot ${i === activePhase ? 'active' : ''} ${i < activePhase ? 'done' : ''}`}
                          onClick={() => setActivePhase(i)}
                        />
                      ))}
                    </div>
                    <button
                      className="btn btn-primary"
                      disabled={activePhase === phases.length - 1}
                      onClick={() => setActivePhase(p => p + 1)}
                    >
                      Next Phase →
                    </button>
                  </div>
                </div>
              )}

              {/* Key skills + certifications */}
              {roadmap && (
                <div className="skills-certs-grid">
                  {roadmap.key_skills?.length > 0 && (
                    <div className="card">
                      <h3 style={{ marginBottom: 14, fontSize: '1rem' }}>🧠 Key Skills to Master</h3>
                      <div className="tag-cloud">
                        {roadmap.key_skills.map(s => (
                          <span key={s} className="badge badge-blue">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {roadmap.certifications?.length > 0 && (
                    <div className="card">
                      <h3 style={{ marginBottom: 14, fontSize: '1rem' }}>🏅 Recommended Certifications</h3>
                      <div className="cert-list">
                        {roadmap.certifications.map(c => (
                          <div key={c} className="cert-item">
                            <span className="cert-icon">✓</span>
                            <span>{c}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </section>

        {/* ── CTA strip ── */}
        <div className="cta-strip card">
          <div>
            <h3 style={{ marginBottom: 4 }}>Ready to find jobs in {roadmapFor}?</h3>
            <p style={{ color: 'var(--text-2)', fontSize: '0.9rem' }}>
              Browse live listings matched to your new career path.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link
              to={`/jobs?careers=${encodeURIComponent(roadmapFor)}`}
              className="btn btn-primary"
            >
              Browse Jobs →
            </Link>
            <button
              className="btn btn-outline"
              onClick={() => navigate('/quiz')}
            >
              Retake Quiz
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
