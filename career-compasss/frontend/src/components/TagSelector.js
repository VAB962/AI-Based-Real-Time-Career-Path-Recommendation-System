import React, { useState } from 'react';

/**
 * TagSelector — multi-select pill cloud
 * Props:
 *   options      string[]
 *   selected     string[]
 *   onChange     (newSelected: string[]) => void
 *   max?         number   (max allowed selections)
 *   searchable?  boolean
 */
export default function TagSelector({ options = [], selected = [], onChange, max, searchable = true }) {
  const [query, setQuery] = useState('');

  const filtered = query
    ? options.filter(o => o.toLowerCase().includes(query.toLowerCase()))
    : options;

  const toggle = (tag) => {
    if (selected.includes(tag)) {
      onChange(selected.filter(s => s !== tag));
    } else {
      if (max && selected.length >= max) return;
      onChange([...selected, tag]);
    }
  };

  return (
    <div>
      {searchable && (
        <input
          className="form-input"
          placeholder="Search…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ marginBottom: 10 }}
        />
      )}
      <div className="tag-cloud">
        {filtered.map(tag => (
          <button
            key={tag}
            type="button"
            className={`tag-pill ${selected.includes(tag) ? 'selected' : ''}`}
            onClick={() => toggle(tag)}
            style={max && selected.length >= max && !selected.includes(tag)
              ? { opacity: 0.35, cursor: 'not-allowed' }
              : {}}
          >
            {selected.includes(tag) && <span>✓ </span>}
            {tag}
          </button>
        ))}
      </div>
      {max && (
        <p style={{ fontSize: '0.78rem', color: 'var(--text-2)', marginTop: 6 }}>
          {selected.length}/{max} selected
        </p>
      )}
    </div>
  );
}
