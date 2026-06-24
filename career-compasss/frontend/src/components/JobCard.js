import React from 'react';
import api from '../utils/api';

export default function JobCard({ job, style = {} }) {
  const handleApply = async () => {
    try {
      const res = await api.post(`/jobs/click/${job.id}`);
      window.open(res.data.apply_url, '_blank', 'noopener');
    } catch {
      window.open(job.apply_url, '_blank', 'noopener');
    }
  };

  const daysAgo = (() => {
    const diff = Math.floor((Date.now() - new Date(job.posted_at)) / 86400000);
    return diff === 0 ? 'Today' : `${diff}d ago`;
  })();

  return (
    <div
      className="card fade-up"
      style={{ display: 'flex', flexDirection: 'column', gap: 12, ...style }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div>
          <h3 style={{ fontSize: '1rem', marginBottom: 4 }}>{job.title}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, color: 'var(--accent)', fontSize: '0.9rem' }}>
              {job.company}
            </span>
            <span style={{ color: 'var(--text-2)', fontSize: '0.82rem' }}>•</span>
            <span style={{ color: 'var(--text-2)', fontSize: '0.82rem' }}>{job.location}</span>
          </div>
        </div>
        <span className="badge badge-blue" style={{ flexShrink: 0, marginTop: 2 }}>
          {daysAgo}
        </span>
      </div>

      {/* Tags */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <span className="badge badge-indigo">{job.job_type}</span>
        <span className="badge badge-green">{job.experience_required}</span>
        <span className="badge badge-orange">{job.career_category}</span>
      </div>

      {/* Skills required */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {(job.required_skills || []).map(s => (
          <span key={s} style={{
            padding: '2px 8px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            fontSize: '0.75rem',
            color: 'var(--text-1)',
          }}>
            {s}
          </span>
        ))}
      </div>

      {/* Salary + CTA */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>
            SALARY RANGE
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-3)' }}>
            {job.salary_min} – {job.salary_max}
          </div>
        </div>
        <button className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }} onClick={handleApply}>
          Apply →
        </button>
      </div>
    </div>
  );
}
