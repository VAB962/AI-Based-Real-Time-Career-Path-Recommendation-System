import React, { useEffect, useRef, useState } from 'react';
import './GraphicalResults.css';

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
  Education:   '#378ADD',
  Law:         '#BA7517',
  Social:      '#1D9E75',
};

function getColor(category) {
  return CAT_COLOR[category] || '#888780';
}

/* ── Animated radial ring (pure SVG) ─────────────────────── */
function Ring({ pct, color, size = 80, stroke = 8 }) {
  const r    = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(pct, 100) / 100);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      style={{ transform: 'rotate(-90deg)', display: 'block' }}>
      <circle cx={size/2} cy={size/2} r={r}
        fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r}
        fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${circ.toFixed(1)}`}
        strokeDashoffset={`${offset.toFixed(1)}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(.16,1,.3,1)' }}
      />
    </svg>
  );
}

/* ── Donut chart (pure SVG) ──────────────────────────────── */
function DonutChart({ careers }) {
  const total = careers.reduce((s, c) => s + c.pct, 0) || 1;
  const cx = 60, cy = 60, r = 46, ir = 28;
  let angle = -Math.PI / 2;
  const slices = careers.map(c => {
    const sweep = (c.pct / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(angle);
    const y1 = cy + r * Math.sin(angle);
    const x2 = cx + r * Math.cos(angle + sweep);
    const y2 = cy + r * Math.sin(angle + sweep);
    const ix1 = cx + ir * Math.cos(angle);
    const iy1 = cy + ir * Math.sin(angle);
    const ix2 = cx + ir * Math.cos(angle + sweep);
    const iy2 = cy + ir * Math.sin(angle + sweep);
    const lg = sweep > Math.PI ? 1 : 0;
    const d = `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${lg} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} L ${ix2.toFixed(2)} ${iy2.toFixed(2)} A ${ir} ${ir} 0 ${lg} 0 ${ix1.toFixed(2)} ${iy1.toFixed(2)} Z`;
    angle += sweep;
    return { d, color: getColor(c.category) };
  });

  return (
    <svg width="120" height="120" viewBox="0 0 120 120">
      {slices.map((s, i) => (
        <path key={i} d={s.d} fill={s.color} stroke="rgba(8,12,20,0.8)" strokeWidth="2" />
      ))}
      <circle cx={cx} cy={cy} r={ir - 4} fill="var(--bg-1)" />
    </svg>
  );
}

/* ── Radar (pure SVG) ────────────────────────────────────── */
function RadarChart({ traits }) {
  const size = 180, cx = 90, cy = 90, maxR = 72;
  const n = traits.length;
  const step = (2 * Math.PI) / n;
  const pt = (i, r) => ({
    x: cx + r * Math.cos(i * step - Math.PI / 2),
    y: cy + r * Math.sin(i * step - Math.PI / 2),
  });

  const gridLevels = [0.25, 0.5, 0.75, 1];
  const dataPoints = traits.map((t, i) => pt(i, maxR * (t.value / 100)));
  const poly = dataPoints.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {gridLevels.map((f, li) => {
        const pts = Array.from({ length: n }, (_, i) => {
          const p = pt(i, maxR * f);
          return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
        }).join(' ');
        return <polygon key={li} points={pts} fill="none"
          stroke="rgba(255,255,255,0.07)" strokeWidth="0.5" />;
      })}
      {Array.from({ length: n }, (_, i) => {
        const p = pt(i, maxR);
        return <line key={i} x1={cx} y1={cy} x2={p.x.toFixed(1)} y2={p.y.toFixed(1)}
          stroke="rgba(255,255,255,0.07)" strokeWidth="0.5" />;
      })}
      <polygon points={poly} fill="rgba(56,138,221,0.18)"
        stroke="#378ADD" strokeWidth="2" strokeLinejoin="round" />
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r="3.5" fill="#378ADD" />
      ))}
      {traits.map((t, i) => {
        const p = pt(i, maxR + 14);
        return (
          <text key={i} x={p.x.toFixed(1)} y={p.y.toFixed(1)}
            textAnchor="middle" dominantBaseline="middle"
            fontSize="9.5" fill="rgba(168,184,216,0.9)">
            {t.label}
          </text>
        );
      })}
    </svg>
  );
}

