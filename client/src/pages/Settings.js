import React, { useEffect, useState } from 'react';
import { getOAuthStatus, healthCheck } from '../services/api';

const card = {
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '20px',
  background: 'white',
  marginBottom: '16px',
};

export default function Settings() {
  const [oauth, setOauth] = useState(null);
  const [health, setHealth] = useState(null);
  const [clinicName, setClinicName] = useState(localStorage.getItem('clinicName') || '');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    healthCheck().then(r => setHealth(r.data)).catch(() => {});
    getOAuthStatus().then(r => setOauth(r.data)).catch(() => {});
  }, []);

  const handleSaveClinic = (e) => {
    e.preventDefault();
    localStorage.setItem('clinicName', clinicName);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleMockConnect = async () => {
    try {
      const res = await fetch('/api/oauth/callback?code=mock_auth_code');
      const data = await res.json();
      if (data.locationId) {
        localStorage.setItem('locationId', data.locationId);
        window.location.reload();
      }
    } catch (err) {
      console.error('Mock connect failed:', err);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>Settings</h1>

      {/* Connection Status */}
      <div style={card}>
        <h2 style={{ fontSize: '18px', margin: '0 0 12px' }}>Go High Level Connection</h2>
        {health && (
          <p style={{ fontSize: '14px', color: '#64748b' }}>
            Server Mode: <strong>{health.mockMode ? 'Mock (Development)' : 'Live'}</strong>
          </p>
        )}
        {oauth?.connected ? (
          <div>
            <p style={{ color: '#16a34a' }}>Connected</p>
            <p style={{ fontSize: '14px' }}>Locations: {oauth.locations?.join(', ')}</p>
          </div>
        ) : (
          <div>
            <p style={{ color: '#dc2626', marginBottom: '12px' }}>Not connected</p>
            {health?.mockMode ? (
              <button onClick={handleMockConnect} style={{
                padding: '8px 16px', background: '#7c3aed', color: 'white',
                border: 'none', borderRadius: '6px', cursor: 'pointer',
              }}>Connect (Mock Mode)</button>
            ) : (
              <a href="/api/oauth/authorize" style={{
                display: 'inline-block', padding: '8px 16px', background: '#7c3aed',
                color: 'white', borderRadius: '6px', textDecoration: 'none',
              }}>Connect GHL Account</a>
            )}
          </div>
        )}
      </div>

      {/* Clinic Settings */}
      <div style={card}>
        <h2 style={{ fontSize: '18px', margin: '0 0 12px' }}>Clinic Information</h2>
        <form onSubmit={handleSaveClinic}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>
            Clinic Name
          </label>
          <input
            type="text"
            value={clinicName}
            onChange={e => setClinicName(e.target.value)}
            placeholder="e.g., Sunrise Fertility Center"
            style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', width: '100%', maxWidth: '400px' }}
          />
          <br />
          <button type="submit" style={{
            marginTop: '12px', padding: '8px 16px', background: '#7c3aed',
            color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer',
          }}>Save</button>
          {saved && <span style={{ marginLeft: '12px', color: '#16a34a' }}>Saved!</span>}
        </form>
      </div>

      {/* Vapi Settings */}
      <div style={card}>
        <h2 style={{ fontSize: '18px', margin: '0 0 12px' }}>Vapi Voice AI</h2>
        <p style={{ fontSize: '14px', color: '#64748b' }}>
          Configure your AI phone assistant for patient calls. Set your VAPI_API_KEY in the .env file to enable.
        </p>
        <div style={{ marginTop: '12px', padding: '12px', background: '#f8fafc', borderRadius: '6px', fontSize: '14px' }}>
          <p><strong>Features:</strong></p>
          <ul style={{ margin: '4px 0', paddingLeft: '20px', color: '#475569' }}>
            <li>Inbound call handling with fertility-specific knowledge</li>
            <li>Appointment scheduling via voice</li>
            <li>Outbound appointment reminders</li>
            <li>Call transcripts synced to patient records</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
