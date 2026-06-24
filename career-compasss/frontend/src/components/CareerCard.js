import React from 'react';

const CATEGORY_COLORS = {
  Technology:  'badge-blue',
  Design:      'badge-indigo',
  Business:    'badge-orange',
  Finance:     'badge-green',
  Healthcare:  'badge-green',
  Science:     'badge-blue',
  Engineering: 'badge-indigo',
  Marketing:   'badge-orange',
  Education:   'badge-green',
  Media:       'badge-indigo',
  Law:         'badge-orange',
  Social:      'badge-green',
};

export default function CareerCard({ rec, rank, style = {} }) {
  const pct = Math.round((rec.score || 0) * 100);
  const color = CATEGORY_COLORS[rec.category] || 'badge-blue';

  return (
    <div
      className="card fade-up"
      style={{
        animationDelay: `${rank * 80}ms`,
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* Rank badge */}
      <div style={{
        position: 'absolute', top: 16, right: 16,
        width: 32, height: 32, borderRadius: '50%',
        background: rank === 1 ? 'var(--grad-accent)' : 'rgba(255,255,255,0.06)',
        display: 'grid', placeItems: 'center',
        fontSize: '0.8rem', fontWeight: 700,
        color: rank === 1 ? '#fff' : 'var(--text-2)',
        fontFamily: 'var(--font-mono)',
      }}>
        #{rank}
      </div>

      {/* Icon + title */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 12 }}>
        <span style={{ fontSize: '2rem', lineHeight: 1 }}>{rec.icon || '💼'}</span>
        <div>
          <h3 style={{ fontSize: '1.05rem', marginBottom: 4 }}>{rec.career}</h3>
          <span className={`badge ${color}`}>{rec.category || 'Career'}</span>
        </div>
      </div>

      {/* Match score */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>
            MATCH SCORE
          </span>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent)' }}>
            {pct}%
          </span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Metadata row */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {rec.avg_salary && (
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>
              AVG SALARY
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--accent-3)' }}>
              {rec.avg_salary}
            </div>
          </div>
        )}
        {rec.growth && (
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>
              JOB GROWTH
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--accent-4)' }}>
              {rec.growth}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