/* ── Main component ──────────────────────────────────────── */
export default function GraphicalResults({ recommendations = [], heroTitle = null, heroCareer = null }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const barsRef = useRef(null);

  useEffect(() => {
    setActiveIdx(0);
  }, [recommendations]);

  if (!recommendations.length) return null;

  const top5 = recommendations.slice(0, 5);
  const all  = recommendations.slice(0, 8);
  const top  = recommendations[0];

  /* personality traits from category scores */
  const catScore = {};
  all.forEach(r => {
    catScore[r.category] = Math.max(catScore[r.category] || 0, r.pct || Math.round(r.score * 100));
  });

  const traits = [
    { label: 'Analytical',  value: Math.min(100, Math.max(10, Math.round(((catScore['Technology']||0) + (catScore['Finance']||0)) / 2))) },
    { label: 'Technical',   value: Math.min(100, Math.max(10, Math.round(((catScore['Technology']||0) + (catScore['Engineering']||0)) / 2))) },
    { label: 'Creative',    value: Math.min(100, Math.max(10, Math.round(((catScore['Design']||0) + (catScore['Media']||0)) / 2))) },
    { label: 'Leadership',  value: Math.min(100, Math.max(10, catScore['Business']||0)) },
    { label: 'Empathy',     value: Math.min(100, Math.max(10, Math.round(((catScore['Social']||0) + (catScore['Healthcare']||0)) / 2))) },
    { label: 'Research',    value: Math.min(100, Math.max(10, catScore['Science']||0)) },
  ];

  /* category aggregates for donut */
  const catAgg = {};
  all.forEach(r => {
    const pct = r.pct ?? Math.round((r.score || 0) * 100);
    if (!catAgg[r.category] || catAgg[r.category] < pct) catAgg[r.category] = pct;
  });
  const catList = Object.entries(catAgg).sort((a,b)=>b[1]-a[1]).slice(0,5)
    .map(([cat, pct]) => ({ category: cat, pct }));

  /* normalise pct field */
  const norm = (r) => r.pct ?? Math.round((r.score || 0) * 100);

  return (
    <div className="gr-root">

      {/* ── HERO ── */}
      <div className="gr-hero">
        <p className="gr-hero-eyebrow">Your Quiz Results Are In 🎉</p>
        <h1 className="gr-hero-title">
          {heroTitle || `You're Built for `}
          <span className="gr-hero-accent">
            {heroCareer || top.career}
          </span>
        </h1>
        <p className="gr-hero-sub">
          Based on your answers — here are your top career matches and graphical scores
        </p>
      </div>

      {/* ── TOP 5 RING CARDS ── */}
      <p className="gr-section-label">Top 5 Career Matches</p>
      <div className="gr-cards">
        {top5.map((rec, i) => {
          const pct   = norm(rec);
          const color = getColor(rec.category);
          return (
            <div
              key={rec.career}
              className={`gr-card ${activeIdx === i ? 'gr-card-active' : ''}`}
              onClick={() => setActiveIdx(i)}
            >
              <span className="gr-rank">#{i + 1}</span>

              {/* Ring */}
              <div className="gr-ring-wrap">
                <Ring pct={pct} color={color} size={84} stroke={8} />
                <div className="gr-ring-label">
                  <span className="gr-ring-pct">{pct}%</span>
                  <span className="gr-ring-word">match</span>
                </div>
              </div>

              {/* Icon + name */}
              <div className="gr-card-icon">{rec.icon || '💼'}</div>
              <div className="gr-card-name">{rec.career}</div>

              {/* Meta */}
              <div className="gr-card-meta">
                {rec.avg_salary && (
                  <span className="gr-card-salary">{rec.avg_salary}</span>
                )}
                {rec.growth && (
                  <span className="gr-card-growth">↑{rec.growth} growth</span>
                )}
              </div>

              {/* Bottom accent bar */}
              <div className="gr-card-bar" style={{ background: color }} />
            </div>
          );
        })}
      </div>

      {/* ── FULL HORIZONTAL BAR CHART ── */}
      <div className="gr-bars-section">
        <p className="gr-section-label">Full Compatibility Breakdown</p>
        <div className="gr-bars" ref={barsRef}>
          {all.map((rec, i) => {
            const pct   = norm(rec);
            const color = getColor(rec.category);
            return (
              <div key={rec.career} className="gr-bar-row"
                style={{ animationDelay: `${i * 60}ms` }}>
                <span className="gr-bar-label">
                  <span style={{ fontSize: 14 }}>{rec.icon || '💼'}</span>
                  {rec.career}
                </span>
                <div className="gr-bar-track">
                  <div className="gr-bar-fill"
                    style={{ width: `${pct}%`, background: color }} />
                </div>
                <span className="gr-bar-pct">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── BOTTOM ROW ── */}
      <div className="gr-bottom">

        {/* Donut + legend */}
        <div className="gr-panel">
          <p className="gr-panel-title">Match Distribution</p>
          <div className="gr-donut-row">
            <DonutChart careers={catList} />
            <div className="gr-donut-legend">
              {catList.map(c => (
                <div key={c.category} className="gr-legend-item">
                  <span className="gr-legend-dot"
                    style={{ background: getColor(c.category) }} />
                  <span className="gr-legend-name">{c.category}</span>
                  <span className="gr-legend-pct">{c.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Radar */}
        <div className="gr-panel">
          <p className="gr-panel-title">Your Personality Profile</p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <RadarChart traits={traits} />
          </div>
        </div>

        {/* Salary comparison */}
        <div className="gr-panel">
          <p className="gr-panel-title">Salary Comparison</p>
          <div className="gr-salary-list">
            {top5.map((rec, i) => {
              const raw = rec.avg_salary
                ? parseInt(rec.avg_salary.replace(/\D/g, ''), 10)
                : 0;
              const max = 160000;
              const wpct = Math.round((raw / max) * 100);
              return (
                <div key={rec.career} className="gr-salary-row">
                  <span className="gr-salary-name">
                    {rec.icon} #{i+1}
                  </span>
                  <div className="gr-salary-track">
                    <div className="gr-salary-fill"
                      style={{ width: `${wpct}%`, background: getColor(rec.category) }} />
                  </div>
                  <span className="gr-salary-val">
                    {rec.avg_salary || '—'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
