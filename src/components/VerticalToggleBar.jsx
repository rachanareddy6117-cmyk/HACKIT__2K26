import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const modules = [
  { path: '/home', label: 'Home', icon: '🏠' },
  { path: '/practice', label: 'Practice', icon: '📝' },
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/emergency', label: 'Emergency', icon: '🚨' },
  { path: '/deaf-grid', label: 'Deaf Grid', icon: '🤟' },
  { path: '/autism-grid', label: 'Autism AAC', icon: '🧩' },
  { path: '/peer-connect', label: 'Peer Connect', icon: '👥' },
];

export default function VerticalToggleBar() {
  const location = useLocation();
  return (
    <nav style={{
      position: 'fixed',
      left: 0,
      top: 0,
      bottom: 0,
      width: 80,
      background: 'rgba(5,7,10,0.95)',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: 20,
      gap: 14,
    }}>
      {modules.map(m => (
        <NavLink
          key={m.path}
          to={m.path}
          style={({ isActive }) => ({
            textDecoration: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            color: isActive ? '#00f2fe' : '#8a99ad',
            fontWeight: isActive ? 700 : 400,
            background: isActive ? 'rgba(0,242,254,0.15)' : 'transparent',
            padding: '8px 0',
            borderRadius: 12,
            width: '100%',
            transition: 'all 0.2s',
          })}
        >
          <span style={{ fontSize: 20 }}>{m.icon}</span>
          <span style={{ fontSize: 11 }}>{m.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
