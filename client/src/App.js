import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import Settings from './pages/Settings';
import WebhookTester from './pages/WebhookTester';

const navStyle = {
  display: 'flex',
  gap: '16px',
  padding: '16px 24px',
  borderBottom: '1px solid #e2e8f0',
  background: '#f8fafc',
  fontFamily: 'system-ui, sans-serif',
};

const linkStyle = { textDecoration: 'none', color: '#475569', fontWeight: 500 };
const activeStyle = { ...linkStyle, color: '#7c3aed', borderBottom: '2px solid #7c3aed' };

function App() {
  return (
    <BrowserRouter>
      <div style={{ fontFamily: 'system-ui, sans-serif' }}>
        <nav style={navStyle}>
          <strong style={{ color: '#7c3aed', marginRight: '24px' }}>Fertility CRM</strong>
          <NavLink to="/" style={({ isActive }) => isActive ? activeStyle : linkStyle}>Dashboard</NavLink>
          <NavLink to="/contacts" style={({ isActive }) => isActive ? activeStyle : linkStyle}>Contacts</NavLink>
          <NavLink to="/settings" style={({ isActive }) => isActive ? activeStyle : linkStyle}>Settings</NavLink>
          <NavLink to="/webhooks" style={({ isActive }) => isActive ? activeStyle : linkStyle}>Webhook Tester</NavLink>
        </nav>
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/webhooks" element={<WebhookTester />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
