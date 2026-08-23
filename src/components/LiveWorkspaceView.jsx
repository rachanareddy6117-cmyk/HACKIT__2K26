import React, { useRef, useState, useEffect } from 'react';
import CameraView from './CameraView';
import HandTracker from './HandTracker';
import DeafDumbGridModule from './DeafDumbGridModule';
import AutismSupportModule from './AutismSupportModule';
import { sendChatMessage } from '../services/api';

export default function LiveWorkspaceView({
  user,
  persona,
  onNavigateModules,
  onNavigateTab,
  onLogout,
  onChangePersona
}) {
  const [activeNav, setActiveNav] = useState('conversation');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "Hi, What can I translate today? I'm Echo Assistant. Let's see how confidence score affects your main task."
    },
    {
      id: 2,
      sender: 'user',
      text: 'Hello, message received! What is left from that and that?'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [detectedSign, setDetectedSign] = useState('HELLO 👋');
  const [confidence, setConfidence] = useState(94);
  const [handCount, setHandCount] = useState(1);
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [aiTyping, setAiTyping] = useState(false);

  const cameraRef = useRef(null);

  const handleGestureDetected = (gesture) => {
    if (gesture?.meta?.text) {
      setDetectedSign(`${gesture.meta.text} ${gesture.meta.emoji || '🤟'}`);
      setConfidence(Math.round((gesture.confidence || 0.94) * 100));
      setHandCount(1);
    }
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    const newMsg = { id: Date.now(), sender: 'user', text: userText };
    setMessages((prev) => [...prev, newMsg]);
    setChatInput('');
    setAiTyping(true);

    try {
      const res = await sendChatMessage({
        message: userText,
        personaCategory: persona?.id || 'deaf_mute',
        liveGlosses: [detectedSign]
      });

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: res?.reply || `Understood! I am monitoring sign "${detectedSign}". How else can I assist?`
        }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: `Echo AI received "${userText}". Vision tracking confidence is currently ${confidence}%.`
        }
      ]);
    } finally {
      setAiTyping(false);
    }
  };

  const handleNavClick = (navId) => {
    setActiveNav(navId);
    if (navId !== 'conversation' && onNavigateTab) {
      onNavigateTab(navId);
    }
  };

  return (
    <div style={{
      backgroundColor: '#07090e',
      color: '#ffffff',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '1rem 1.5rem',
      boxSizing: 'border-box',
      fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
      overflow: 'hidden'
    }}>
      {/* Top Bar */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        flexShrink: 0
      }}>
        <div style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: '#00f2fe',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          cursor: 'pointer'
        }}
        onClick={onNavigateModules}
        >
          <span>⚡</span> EchoSign
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {onNavigateModules && (
            <button
              onClick={onNavigateModules}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 20,
                padding: '4px 12px',
                fontSize: '0.8rem',
                color: '#fff',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
            >
              📐 3-Column Modules
            </button>
          )}

          <div
            onClick={onChangePersona}
            style={{
              background: 'rgba(0, 242, 254, 0.05)',
              border: '1px solid #00f2fe',
              borderRadius: 20,
              padding: '4px 12px',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: onChangePersona ? 'pointer' : 'default'
            }}
          >
            <span>Persona:</span>
            <span style={{ color: '#00f2fe', fontWeight: 600 }}>
              {persona?.icon || '🤟'} {persona?.title || 'Deaf/Non-Speaking'}
            </span>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 20,
            padding: '4px 12px 4px 6px',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <div style={{ width: 20, height: 20, background: '#fff', borderRadius: '50%' }} />
            <span>{user?.name || 'User'}</span>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#8a99ad',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#ff3b30'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#8a99ad'; }}
            >
              Logout
            </button>
          )}
        </div>
      </header>

      {/* Main Grid Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '200px 1fr 320px',
        gap: '1rem',
        flex: 1,
        minHeight: 0
      }}>
        {/* Left Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div
            onClick={() => handleNavClick('conversation')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '0.75rem 1rem',
              borderRadius: 10,
              fontSize: '0.85rem',
              cursor: 'pointer',
              background: activeNav === 'conversation' ? 'rgba(0, 242, 254, 0.1)' : 'transparent',
              borderColor: activeNav === 'conversation' ? '#00f2fe' : 'transparent',
              borderWidth: 1,
              borderStyle: 'solid',
              color: activeNav === 'conversation' ? '#00f2fe' : '#8a99ad',
              fontWeight: activeNav === 'conversation' ? 600 : 400,
              transition: 'all 0.2s'
            }}
          >
            💬 Conversation
          </div>

          <div
            onClick={() => handleNavClick('practice')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '0.75rem 1rem',
              borderRadius: 10,
              fontSize: '0.85rem',
              cursor: 'pointer',
              background: activeNav === 'practice' ? 'rgba(0, 242, 254, 0.1)' : 'transparent',
              borderColor: activeNav === 'practice' ? '#00f2fe' : 'transparent',
              borderWidth: 1,
              borderStyle: 'solid',
              color: activeNav === 'practice' ? '#00f2fe' : '#8a99ad',
              fontWeight: activeNav === 'practice' ? 600 : 400,
              transition: 'all 0.2s'
            }}
          >
            📝 Practice
          </div>

          <div
            onClick={() => handleNavClick('autism')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '0.75rem 1rem',
              borderRadius: 10,
              fontSize: '0.85rem',
              cursor: 'pointer',
              background: activeNav === 'autism' ? 'rgba(157, 80, 187, 0.15)' : 'transparent',
              borderColor: activeNav === 'autism' ? '#9d50bb' : 'transparent',
              borderWidth: 1,
              borderStyle: 'solid',
              color: activeNav === 'autism' ? '#a78bfa' : '#8a99ad',
              fontWeight: activeNav === 'autism' ? 600 : 400,
              transition: 'all 0.2s'
            }}
          >
            🧩 Autism & AAC
          </div>

          <div
            onClick={() => handleNavClick('peer_connect')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '0.75rem 1rem',
              borderRadius: 10,
              fontSize: '0.85rem',
              cursor: 'pointer',
              background: activeNav === 'peer_connect' ? 'rgba(0, 242, 254, 0.1)' : 'transparent',
              borderColor: activeNav === 'peer_connect' ? '#00f2fe' : 'transparent',
              borderWidth: 1,
              borderStyle: 'solid',
              color: activeNav === 'peer_connect' ? '#00f2fe' : '#8a99ad',
              fontWeight: activeNav === 'peer_connect' ? 600 : 400,
              transition: 'all 0.2s'
            }}
          >
            👥 Peer Connect
          </div>

          <div
            onClick={() => handleNavClick('translate')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '0.75rem 1rem',
              borderRadius: 10,
              fontSize: '0.85rem',
              cursor: 'pointer',
              background: activeNav === 'translate' ? 'rgba(0, 242, 254, 0.1)' : 'transparent',
              borderColor: activeNav === 'translate' ? '#00f2fe' : 'transparent',
              borderWidth: 1,
              borderStyle: 'solid',
              color: activeNav === 'translate' ? '#00f2fe' : '#8a99ad',
              fontWeight: activeNav === 'translate' ? 600 : 400,
              transition: 'all 0.2s'
            }}
          >
            🔤 Translate
          </div>

          <div
            onClick={() => handleNavClick('emergency')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '0.75rem 1rem',
              borderRadius: 10,
              fontSize: '0.85rem',
              color: '#ff3b30',
              background: 'rgba(255, 59, 48, 0.1)',
              marginTop: 'auto',
              cursor: 'pointer',
              border: '1px solid rgba(255, 59, 48, 0.3)',
              fontWeight: 700,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 59, 48, 0.2)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 59, 48, 0.1)'; }}
          >
            🚨 Emergency
          </div>
        </div>

        {/* Center Feed / Grid View */}
        <div style={{
          background: 'rgba(18, 22, 33, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 16,
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          minHeight: 0,
          overflowY: 'auto'
        }}>
          {activeNav === 'autism' ? (
            <AutismSupportModule />
          ) : activeNav === 'practice' || activeNav === 'deaf_grid' ? (
            <DeafDumbGridModule onSelectSign={(sym) => {
              setDetectedSign(`${sym.title} ${sym.emoji}`);
              setConfidence(98);
            }} />
          ) : (
            <>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem'
              }}>
                <span style={{
                  background: '#00f2fe',
                  color: '#000',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 4
                }}>
                  • LIVE
                </span>
                <span style={{ fontSize: '0.8rem', color: '#8a99ad' }}>
                  👋 {handCount} hand detected
                </span>
              </div>

              <div style={{
                flex: 1,
                minHeight: 340,
                background: '#000',
                borderRadius: 12,
                border: '1px solid rgba(0, 242, 254, 0.2)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Camera View & Hand Landmark Tracker */}
                <div style={{ position: 'absolute', inset: 0 }}>
                  <CameraView ref={cameraRef} />
                  <HandTracker
                    videoElement={cameraRef.current?.getVideoElement()}
                    isCameraActive={isCameraActive}
                    onGestureDetected={handleGestureDetected}
                  />
                </div>

                {/* Fallback SVG Mesh Overlay matching the user HTML template */}
                <svg
                  width="180"
                  height="180"
                  viewBox="0 0 200 200"
                  fill="none"
                  stroke="#00f2fe"
                  strokeWidth="2"
                  strokeLinecap="round"
                  style={{
                    position: 'relative',
                    zIndex: 2,
                    pointerEvents: 'none',
                    opacity: 0.85,
                    filter: 'drop-shadow(0 0 8px #00f2fe)'
                  }}
                >
                  <path d="M 100 150 L 100 110 M 100 110 L 80 80 M 80 80 L 70 50 M 100 110 L 100 70 M 100 70 L 100 35 M 100 110 L 120 75 L 120 75 L 130 45 M 100 110 L 140 85 M 140 85 L 155 60 L 100 150 L 65 130 M 65 130 L 45 110" />
                  <circle cx="100" cy="150" r="3" fill="#00f2fe" />
                  <circle cx="100" cy="110" r="3" fill="#00f2fe" />
                  <circle cx="70" cy="50" r="3" fill="#00f2fe" />
                  <circle cx="100" cy="35" r="3" fill="#00f2fe" />
                  <circle cx="130" cy="45" r="3" fill="#00f2fe" />
                  <circle cx="155" cy="60" r="3" fill="#00f2fe" />
                </svg>

                {/* Live Detected Overlay Badge */}
                <div style={{
                  position: 'absolute',
                  bottom: '1.5rem',
                  left: '1.5rem',
                  background: 'rgba(18, 22, 33, 0.85)',
                  border: '1px solid #00f2fe',
                  borderRadius: 12,
                  padding: '0.75rem 1.25rem',
                  backdropFilter: 'blur(8px)',
                  zIndex: 10,
                  boxShadow: '0 4px 20px rgba(0,242,254,0.15)'
                }}>
                  <div style={{ fontSize: '0.9rem', color: '#fff' }}>
                    Detected Sign: <strong style={{ color: '#00f2fe' }}>{detectedSign}</strong>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#8a99ad', marginTop: 2 }}>
                    Confidence: {confidence}%
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right AI Chat */}
        <div style={{
          background: 'rgba(18, 22, 33, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 16,
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            paddingBottom: '0.75rem',
            flexShrink: 0
          }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>
              ✨ Echo Assistant
            </span>
            <span style={{ fontSize: '0.75rem', color: '#00e676', fontWeight: 600 }}>
              • AI Online
            </span>
          </div>

          {/* Chat History */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            overflowY: 'auto',
            paddingRight: 4
          }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 12,
                  fontSize: '0.8rem',
                  lineHeight: 1.4,
                  maxWidth: '85%',
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  background: msg.sender === 'user'
                    ? 'linear-gradient(135deg, #00f2fe, #9d4edd)'
                    : 'rgba(255,255,255,0.05)',
                  color: '#fff',
                  border: msg.sender === 'ai' ? '1px solid rgba(255, 255, 255, 0.08)' : 'none'
                }}
              >
                {msg.text}
              </div>
            ))}
            {aiTyping && (
              <div style={{
                padding: '0.5rem 0.8rem',
                borderRadius: 12,
                fontSize: '0.75rem',
                color: '#00f2fe',
                background: 'rgba(0,242,254,0.08)',
                alignSelf: 'flex-start'
              }}>
                Echo Assistant is typing...
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} style={{ marginTop: '1rem', flexShrink: 0 }}>
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type a message..."
              style={{
                width: '100%',
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 20,
                padding: '0.6rem 1rem',
                color: '#fff',
                fontSize: '0.8rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#00f2fe'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'; }}
            />
          </form>
        </div>
      </div>
    </div>
  );
}
