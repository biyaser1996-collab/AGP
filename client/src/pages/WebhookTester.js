import React, { useState } from 'react';
import { fireTestWebhook } from '../services/api';

const events = [
  { type: 'ContactCreate', description: 'New patient contact created' },
  { type: 'AppointmentCreate', description: 'New appointment booked' },
  { type: 'OpportunityStageUpdate', description: 'Patient moved to next treatment stage' },
  { type: 'ContactTagUpdate', description: 'Patient tags updated' },
];

export default function WebhookTester() {
  const [results, setResults] = useState([]);

  const fireWebhook = async (eventType) => {
    try {
      const { data } = await fireTestWebhook(eventType);
      setResults(prev => [{
        time: new Date().toLocaleTimeString(),
        type: eventType,
        success: true,
        data: data.event,
      }, ...prev]);
    } catch (err) {
      setResults(prev => [{
        time: new Date().toLocaleTimeString(),
        type: eventType,
        success: false,
        error: err.response?.data?.error || err.message,
      }, ...prev]);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>Webhook Tester</h1>
      <p style={{ color: '#64748b', marginBottom: '16px', fontSize: '14px' }}>
        Fire mock GHL webhook events to test your workflow automations.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {events.map(e => (
          <div key={e.type} style={{
            border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', background: 'white',
          }}>
            <h3 style={{ margin: '0 0 4px', fontSize: '16px' }}>{e.type}</h3>
            <p style={{ margin: '0 0 12px', fontSize: '14px', color: '#64748b' }}>{e.description}</p>
            <button onClick={() => fireWebhook(e.type)} style={{
              padding: '6px 14px', background: '#7c3aed', color: 'white',
              border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px',
            }}>Fire Event</button>
          </div>
        ))}
      </div>

      {results.length > 0 && (
        <div>
          <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>Event Log</h2>
          <div style={{ fontFamily: 'monospace', fontSize: '13px' }}>
            {results.map((r, i) => (
              <div key={i} style={{
                padding: '8px 12px', marginBottom: '4px', borderRadius: '4px',
                background: r.success ? '#f0fdf4' : '#fef2f2',
                borderLeft: `3px solid ${r.success ? '#16a34a' : '#dc2626'}`,
              }}>
                <span style={{ color: '#64748b' }}>{r.time}</span>{' '}
                <strong>{r.type}</strong>{' '}
                {r.success ? 'OK' : `ERROR: ${r.error}`}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
