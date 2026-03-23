import React, { useEffect, useState } from 'react';
import { getDashboard, getOAuthStatus, healthCheck } from '../services/api';

const card = {
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '20px',
  background: 'white',
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [oauth, setOauth] = useState(null);
  const [health, setHealth] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    healthCheck().then(r => setHealth(r.data)).catch(() => {});
    getOAuthStatus().then(r => setOauth(r.data)).catch(() => {});
    getDashboard()
      .then(r => setData(r.data.summary))
      .catch(err => setError(err.response?.data?.error || err.message));
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>Dashboard</h1>

      {health && (
        <p style={{ color: '#16a34a', fontSize: '14px', marginBottom: '16px' }}>
          Server connected {health.mockMode ? '(Mock Mode)' : '(Live)'}
        </p>
      )}

      {oauth && !oauth.connected && (
        <div style={{ ...card, background: '#fefce8', borderColor: '#facc15', marginBottom: '16px' }}>
          <strong>GHL Not Connected</strong>
          <p style={{ margin: '8px 0 0', fontSize: '14px' }}>
            <a href="/api/oauth/authorize">Connect your Go High Level account</a> to sync contacts, calendars, and pipelines.
          </p>
        </div>
      )}

      {error && (
        <div style={{ ...card, background: '#fef2f2', borderColor: '#f87171', marginBottom: '16px' }}>
          <p>{error}</p>
          <p style={{ fontSize: '14px' }}>
            In mock mode, first call <code>GET /api/oauth/callback?code=test</code> to create a mock session.
          </p>
        </div>
      )}

      {data && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '16px' }}>
          <div style={card}>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#7c3aed' }}>{data.totalContacts}</div>
            <div style={{ color: '#64748b' }}>Total Patients</div>
          </div>
          <div style={card}>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#7c3aed' }}>{data.calendars}</div>
            <div style={{ color: '#64748b' }}>Calendars</div>
          </div>
          <div style={card}>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#7c3aed' }}>{data.openOpportunities}</div>
            <div style={{ color: '#64748b' }}>Active Treatments</div>
          </div>
          <div style={card}>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#7c3aed' }}>
              ${data.totalPipelineValue?.toLocaleString()}
            </div>
            <div style={{ color: '#64748b' }}>Pipeline Value</div>
          </div>
        </div>
      )}

      {data?.recentContacts && (
        <div style={{ marginTop: '24px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>Recent Patients</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '8px' }}>Name</th>
                <th style={{ padding: '8px' }}>Email</th>
                <th style={{ padding: '8px' }}>Treatment</th>
                <th style={{ padding: '8px' }}>Stage</th>
              </tr>
            </thead>
            <tbody>
              {data.recentContacts.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '8px' }}>{c.firstName} {c.lastName}</td>
                  <td style={{ padding: '8px' }}>{c.email}</td>
                  <td style={{ padding: '8px' }}>
                    {c.customFields?.find(f => f.key === 'treatment_type')?.value || '-'}
                  </td>
                  <td style={{ padding: '8px' }}>
                    <span style={{
                      background: '#ede9fe',
                      color: '#7c3aed',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}>
                      {c.customFields?.find(f => f.key === 'cycle_stage')?.value?.replace(/_/g, ' ') || '-'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
