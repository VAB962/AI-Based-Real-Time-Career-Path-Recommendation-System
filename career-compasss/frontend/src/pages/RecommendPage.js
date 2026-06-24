import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import TagSelector from '../components/TagSelector';
import GraphicalResults from '../components/GraphicalResults';
import JobCard from '../components/JobCard';
import './RecommendPage.css';

const STEPS = ['Skills', 'Interests', 'Experience', 'Results'];

export default function RecommendPage() {
  const { user } = useAuth();

  const [step, setStep]     = useState(0);
  const [options, setOptions] = useState({ skills: [], interests: [], education_levels: [] });
  const [form, setForm]     = useState({
    skills:               user?.profile?.skills || [],
    interests:            user?.profile?.interests || [],
    education:            user?.profile?.education || "Bachelor's",
    years_of_experience:  user?.profile?.years_of_experience || 0,
  });
  const [loading,    setLoading]    = useState(false);
  const [results,    setResults]    = useState([]);
  const [jobs,       setJobs]       = useState([]);
  const [error,      setError]      = useState('');
  const [jobLoading, setJobLoading] = useState(false);

  useEffect(() => {
    api.get('/profile/options').then(r => setOptions(r.data)).catch(() => {});
  }, []);

  const setF = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const submit = async () => {
    setLoading(true); setError('');
    try {
      const res = await api.post('/career/recommend', { ...form, top_k: 8 });
      const recs = (res.data.recommendations || []).map(r => ({
        ...r,
        pct: Math.round((r.score || 0) * 100),
      }));
      setResults(recs);
      setStep(3);
      setJobLoading(true);
      const topCareers = recs.slice(0, 3).map(r => r.career);
      const jobRes = await api.post('/jobs/recommended', { careers: topCareers, limit: 6 });
      setJobs(jobRes.data.jobs || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false); setJobLoading(false);
    }
  };

  const canNext = () => {
    if (step === 0) return form.skills.length >= 1;
    if (step === 1) return form.interests.length >= 1;
    return true;
  };

  return (
    <div className="rec-layout">
      <div className="container">
        <div className="rec-header fade-up">
          <h1>AI Career Recommendations</h1>
          <p style={{ color:'var(--text-2)', marginTop:4 }}>
            Our Random Forest model analyses your profile and generates graphical career matches.
          </p>
        </div>

        {/* Stepper */}
        {step < 3 && (
          <div className="stepper fade-up">
            {STEPS.slice(0, 3).map((label, i) => (
              <React.Fragment key={label}>
                <div className={`step ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
                  <div className="step-circle">{i < step ? '✓' : i + 1}</div>
                  <span className="step-label">{label}</span>
                </div>
                {i < 2 && <div className={`step-line ${i < step ? 'done' : ''}`} />}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Step 0 — Skills */}
        {step === 0 && (
          <div className="card step-card fade-up">
            <h2 style={{ marginBottom:6 }}>What are your skills?</h2>
            <p style={{ color:'var(--text-2)', fontSize:'0.9rem', marginBottom:20 }}>
              Select all that apply — more skills = better matches.
            </p>
            <TagSelector options={options.skills} selected={form.skills}
              onChange={v => setF('skills', v)} />
            <div className="step-actions">
              <span style={{ color:'var(--text-2)', fontSize:'0.85rem' }}>
                {form.skills.length} skill{form.skills.length !== 1 ? 's' : ''} selected
              </span>
              <button className="btn btn-primary" onClick={() => setStep(1)} disabled={!canNext()}>
                Next: Interests →
              </button>
            </div>
          </div>
        )}

        {/* Step 1 — Interests */}
        {step === 1 && (
          <div className="card step-card fade-up">
            <h2 style={{ marginBottom:6 }}>What interests you?</h2>
            <p style={{ color:'var(--text-2)', fontSize:'0.9rem', marginBottom:20 }}>
              Choose the fields that genuinely excite you.
            </p>
            <TagSelector options={options.interests} selected={form.interests}
              onChange={v => setF('interests', v)} searchable={false} />
            <div className="step-actions">
              <button className="btn btn-ghost" onClick={() => setStep(0)}>← Back</button>
              <button className="btn btn-primary" onClick={() => setStep(2)} disabled={!canNext()}>
                Next: Experience →
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — Experience */}
        {step === 2 && (
          <div className="card step-card fade-up">
            <h2 style={{ marginBottom:20 }}>Your background</h2>
            <div className="exp-grid">
              <div className="form-group">
                <label className="form-label">Education Level</label>
                <select className="form-select" value={form.education}
                  onChange={e => setF('education', e.target.value)}>
                  {options.education_levels.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">
                  Years of Experience: {form.years_of_experience}
                </label>
                <input type="range" min={0} max={20} step={1}
                  value={form.years_of_experience}
                  onChange={e => setF('years_of_experience', parseInt(e.target.value))}
                  className="range-slider" />
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.75rem', color:'var(--text-2)', marginTop:4 }}>
                  <span>0 yrs</span><span>20+ yrs</span>
                </div>
              </div>
            </div>
            {error && <div className="alert alert-error" style={{ marginTop:16 }}>{error}</div>}
            <div className="step-actions">
              <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
              <button className="btn btn-primary" onClick={submit} disabled={loading}>
                {loading
                  ? <><span className="spinner" style={{ width:16, height:16, borderWidth:2 }} /> Analysing…</>
                  : '⬡ Get Graphical Results →'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Graphical Results */}
        {step === 3 && (
          <div className="results-section">
            {/* Input summary */}
            <div className="card results-summary fade-up">
              <div className="summary-pills">
                <span style={{ color:'var(--text-2)', fontSize:'0.85rem' }}>Analysed:</span>
                {form.skills.slice(0, 5).map(s => (
                  <span key={s} className="badge badge-blue">{s}</span>
                ))}
                {form.skills.length > 5 && (
                  <span className="badge badge-indigo">+{form.skills.length - 5} more</span>
                )}
                <span className="badge badge-green">{form.education}</span>
                <span className="badge badge-orange">{form.years_of_experience}yr exp</span>
              </div>
              <button className="btn btn-ghost" onClick={() => setStep(0)} style={{ flexShrink:0 }}>
                ↺ Redo
              </button>
            </div>

            {/* ── GRAPHICAL DASHBOARD ── */}
            <GraphicalResults
              recommendations={results}
              heroTitle="Your AI Match: "
              heroCareer={results[0]?.career}
            />

            {/* Live jobs */}
            <div style={{ marginTop:40 }}>
              <div className="results-header">
                <h2>🔴 Live Jobs for Your Matches</h2>
                <Link to="/jobs" className="btn btn-outline" style={{ fontSize:'0.85rem' }}>
                  View All Jobs
                </Link>
              </div>
              {jobLoading ? (
                <div style={{ display:'flex', justifyContent:'center', padding:32 }}>
                  <div className="spinner" />
                </div>
              ) : (
                <div className="jobs-grid">
                  {jobs.map(job => <JobCard key={job.id} job={job} />)}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
