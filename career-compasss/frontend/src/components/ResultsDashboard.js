import React, { useEffect, useRef } from 'react';
import './ResultsDashboard.css';

/* ── colour palette per category ─────────────────────────────── */
const CAT_COLOR = {
  Technology:  '#378ADD',
  Science:     '#1D9E75',
  Business:    '#7F77DD',
  Finance:     '#7F77DD',
  Engineering: '#7F77DD',
  Design:      '#D85A30',
  Marketing:   '#D85A30',
  Media:       '#D85A30',
  Healthcare:  '#1D9E75',
  Education:   '#888780',
  Law:         '#888780',
  Social:      '#888780',
};

function color(cat) {
  return CAT_COLOR[cat] || '#378ADD';
}

/* ── SVG radial ring ─────────────────────────────────────────── */
function Ring({ pct, size = 130, stroke = 12, ringColor = '#378ADD', children }) {
  const r   = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);

  return (
    <div className="ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r}
          fill="none" stroke="var(--rd-track)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r}
          fill="none" stroke={ringColor} strokeWidth={stroke}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.16,1,.3,1)' }}
        />
      </svg>
      <div className="ring-inner">{children}</div>
    </div>
  );
}

/* ── Radar chart (pure SVG, no library) ─────────────────────── */
function RadarChart({ traits }) {
  const size   = 200;
  const cx     = size / 2;
  const cy     = size / 2;
  const maxR   = 78;
  const n      = traits.length;
  const angleStep = (2 * Math.PI) / n;

  const polar = (i, r) => {
    const a = i * angleStep - Math.PI / 2;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  };

  const gridLevels = [0.25, 0.5, 0.75, 1];
  const gridPolys  = gridLevels.map(f =>
    Array.from({ length: n }, (_, i) => polar(i, maxR * f))
      .map(p => `${p.x},${p.y}`).join(' ')
  );

  const dataPoints = traits.map((t, i) => polar(i, maxR * (t.value / 100)));
  const dataPath   = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <svg viewBox={`0 0 ${size} ${size}`} style={{ width: '100%', maxWidth: 200 }}>
      {/* Grid */}
      {gridPolys.map((pts, i) => (
        <polygon key={i} points={pts} fill="none"
          stroke="var(--rd-grid)" strokeWidth="0.5" />
      ))}
      {/* Spokes */}
      {Array.from({ length: n }, (_, i) => {
        const p = polar(i, maxR);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y}
          stroke="var(--rd-grid)" strokeWidth="0.5" />;
      })}
      {/* Data polygon */}
      <polygon points={dataPath}
        fill="rgba(55,138,221,0.15)"
        stroke="#378ADD" strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Data dots */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3.5}
          fill="#378ADD" />
      ))}
      {/* Labels */}
      {traits.map((t, i) => {
        const labelR = maxR + 16;
        const p = polar(i, labelR);
        return (
          <text key={i} x={p.x} y={p.y}
            textAnchor="middle" dominantBaseline="middle"
            fontSize="10" fill="var(--rd-text-secondary)">
            {t.label}
          </text>
        );
      })}
    </svg>
  );
}

