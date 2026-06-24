import React from 'react';

export default function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
    }}>
      <div className="spinner" style={{ width: 48, height: 48 }} />
      <p style={{ color: 'var(--text-2)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
        Initializing CareerCompass…
      </p>
    </div>
  );
}
