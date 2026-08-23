import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';

// Route pages
import ModulesDashboard from './components/ModulesDashboard';
import WorkspacePage    from './components/WorkspacePage';
import PracticePage     from './components/PracticePage';
import EmergencyPage    from './components/EmergencyPage';

// Legacy screens (persona/auth flow)
import Landing          from './components/Landing';
import Auth             from './components/Auth';
import EmailAuth        from './components/EmailAuth';
import FaceAuth         from './components/FaceAuth';
import VoiceAuth        from './components/VoiceAuth';
import PersonaSelection from './components/PersonaSelection';
import Dashboard        from './components/Dashboard';
import DeafDumbGridModule   from './components/DeafDumbGridModule';
import AutismSupportModule  from './components/AutismSupportModule';
import PeerConnectModule    from './components/PeerConnectModule';

import { getStoredItem, STORAGE_KEYS } from './utils/storage';

// ─── Global Top Navigation ──────────────────────────────────────────────────
function GlobalNav({ user, onAccount }) {
  return (
    <nav style={{
      background: 'rgba(5,7,10,0.97)',
      borderBottom: '1px solid rgba(0,242,254,0.18)',
      backdropFilter: 'blur(20px)',
      position: 'sticky', top: 0, zIndex: 200,
      padding: '8px 20px',
      display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
    }}>
      {/* Brand */}
      <NavLink to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 26, height: 26, borderRadius: '50%',
          background: 'linear-gradient(135deg,#00f2fe,#9d50bb)',
          boxShadow: '0 0 10px #00f2fe',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13,
        }}>⚡</div>
        <span style={{ fontWeight: 900, fontSize: 16, letterSpacing: '-0.02em', color: '#fff' }}>
          Echo<span style={{ color: '#00f2fe' }}>Sign</span>
        </span>
      </NavLink>

      {/* Primary route links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', marginLeft: 8 }}>
        {[
          { to: '/home',      label: '🏠 Home' },
          { to: '/',          label: '📑 Modules Dashboard', exact: true },
          { to: '/workspace', label: '💻 Live Workspace'  },
          { to: '/practice',  label: '📝 Practice Mode'   },
          { to: '/emergency', label: '🚨 Emergency'        },
        ].map(({ to, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            style={({ isActive }) => ({
              padding: '5px 13px', borderRadius: 20, fontSize: 12, fontWeight: 700,
              cursor: 'pointer', textDecoration: 'none',
              border: isActive ? '1px solid #00f2fe' : '1px solid transparent',
              background: isActive ? 'rgba(0,242,254,0.15)' : 'transparent',
              color: isActive ? '#00f2fe' : '#8a99ad',
              transition: 'all 0.2s',
            })}
          >{label}</NavLink>
        ))}

        {/* Extra legacy screens */}
        <span style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />
        {[
          { to: '/deaf-grid',    label: '🤟 Deaf Grid'    },
          { to: '/autism-grid',  label: '🧩 Autism AAC'  },
          { to: '/peer-connect', label: '👥 Peer Connect' },
        ].map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              padding: '5px 13px', borderRadius: 20, fontSize: 12, fontWeight: 700,
              cursor: 'pointer', textDecoration: 'none',
              border: isActive ? '1px solid #a78bfa' : '1px solid transparent',
              background: isActive ? 'rgba(167,139,250,0.15)' : 'transparent',
              color: isActive ? '#a78bfa' : '#8a99ad',
              transition: 'all 0.2s',
            })}
          >{label}</NavLink>
        ))}
      </div>

      {/* Account button */}
      <button
        onClick={onAccount}
        style={{
          marginLeft: 'auto',
          background: 'linear-gradient(135deg,#00f2fe,#9d50bb)',
          color: '#000', fontWeight: 800, border: 'none',
          borderRadius: 16, padding: '5px 14px', fontSize: 12, cursor: 'pointer',
        }}
      >{user ? 'Account' : 'Sign Up'}</button>
    </nav>
  );
}

