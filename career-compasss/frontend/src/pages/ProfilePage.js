import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import TagSelector from '../components/TagSelector';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();

  const [profile, setProfile] = useState(user?.profile || {});
  const [options, setOptions] = useState({ skills: [], interests: [], education_levels: [] });
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState('');
  const [error,   setError]   = useState('');

  useEffect(() => {
    api.get('/profile/options').then(r => setOptions(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setProfile(user?.profile || {});
  }, [user]);

  const set = (key, val) => setProfile(p => ({ ...p, [key]: val }));

  const save = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await api.put('/profile/', profile);
      await refreshUser();
      setSuccess('Profile saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-layout">
      <div className="container">
        <div className="profile-header fade-up">
          <div className="profile-avatar-big">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1>{profile.full_name || user?.username}</h1>
            <p style={{ color: 'var(--text-2)', fontSize: '0.9rem' }}>{user?.email}</p>
          </div>
        </div>

        {error   && <div className="alert alert-error"   style={{ marginBottom: 20 }}>{error}</div>}
        {success && <div className="alert alert-success" style={{ marginBottom: 20 }}>{success}</div>}

        <div className="profile-grid">
          {/* ── Basic info ── */}
          <section className="card fade-up">
            <h3 style={{ marginBottom: 20 }}>Basic Information</h3>
            <div className="form-2col">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" value={profile.full_name || ''}
                  onChange={e => set('full_name', e.target.value)} placeholder="Jane Doe" />
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input className="form-input" value={profile.location || ''}
                  onChange={e => set('location', e.target.value)} placeholder="City, Country" />
              </div>
              <div className="form-group">
                <label className="form-label">Education Level</label>
                <select className="form-select" value={profile.education || ''}
                  onChange={e => set('education', e.target.value)}>
                  <option value="">Select…</option>
                  {options.education_levels.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Field of Study</label>
                <input className="form-input" value={profile.field_of_study || ''}
                  onChange={e => set('field_of_study', e.target.value)} placeholder="Computer Science" />
              </div>
              <div className="form-group">
                <label className="form-label">Years of Experience</label>
                <input className="form-input" type="number" min={0} max={40}
                  value={profile.years_of_experience ?? ''}
                  onChange={e => set('years_of_experience', parseInt(e.target.value) || 0)} />
              </div>
            </div>
            <div className="form-group" style={{ marginTop: 12 }}>
              <label className="form-label">Bio</label>
              <textarea className="form-textarea" value={profile.bio || ''}
                onChange={e => set('bio', e.target.value)}
                placeholder="Tell us a bit about yourself…" />
            </div>
          </section>

          {/* ── Skills ── */}
          <section className="card fade-up" style={{ animationDelay: '80ms' }}>
            <h3 style={{ marginBottom: 6 }}>Skills</h3>
            <p style={{ color: 'var(--text-2)', fontSize: '0.85rem', marginBottom: 14 }}>
              Select all skills you have ({(profile.skills || []).length} selected)
            </p>
            <TagSelector
              options={options.skills}
              selected={profile.skills || []}
              onChange={v => set('skills', v)}
            />
          </section>

          {/* ── Interests ── */}
          <section className="card fade-up" style={{ animationDelay: '160ms' }}>
            <h3 style={{ marginBottom: 6 }}>Interests</h3>
            <p style={{ color: 'var(--text-2)', fontSize: '0.85rem', marginBottom: 14 }}>
              What fields excite you? ({(profile.interests || []).length} selected)
            </p>
            <TagSelector
              options={options.interests}
              selected={profile.interests || []}
              onChange={v => set('interests', v)}
              searchable={false}
            />
          </section>
        </div>

        {/* Save button */}
        <div style={{ marginTop: 28, display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={save} disabled={saving}
            style={{ padding: '12px 32px', fontSize: '1rem' }}>
            {saving ? 'Saving…' : 'Save Profile →'}
          </button>
        </div>
      </div>
    </div>
  );
}
