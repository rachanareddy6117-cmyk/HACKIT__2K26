import React, { useState, useEffect } from 'react';
import Landing from './components/Landing';
import Auth from './components/Auth';
import EmailAuth from './components/EmailAuth';
import FaceAuth from './components/FaceAuth';
import VoiceAuth from './components/VoiceAuth';
import PersonaSelection from './components/PersonaSelection';
import Dashboard from './components/Dashboard';
import { getStoredItem, STORAGE_KEYS } from './utils/storage';

export default function App() {
  // Screen state machine:
  // 'landing' -> 'auth_select' -> 'email_auth' | 'face_auth' | 'voice_auth' -> 'persona_select' -> 'dashboard'
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

  return (
    <div style={{ minHeight: '100vh', background: '#0B0E14', color: '#ffffff', fontFamily: 'inherit' }}>
      {screen === 'landing' && (
        <Landing
          onGetStarted={() => handleStartAuth('signup')}
          onLogin={() => handleStartAuth('login')}
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
    </div>
  );
}