// ─── App Shell ──────────────────────────────────────────────────────────────
function AppShell() {
  const [user, setUser] = useState(null);
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [overlay, setOverlay] = useState(null); // null | 'auth_select' | 'email_auth' | ...
  const [authMode, setAuthMode] = useState('signup');
  const location = useLocation();

  useEffect(() => {
    const savedUser = getStoredItem(STORAGE_KEYS.USER);
    const savedPersonaId = getStoredItem(STORAGE_KEYS.PERSONA);
    if (savedUser) {
      setUser(savedUser);
      if (savedPersonaId) {
        setSelectedPersona({ id: savedPersonaId, title: savedPersonaId.replace('_', ' ') });
      }
    }
  }, []);

  // Demo user helper
  const ensureDemo = () => {
    if (!user) setUser({ id: 'demo_user', name: 'Rachana Reddy', email: 'demo@echosign.org' });
    if (!selectedPersona) setSelectedPersona({ id: 'deaf_mute', title: 'Deaf / Non-Speaking', icon: '🤟' });
  };

  const handleAccount = () => {
    if (user) setOverlay('account');
    else { setAuthMode('signup'); setOverlay('auth_select'); }
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setOverlay('persona_select');
  };

  // Close overlay if route changes
  useEffect(() => {
    setOverlay(null);
    ensureDemo();
  }, [location.pathname]);

  return (
    <div style={{ minHeight: '100vh', background: '#07090e', color: '#fff', fontFamily: "'Segoe UI',-apple-system,sans-serif" }}>
      <GlobalNav user={user} onAccount={handleAccount} />

      {/* ── Main route views ── */}
      {!overlay && (
        <Routes>
          {/* Core routes */}
          <Route path="/"          element={<ModulesDashboard />} />
          <Route path="/home"      element={<Landing onGetStarted={() => {}} onLogin={() => setOverlay('auth_select')} onSeeHowItWorks={() => {}} />} />
          <Route path="/modules"   element={<ModulesDashboard />} />
          <Route path="/workspace" element={<WorkspacePage />} />
          <Route path="/practice"  element={<PracticePage />} />
          <Route path="/emergency" element={<EmergencyPage />} />

          {/* Legacy/extended screens */}
          <Route path="/deaf-grid"    element={<div style={{ padding: 28, maxWidth: 1300, margin: '0 auto' }}><DeafDumbGridModule /></div>} />
          <Route path="/autism-grid"  element={<div style={{ padding: 28, maxWidth: 1300, margin: '0 auto' }}><AutismSupportModule /></div>} />
          <Route path="/peer-connect" element={<div style={{ padding: 24, maxWidth: 1300, margin: '0 auto' }}><PeerConnectModule currentUser={user} /></div>} />
          <Route path="/dashboard"    element={<Dashboard user={user} persona={selectedPersona} onLogout={() => { setUser(null); setSelectedPersona(null); }} onChangePersona={() => setOverlay('persona_select')} />} />

          {/* Catch-all → Modules */}
          <Route path="*" element={<ModulesDashboard />} />
        </Routes>
      )}

      {/* ── Auth / Persona Overlays ── */}
      {overlay === 'auth_select' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' }}>
          <Auth mode={authMode} onSelectMethod={(m) => setOverlay(`${m}_auth`)} onBack={() => setOverlay(null)} />
        </div>
      )}
      {overlay === 'email_auth' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' }}>
          <EmailAuth mode={authMode} onComplete={handleAuthSuccess} onBack={() => setOverlay('auth_select')} />
        </div>
      )}
      {overlay === 'face_auth' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' }}>
          <FaceAuth onComplete={handleAuthSuccess} onBack={() => setOverlay('auth_select')} />
        </div>
      )}
      {overlay === 'voice_auth' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' }}>
          <VoiceAuth onComplete={handleAuthSuccess} onBack={() => setOverlay('auth_select')} />
        </div>
      )}
      {overlay === 'persona_select' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' }}>
          <PersonaSelection onSelectPersona={(p) => { setSelectedPersona(p); setOverlay(null); }} />
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
