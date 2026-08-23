import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleGoogleLogin = () => {
    // Placeholder: simulate successful login
    const dummyUser = { id: 'google_user', name: 'Google User' };
    login(dummyUser);
    navigate('/dashboard');
  };

  const handleVoiceLogin = () => {
    const dummyUser = { id: 'voice_user', name: 'Voice User' };
    login(dummyUser);
    navigate('/dashboard');
  };

  const handleVideoLogin = () => {
    const dummyUser = { id: 'video_user', name: 'Video User' };
    login(dummyUser);
    navigate('/dashboard');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#07090e',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Segoe UI',-apple-system,sans-serif"
    }}>
      <h1 style={{ marginBottom: 20 }}>Sign In to EchoSign</h1>
      <button onClick={handleGoogleLogin} style={buttonStyle}>Sign in with Google</button>
      <button onClick={handleVoiceLogin} style={buttonStyle}>Sign in with Voice</button>
      <button onClick={handleVideoLogin} style={buttonStyle}>Sign in with Video</button>
    </div>
  );
};

const buttonStyle = {
  background: 'linear-gradient(135deg,#00f2fe,#9d50bb)',
  color: '#000',
  border: 'none',
  borderRadius: 12,
  padding: '10px 20px',
  margin: '10px 0',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
  boxShadow: '0 4px 12px rgba(0,242,254,0.3)',
};

export default LoginPage;
