import React, { useState, useEffect } from 'react';
import Landing from './components/Landing';
import Auth from './components/Auth';
import EmailAuth from './components/EmailAuth';
import FaceAuth from './components/FaceAuth';
import VoiceAuth from './components/VoiceAuth';
import PersonaSelection from './components/PersonaSelection';
import Dashboard from './components/Dashboard';
import ModulesView from './components/ModulesView';
import LiveWorkspaceView from './components/LiveWorkspaceView';
import { getStoredItem, STORAGE_KEYS } from './utils/storage';

export default function App() {
  // Screen state machine:
  // 'landing' -> 'auth_select' -> 'email_auth' | 'face_auth' | 'voice_auth' -> 'persona_select' -> 'dashboard' | 'modules_suite' | 'live_workspace'
  const [screen, setScreen] = useState('landing');
  const [authMode, setAuthMode] = useState('signup'); // 'login' | 'signup'
  const [user, setUser] = useState(null);
  const [selectedPersona, setSelectedPersona] = useState(null);

  // Restore session from localStorage on load if present
  useEffect(() => {
    const savedUser = getStoredItem(STORAGE_KEYS.USER);
    const savedPersonaId = getStoredItem(STORAGE_KEYS.PERSONA);

    if (savedUser) {
      setUser(savedUser);
      if (savedPersonaId) {
        setSelectedPersona({ id: savedPersonaId, title: savedPersonaId.replace('_', ' ') });
        setScreen('dashboard');
      } else {
        setScreen('persona_select');
      }
    }
  }, []);

  const handleStartAuth = (mode = 'signup') => {
    setAuthMode(mode);
    if (mode === 'login') {
      setScreen('login_page');
      return;
    }
    setScreen('auth_select');
  };

  const handleSelectAuthMethod = (method) => {
    if (method === 'email') setScreen('email_auth');
    if (method === 'face') setScreen('face_auth');
    if (method === 'voice') setScreen('voice_auth');
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setScreen('persona_select');
  };

  const handlePersonaSelected = (persona) => {
    setSelectedPersona(persona);
    setScreen('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedPersona(null);
    setScreen('landing');
  };

  const handleSeeHowItWorks = () => {
    setUser({ id: 'demo_user', name: 'Demo Accessibility Explorer', email: 'demo@echosign.org' });
    setSelectedPersona({ id: 'deaf_mute', title: 'Deaf / Non-Speaking', icon: '🤟' });
    setScreen('dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#07090e', color: '#ffffff', fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif" }}>
      {/* ── TOP GLOBAL MODE SWITCHER BAR (Direct Access to All 4 Views) ── */}
      <div style={{
        background: 'rgba(5, 7, 10, 0.95)',
        borderBottom: '1px solid rgba(0, 242, 254, 0.18)',
        backdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        padding: '8px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 10
      }}>
        {/* Brand */}
        <div
          onClick={() => setScreen('landing')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
        >
          <div style={{
            width: 26,
            height: 26,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #00f2fe, #9d50bb)',
            boxShadow: '0 0 10px #00f2fe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13
          }}>
            ⚡
          </div>
          <span style={{ fontWeight: 900, fontSize: 16, letterSpacing: '-0.02em', color: '#fff' }}>
            Echo<span style={{ color: '#00f2fe' }}>Sign</span>
          </span>
        </div>

        {/* 4 Primary Navigation Modes matching user request */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <button
            onClick={() => setScreen('landing')}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              border: screen === 'landing' ? '1px solid #00f2fe' : '1px solid transparent',
              background: screen === 'landing' ? 'rgba(0, 242, 254, 0.15)' : 'transparent',
              color: screen === 'landing' ? '#00f2fe' : '#8a99ad',
              transition: 'all 0.2s'
            }}
          >
            🏠 1. Home Page
          </button>

          <button
            onClick={() => {
              if (!user) setUser({ id: 'demo_user', name: 'Rachana Reddy', email: 'rachana@echosign.org' });
              if (!selectedPersona) setSelectedPersona({ id: 'deaf_mute', title: 'Deaf / Non-Speaking', icon: '🤟' });
              setScreen('modules_suite');
            }}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              border: screen === 'modules_suite' ? '1px solid #00f2fe' : '1px solid transparent',
              background: screen === 'modules_suite' ? 'rgba(0, 242, 254, 0.15)' : 'transparent',
              color: screen === 'modules_suite' ? '#00f2fe' : '#8a99ad',
              transition: 'all 0.2s'
            }}
          >
            📑 2. Modules Overview (.html)
          </button>

          <button
            onClick={() => {
              if (!user) setUser({ id: 'demo_user', name: 'Rachana Reddy', email: 'rachana@echosign.org' });
              if (!selectedPersona) setSelectedPersona({ id: 'deaf_mute', title: 'Deaf / Non-Speaking', icon: '🤟' });
              setScreen('live_workspace');
            }}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              border: screen === 'live_workspace' ? '1px solid #00f2fe' : '1px solid transparent',
              background: screen === 'live_workspace' ? 'rgba(0, 242, 254, 0.15)' : 'transparent',
              color: screen === 'live_workspace' ? '#00f2fe' : '#8a99ad',
              transition: 'all 0.2s'
            }}
          >
            💻 3. Live Workspace (.html)
          </button>

          <button
            onClick={() => {
              if (!user) setUser({ id: 'demo_user', name: 'Rachana Reddy', email: 'rachana@echosign.org' });
              if (!selectedPersona) setSelectedPersona({ id: 'deaf_mute', title: 'Deaf / Non-Speaking', icon: '🤟' });
              setScreen('peer_connect');
            }}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              border: screen === 'peer_connect' ? '1px solid #a78bfa' : '1px solid transparent',
              background: screen === 'peer_connect' ? 'rgba(157, 80, 187, 0.2)' : 'transparent',
              color: screen === 'peer_connect' ? '#a78bfa' : '#8a99ad',
              transition: 'all 0.2s'
            }}
          >
            👥 4. Two-Friend Connect & Call
          </button>
        </div>

        {/* User Status / Persona Switch */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {selectedPersona && (
            <button
              onClick={() => setScreen('persona_select')}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 16,
                padding: '4px 10px',
                fontSize: 11,
                color: '#cbd5e1',
                cursor: 'pointer'
              }}
            >
              {selectedPersona.icon || '🤟'} {selectedPersona.title || 'Persona'}
            </button>
          )}

          <button
            onClick={() => setScreen('auth_select')}
            style={{
              background: 'linear-gradient(135deg, #00f2fe, #9d50bb)',
              color: '#000',
              fontWeight: 800,
              border: 'none',
              borderRadius: 16,
              padding: '5px 14px',
              fontSize: 12,
              cursor: 'pointer'
            }}
          >
            {user ? 'Account' : 'Sign Up'}
          </button>
        </div>
      </div>

      {/* ── SCREEN RENDERING ── */}
      {screen === 'landing' && (
        <Landing
          onGetStarted={() => {
            if (!user) setUser({ id: 'demo_user', name: 'Rachana Reddy', email: 'rachana@echosign.org' });
            if (!selectedPersona) setSelectedPersona({ id: 'deaf_mute', title: 'Deaf / Non-Speaking', icon: '🤟' });
            setScreen('modules_suite');
          }}
          onLogin={() => handleStartAuth('login')}
          onSeeHowItWorks={() => {
            if (!user) setUser({ id: 'demo_user', name: 'Rachana Reddy', email: 'demo@echosign.org' });
            if (!selectedPersona) setSelectedPersona({ id: 'deaf_mute', title: 'Deaf / Non-Speaking', icon: '🤟' });
            setScreen('live_workspace');
          }}
          onOpenModules={() => {
            if (!user) setUser({ id: 'demo_user', name: 'Rachana Reddy', email: 'demo@echosign.org' });
            if (!selectedPersona) setSelectedPersona({ id: 'deaf_mute', title: 'Deaf / Non-Speaking', icon: '🤟' });
            setScreen('modules_suite');
          }}
          onOpenWorkspace={() => {
            if (!user) setUser({ id: 'demo_user', name: 'Rachana Reddy', email: 'demo@echosign.org' });
            if (!selectedPersona) setSelectedPersona({ id: 'deaf_mute', title: 'Deaf / Non-Speaking', icon: '🤟' });
            setScreen('live_workspace');
          }}
        />
      )}

      {screen === 'auth_select' && (
        <Auth
          mode={authMode}
          onSelectMethod={handleSelectAuthMethod}
          onBack={() => setScreen('landing')}
        />
      )}

      {screen === 'login_page' && (
        <EmailAuth
          mode="login"
          onComplete={handleAuthSuccess}
          onBack={() => setScreen('landing')}
        />
      )}

      {screen === 'email_auth' && (
        <EmailAuth
          mode={authMode === 'login' ? 'login' : 'signup'}
          onComplete={handleAuthSuccess}
          onBack={() => setScreen('auth_select')}
        />
      )}

      {screen === 'face_auth' && (
        <FaceAuth
          onComplete={handleAuthSuccess}
          onBack={() => setScreen('auth_select')}
        />
      )}

      {screen === 'voice_auth' && (
        <VoiceAuth
          onComplete={handleAuthSuccess}
          onBack={() => setScreen('auth_select')}
        />
      )}

      {screen === 'persona_select' && (
        <PersonaSelection
          onSelectPersona={handlePersonaSelected}
        />
      )}

      {screen === 'dashboard' && (
        <Dashboard
          user={user}
          persona={selectedPersona}
          onLogout={handleLogout}
          onChangePersona={() => setScreen('persona_select')}
        />
      )}

      {/* ── IMAGE 2: 3-COLUMN SUITE ── */}
      {screen === 'modules_suite' && (
        <ModulesView
          user={user}
          persona={selectedPersona}
          onNavigateWorkspace={() => setScreen('live_workspace')}
          onChangePersona={() => setScreen('persona_select')}
          onLogout={handleLogout}
        />
      )}

      {/* ── IMAGE 3: LIVE WORKSPACE & DEAF / AUTISM STUDIO ── */}
      {screen === 'live_workspace' && (
        <LiveWorkspaceView
          user={user}
          persona={selectedPersona}
          onNavigateModules={() => setScreen('modules_suite')}
          onNavigateTab={(tab) => {
            if (tab === 'autism' || tab === 'peer_connect' || tab === 'practice') {
              setScreen(tab === 'peer_connect' ? 'peer_connect' : 'dashboard');
            }
          }}
          onChangePersona={() => setScreen('persona_select')}
          onLogout={handleLogout}
        />
      )}

      {/* ── 4. TWO-FRIEND CONVERSATIONAL MODULE (CALL & CHAT) ── */}
      {screen === 'peer_connect' && (
        <div style={{ padding: '24px', maxWidth: 1300, margin: '0 auto' }}>
          <PeerConnectModule currentUser={user} />
        </div>
      )}
    </div>
  );
}