/* ── Main component ──────────────────────────────────────────── */
export default function ResultsDashboard({ recommendations = [] }) {
  if (!recommendations.length) return null;

  const top     = recommendations[0];
  const topColor = color(top.category);

  /* Personality traits derived from top career categories */
  const catScores = {};
  recommendations.slice(0, 8).forEach(r => {
    catScores[r.category] = (catScores[r.category] || 0) + r.score;
  });

  const traits = [
    { label: 'Analytical',    value: Math.min(100, Math.round(((catScores['Technology'] || 0) + (catScores['Finance'] || 0)) * 40)) },
    { label: 'Technical',     value: Math.min(100, Math.round(((catScores['Technology'] || 0) + (catScores['Engineering'] || 0)) * 40)) },
    { label: 'Creative',      value: Math.min(100, Math.round(((catScores['Design'] || 0) + (catScores['Media'] || 0)) * 55)) },
    { label: 'Leadership',    value: Math.min(100, Math.round(((catScores['Business'] || 0)) * 55)) },
    { label: 'Empathy',       value: Math.min(100, Math.round(((catScores['Social'] || 0) + (catScores['Healthcare'] || 0)) * 55)) },
    { label: 'Research',      value: Math.min(100, Math.round(((catScores['Science'] || 0)) * 55)) },
  ].map(t => ({ ...t, value: Math.max(t.value, 8) }));

  /* Category aggregates for bar chart */
  const catAgg = {};
  recommendations.forEach(r => {
    if (!catAgg[r.category]) catAgg[r.category] = 0;
    catAgg[r.category] = Math.max(catAgg[r.category], Math.round(r.score * 100));
  });
  const catList = Object.entries(catAgg)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <div className="rd-root">

      {/* ── TOP MATCH HERO ── */}
      <p className="rd-section-label">top career match</p>
      <div className="rd-hero">
        <Ring pct={Math.round(top.score * 100)} size={130} stroke={12} ringColor={topColor}>
          <span className="rd-hero-pct">{Math.round(top.score * 100)}%</span>
          <span className="rd-hero-sub">match</span>
        </Ring>
        <div className="rd-hero-text">
          <div className="rd-hero-icon">{top.icon || '💼'}</div>
          <h2 className="rd-hero-title">{top.career}</h2>
          <p className="rd-hero-tagline">{top.category} · Avg {top.avg_salary || '—'}/yr</p>
          <div className="rd-chips">
            {top.avg_salary && <span className="rd-chip rd-chip-green">{top.avg_salary} avg salary</span>}
            {top.growth     && <span className="rd-chip rd-chip-blue">{top.growth} growth</span>}
            <span className="rd-chip rd-chip-amber">#{top.rank} match</span>
          </div>
        </div>
      </div>

      {/* ── TOP 4 RINGS ── */}
      <p className="rd-section-label" style={{ marginTop: '1.5rem' }}>your top matches</p>
      <div className="rd-rings-grid">
        {recommendations.slice(0, 4).map((rec, i) => {
          const c = color(rec.category);
          const pct = Math.round(rec.score * 100);
          return (
            <div className="rd-ring-card" key={rec.career}>
              <Ring pct={pct} size={72} stroke={7} ringColor={c}>
                <span className="rd-small-pct">{pct}%</span>
              </Ring>
              <div className="rd-ring-name">{rec.icon} {rec.career}</div>
              <div className="rd-ring-cat">{rec.category}</div>
            </div>
          );
        })}
      </div>

      {/* ── FULL COMPATIBILITY BARS ── */}
      <div className="rd-bars-section">
        <p className="rd-section-label">full compatibility breakdown</p>
        <div className="rd-legend">
          {[...new Set(recommendations.map(r => r.category))].slice(0, 5).map(cat => (
            <span key={cat} className="rd-legend-item">
              <span className="rd-legend-dot" style={{ background: color(cat) }} />
              {cat}
            </span>
          ))}
        </div>
        {recommendations.map(rec => {
          const pct = Math.round(rec.score * 100);
          return (
            <div className="rd-bar-row" key={rec.career}>
              <span className="rd-bar-name">{rec.icon} {rec.career}</span>
              <div className="rd-bar-track">
                <div className="rd-bar-fill"
                  style={{ width: `${pct}%`, background: color(rec.category) }} />
              </div>
              <span className="rd-bar-pct">{pct}%</span>
            </div>
          );
        })}
      </div>

      {/* ── BOTTOM ROW: category bars + radar ── */}
      <div className="rd-bottom-grid">
        {/* Category chart */}
        <div className="rd-chart-card">
          <p className="rd-chart-title">match by category</p>
          <div className="rd-cat-bars">
            {catList.map(([cat, pct]) => (
              <div key={cat} className="rd-cat-row">
                <span className="rd-cat-label">{cat}</span>
                <div className="rd-cat-track">
                  <div className="rd-cat-fill" style={{ width: `${pct}%`, background: color(cat) }} />
                </div>
                <span className="rd-cat-pct">{pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Radar */}
        <div className="rd-chart-card">
          <p className="rd-chart-title">your personality profile</p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <RadarChart traits={traits} />
          </div>
        </div>
      </div>

    </div>
  );
}
