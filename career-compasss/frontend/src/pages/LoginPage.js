import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      {/* Left panel */}
      <div className="auth-hero">
        <div className="auth-hero-inner">
          <div className="hero-logo">⬡</div>
          <h1>CareerPath</h1>
          <p className="hero-sub">AI-powered career guidance </p>
          <div className="hero-features">
            {[
              ['◈', 'Personalised career predictions'],
              ['◉', 'Live job matching'],
              ['◎', 'Growth insights & salary data'],
            ].map(([icon, text]) => (
              <div className="hero-feature" key={text}>
                <span className="feature-icon">{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-panel">
        <div className="auth-box fade-up">
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ marginBottom: 4 }}>Welcome back</h2>
            <p style={{ color: 'var(--text-2)', fontSize: '0.9rem' }}>
              Sign in to your account
            </p>
          </div>

          {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                name="email"
                placeholder="Your email address"
                value={form.email}
                onChange={handle}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handle}
                required
              />
            </div>
            <button
              className="btn btn-primary"
              type="submit"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
            >
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-2)', fontSize: '0.88rem' }}>
            No account?{' '}
            <Link to="/register" style={{ fontWeight: 600 }}>Create one free</Link>
          </p>

          {/* Demo hint */}
          
        </div>
      </div>
    </div>
  );
}
