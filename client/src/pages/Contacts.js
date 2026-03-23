import React, { useEffect, useState } from 'react';
import { getContacts } from '../services/api';

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchContacts = async (query) => {
    setLoading(true);
    try {
      const { data } = await getContacts(query ? { query } : {});
      setContacts(data.contacts || []);
    } catch {
      setContacts([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchContacts(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchContacts(search);
  };

  return (
    <div>
      <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>Patient Contacts</h1>

      <form onSubmit={handleSearch} style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', flex: 1 }}
        />
        <button type="submit" style={{
          padding: '8px 16px', background: '#7c3aed', color: 'white',
          border: 'none', borderRadius: '6px', cursor: 'pointer',
        }}>Search</button>
      </form>

      {loading ? <p>Loading...</p> : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {contacts.map(c => (
            <div key={c.id} style={{
              border: '1px solid #e2e8f0', borderRadius: '8px',
              padding: '16px', background: 'white',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h3 style={{ margin: 0 }}>{c.firstName} {c.lastName}</h3>
                  <p style={{ margin: '4px 0', color: '#64748b', fontSize: '14px' }}>
                    {c.email} | {c.phone}
                  </p>
                </div>
                <span style={{
                  background: '#ede9fe', color: '#7c3aed',
                  padding: '4px 10px', borderRadius: '12px', fontSize: '12px',
                }}>
                  {c.customFields?.find(f => f.key === 'treatment_type')?.value || 'Unknown'}
                </span>
              </div>
              {c.tags && (
                <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {c.tags.map(tag => (
                    <span key={tag} style={{
                      background: '#f1f5f9', padding: '2px 8px',
                      borderRadius: '4px', fontSize: '12px', color: '#475569',
                    }}>{tag}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
          {contacts.length === 0 && <p style={{ color: '#64748b' }}>No contacts found.</p>}
        </div>
      )}
    </div>
  );
}
