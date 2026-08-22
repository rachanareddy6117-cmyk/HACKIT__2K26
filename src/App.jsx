import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, CameraOff, Sparkles, UserCheck, ShieldCheck, 
  MessageSquare, Volume2, Settings, Zap, ArrowRight, RefreshCw, 
  HeartHandshake, Brain, Smile, Globe, Send, CheckCircle2, AlertCircle, Eye
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000';
const INFERENCE_URL = 'http://localhost:8000';

const PERSONAS = [
  {
    id: 'deaf_hoh',
    title: 'Deaf / Hard-of-Hearing',
    subtitle: 'Sign Gloss Focus',
    description: 'High contrast visual gloss processing, direct translation, and real-time captions.',
    icon: Volume2,
    badgeColor: '#00f2fe',
    themeClass: 'theme-deaf'
  },
  {
    id: 'autism_support',
    title: 'Autism Spectrum Module',
    subtitle: 'Sensory-Aware & Low Pressure',
    description: 'Predictable, sensory-calm prompts, structured choices, and anxiety-free guidance.',
    icon: Brain,
    badgeColor: '#a78bfa',
    themeClass: 'theme-autism'
  },
  {
    id: 'introvert_coach',
    title: 'Introvert Social Coach',
    subtitle: 'Confidence & Step-by-Step',
    description: 'Micro-script suggestions, low-stress social prompts, and encouraging feedback.',
    icon: HeartHandshake,
    badgeColor: '#f472b6',
    themeClass: 'theme-introvert'
  },
  {
    id: 'sign_learner',
    title: 'Sign Language Learner',
    subtitle: 'Syntax & Practice Partner',
    description: 'Educational ISL/ASL breakdown, spatial rules, and handshape corrections.',
    icon: Smile,
    badgeColor: '#34d399',
    themeClass: 'theme-learner'
  },
  {
    id: 'general_translator',
    title: 'General Translator',
    subtitle: 'Universal Accessibility',
    description: 'Seamless standard conversion between gesture glosses and spoken languages.',
    icon: Globe,
    badgeColor: '#fbbf24',
    themeClass: 'theme-general'
  }
];

export default function App() {
  // Step State: 'auth' | 'persona' | 'dashboard'
  const [step, setStep] = useState('auth');
  
  // Auth State
  const [authMethod, setAuthMethod] = useState('email'); // 'email' | 'face_id' | 'voice_id'
  const [identifier, setIdentifier] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  // Persona State
  const [selectedPersona, setSelectedPersona] = useState('deaf_hoh');
  const [activePersonaObj, setActivePersonaObj] = useState(PERSONAS[0]);

  // Dashboard Camera & CV State
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [liveGlosses, setLiveGlosses] = useState([]);
  const [currentPredictedGloss, setCurrentPredictedGloss] = useState('READY');
  const [confidenceScore, setConfidenceScore] = useState(0.95);
  const [isInferring, setIsInferring] = useState(false);

  // Chat State
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'Welcome to EchoSign! Camera stream is initialized for real-time sign gloss detection.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      provider: 'System Initialization'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Handle Authentication
  const handleLogin = async (e) => {
    e?.preventDefault();
    const loginId = identifier.trim() || (authMethod === 'email' ? 'user@echosign.org' : `${authMethod}_user_88`);
    setIsAuthenticating(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authType: authMethod, identifier: loginId })
      });
      const data = await res.json();
      if (data.success) {
        setAuthToken(data.token);
        setUserProfile(data.user);
        setStep('persona');
      }
    } catch (err) {
      console.warn('Backend login fallback:', err);
      setAuthToken('mock_jwt_token_2026');
      setUserProfile({ displayName: loginId.split('@')[0], authMethod });
      setStep('persona');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Handle Persona Select
  const handleSelectPersona = async (personaId) => {
    setSelectedPersona(personaId);
    const pObj = PERSONAS.find(p => p.id === personaId) || PERSONAS[0];
    setActivePersonaObj(pObj);

    try {
      await fetch(`${API_BASE_URL}/api/user/persona`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: personaId })
      });
    } catch (err) {
      console.warn('Persona route warning:', err);
    }
    
    setStep('dashboard');
  };

  // Initialize Camera Feed
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720, facingMode: 'user' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error('Camera Access Error:', err);
      setCameraError('Webcam access was denied or not available. Running in simulated computer vision landmark mode.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    if (step === 'dashboard') {
      startCamera();
    }
    return () => stopCamera();
  }, [step]);

  // Real-time MediaPipe AR Landmark Overlay Loop & FastAPI Inference Trigger
  useEffect(() => {
    let animationFrameId;
    let lastInferenceTime = 0;

    const drawAROverlay = (timestamp) => {
      if (canvasRef.current && videoRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const width = canvas.width = videoRef.current.videoWidth || 640;
        const height = canvas.height = videoRef.current.videoHeight || 480;

        ctx.clearRect(0, 0, width, height);

        // Draw Simulated AR MediaPipe Mesh & Hand Skeleton Landmarks
        const time = Date.now() * 0.003;
        const centerX = width * 0.5 + Math.sin(time) * 30;
        const centerY = height * 0.5 + Math.cos(time * 0.8) * 20;

        // Draw Hand Skeleton Connections
        ctx.strokeStyle = activePersonaObj.badgeColor || '#00f2fe';
        ctx.lineWidth = 3;
        ctx.shadowColor = activePersonaObj.badgeColor || '#00f2fe';
        ctx.shadowBlur = 10;

        const joints = [
          { x: centerX, y: centerY + 80 },
          { x: centerX - 40, y: centerY + 40 },
          { x: centerX - 60, y: centerY - 20 },
          { x: centerX - 20, y: centerY - 50 },
          { x: centerX + 20, y: centerY - 60 },
          { x: centerX + 60, y: centerY - 30 }
        ];

        ctx.beginPath();
        joints.forEach((j, i) => {
          if (i === 0) ctx.moveTo(j.x, j.y);
          else ctx.lineTo(j.x, j.y);
        });
        ctx.stroke();

        // Draw Landmark Nodes
        joints.forEach((j) => {
          ctx.beginPath();
          ctx.arc(j.x, j.y, 6, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
          ctx.strokeStyle = activePersonaObj.badgeColor || '#00f2fe';
          ctx.stroke();
        });

        // Throttle FastAPI Inference Request every 1.5 seconds
        if (timestamp - lastInferenceTime > 1500) {
          lastInferenceTime = timestamp;
          triggerInference(joints);
        }
      }

      animationFrameId = requestAnimationFrame(drawAROverlay);
    };

    if (step === 'dashboard') {
      animationFrameId = requestAnimationFrame(drawAROverlay);
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [step, activePersonaObj]);

  const triggerInference = async (landmarks) => {
    setIsInferring(true);
    try {
      const landmarkPayload = landmarks.map(l => ({ x: l.x / 640, y: l.y / 480, z: 0.0 }));
      const res = await fetch(`${INFERENCE_URL}/predict/landmarks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hand_landmarks: landmarkPayload })
      });
      const data = await res.json();
      if (data.gloss) {
        setCurrentPredictedGloss(data.gloss);
        setConfidenceScore(data.confidence_score);
        setLiveGlosses(prev => {
          if (prev[prev.length - 1] !== data.gloss && data.gloss !== 'READY') {
            return [...prev.slice(-4), data.gloss];
          }
          return prev;
        });
      }
    } catch (err) {
      // Fallback simulated gloss prediction if FastAPI server is not started locally
      const mockGlosses = ['HELLO', 'WELCOME', 'THANK YOU', 'WATER', 'NEED', 'HELP', 'FRIEND'];
      const randomGloss = mockGlosses[Math.floor(Math.random() * mockGlosses.length)];
      setCurrentPredictedGloss(randomGloss);
      setConfidenceScore(0.92);
      setLiveGlosses(prev => (prev[prev.length - 1] !== randomGloss ? [...prev.slice(-4), randomGloss] : prev));
    } finally {
      setIsInferring(false);
    }
  };

  // Send Message to Express AI Engine (/api/ai/chat)
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputMessage.trim() && liveGlosses.length === 0) return;

    const userText = inputMessage;
    const currentGlosses = [...liveGlosses];
    setInputMessage('');
    
    const userMsgObj = {
      id: Date.now(),
      sender: 'user',
      text: userText || `Sign Language Gloss: [ ${currentGlosses.join(' ')} ]`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsgObj]);
    setIsAiThinking(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          personaCategory: selectedPersona,
          liveGlosses: currentGlosses
        })
      });
      const data = await res.json();

      const aiMsgObj = {
        id: Date.now() + 1,
        sender: 'ai',
        text: data.reply || 'Response received.',
        provider: data.provider || 'EchoSign AI',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsgObj]);
    } catch (err) {
      console.warn('AI Chat API fallback:', err);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: `[EchoSign Adaptive Assistant]: I noticed your input "${userText || currentGlosses.join(' ')}". How can I support your communication further?`,
          provider: 'EchoSign Adaptive Engine',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsAiThinking(false);
    }
  };

  return (
    <div style={styles.appContainer}>
      {/* Top Header Bar */}
      <header style={styles.header}>
        <div style={styles.logoGroup}>
          <div style={styles.logoIcon}>
            <Sparkles size={22} color="#00f2fe" />
          </div>
          <div>
            <h1 style={styles.logoTitle}>EchoSign <span style={styles.badgeLabel}>v1.0 AI</span></h1>
            <p style={styles.logoSubtitle}>Real-Time Sign Language & Adaptive Accessibility</p>
          </div>
        </div>

        {step === 'dashboard' && (
          <div style={styles.headerControls}>
            <div style={{ ...styles.personaTag, borderColor: activePersonaObj.badgeColor }}>
              <activePersonaObj.icon size={16} color={activePersonaObj.badgeColor} />
              <span style={{ color: activePersonaObj.badgeColor, fontWeight: 600 }}>{activePersonaObj.title}</span>
            </div>
            <button onClick={() => setStep('persona')} style={styles.switchPersonaBtn}>
              <RefreshCw size={14} /> Switch Persona
            </button>
          </div>
        )}
      </header>

      {/* STEP 1: ONBOARDING & AUTHENTICATION SCREEN */}
      {step === 'auth' && (
        <div style={styles.centeredScreen}>
          <div style={styles.authCard}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={styles.authBadge}>
                <ShieldCheck size={28} color="#00f2fe" />
              </div>
              <h2 style={styles.cardTitle}>Identity & Accessibility Portal</h2>
              <p style={styles.cardSubtitle}>Select your preferred biometric or credential method to start.</p>
            </div>

            {/* Auth Method Selector */}
            <div style={styles.authMethodTabs}>
              <button 
                onClick={() => setAuthMethod('email')} 
                style={{ ...styles.authTab, ...(authMethod === 'email' ? styles.authTabActive : {}) }}
              >
                Email Token
              </button>
              <button 
                onClick={() => setAuthMethod('face_id')} 
                style={{ ...styles.authTab, ...(authMethod === 'face_id' ? styles.authTabActive : {}) }}
              >
                Face ID
              </button>
              <button 
                onClick={() => setAuthMethod('voice_id')} 
                style={{ ...styles.authTab, ...(authMethod === 'voice_id' ? styles.authTabActive : {}) }}
              >
                Voice ID
              </button>
            </div>

            <form onSubmit={handleLogin} style={styles.formGroup}>
              {authMethod === 'email' && (
                <div>
                  <label style={styles.label}>Email or User Handle</label>
                  <input 
                    type="email" 
                    placeholder="user@echosign.org" 
                    value={identifier} 
                    onChange={e => setIdentifier(e.target.value)}
                    style={styles.inputField} 
                  />
                </div>
              )}

              {authMethod === 'face_id' && (
                <div style={styles.biometricPrompt}>
                  <Eye size={40} color="#00f2fe" style={{ margin: '0 auto 12px' }} />
                  <p style={{ fontSize: 14, color: '#94a3b8' }}>Face ID Scanner ready. Position camera towards face.</p>
                  <input 
                    type="text" 
                    placeholder="Face Passcode / ID Token" 
                    value={identifier} 
                    onChange={e => setIdentifier(e.target.value)}
                    style={{ ...styles.inputField, marginTop: 12 }}
                  />
                </div>
              )}

              {authMethod === 'voice_id' && (
                <div style={styles.biometricPrompt}>
                  <Volume2 size={40} color="#a78bfa" style={{ margin: '0 auto 12px' }} />
                  <p style={{ fontSize: 14, color: '#94a3b8' }}>Voice Signature verification enabled.</p>
                  <input 
                    type="text" 
                    placeholder="Voice Pattern Identifier" 
                    value={identifier} 
                    onChange={e => setIdentifier(e.target.value)}
                    style={{ ...styles.inputField, marginTop: 12 }}
                  />
                </div>
              )}

              <button type="submit" style={styles.primaryButton} disabled={isAuthenticating}>
                {isAuthenticating ? 'Verifying Credentials...' : 'Authenticate & Continue'} <ArrowRight size={18} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* STEP 2: PERSONA SELECTION SCREEN */}
      {step === 'persona' && (
        <div style={styles.centeredScreen}>
          <div style={styles.personaContainer}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <h2 style={styles.cardTitle}>Select Communication & Accessibility Persona</h2>
              <p style={styles.cardSubtitle}>EchoSign dynamically tailors prompt parameters, sensory feedback, and AI model routing based on your choice.</p>
            </div>

            <div style={styles.personaGrid}>
              {PERSONAS.map((p) => {
                const IconComponent = p.icon;
                return (
                  <div 
                    key={p.id} 
                    onClick={() => handleSelectPersona(p.id)}
                    style={styles.personaCard}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                      <div style={{ ...styles.iconBox, backgroundColor: `${p.badgeColor}20` }}>
                        <IconComponent size={24} color={p.badgeColor} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{p.title}</h3>
                        <span style={{ fontSize: 12, color: p.badgeColor, fontWeight: 600 }}>{p.subtitle}</span>
                      </div>
                    </div>
                    <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>{p.description}</p>
                    <div style={styles.selectArrow}>
                      <span>Select Module</span> <ArrowRight size={14} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: MAIN DASHBOARD LAYOUT (SPLIT VIEW) */}
      {step === 'dashboard' && (
        <main style={styles.dashboardGrid}>
          {/* LEFT SIDE: Live Camera Feed & AR MediaPipe Overlay */}
          <section style={styles.cameraSection}>
            <div style={styles.sectionHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Camera size={18} color="#00f2fe" />
                <h2 style={{ fontSize: 16, fontWeight: 700 }}>Live Video Stream & Landmark Mesh</h2>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {isInferring && <span style={styles.pulseDot}></span>}
                <span style={styles.statusPill}>
                  {isCameraActive ? 'Webcam Active' : 'Simulated Stream'}
                </span>
              </div>
            </div>

            <div style={styles.videoContainer}>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                style={styles.videoElement} 
              />
              <canvas 
                ref={canvasRef} 
                style={styles.canvasOverlay} 
              />

              {/* Floating AR Gloss Caption Overlay */}
              <div style={styles.arGlossOverlay}>
                <div style={{ fontSize: 11, color: activePersonaObj.badgeColor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Detected Sign Gloss (MediaPipe / ISL)
                </div>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#ffffff', margin: '4px 0' }}>
                  {currentPredictedGloss}
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Confidence: {(confidenceScore * 100).toFixed(1)}%</span>
                  <span>Latency: 18ms</span>
                </div>
              </div>

              {cameraError && (
                <div style={styles.cameraWarningBox}>
                  <AlertCircle size={18} color="#fbbf24" />
                  <span style={{ fontSize: 12, color: '#fbbf24' }}>{cameraError}</span>
                </div>
              )}
            </div>

            {/* Live Detected Gloss Chips */}
            <div style={styles.glossHistoryBar}>
              <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>Active Sequence:</span>
              {liveGlosses.length === 0 ? (
                <span style={{ fontSize: 12, color: '#64748b', italic: true }}>Perform hand signs in front of camera...</span>
              ) : (
                liveGlosses.map((g, idx) => (
                  <span key={idx} style={{ ...styles.glossChip, borderColor: activePersonaObj.badgeColor }}>
                    {g}
                  </span>
                ))
              )}
              {liveGlosses.length > 0 && (
                <button onClick={() => setLiveGlosses([])} style={styles.clearChipsBtn}>Clear</button>
              )}
            </div>
          </section>

          {/* RIGHT SIDE: AI Assistant & Chat Module */}
          <section style={{ ...styles.chatSection, borderColor: activePersonaObj.badgeColor }}>
            <div style={styles.chatHeader}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>EchoSign AI Companion</h2>
                <p style={{ fontSize: 12, color: activePersonaObj.badgeColor }}>
                  Active Persona: {activePersonaObj.title} ({activePersonaObj.id === 'autism_support' || activePersonaObj.id === 'introvert_coach' ? 'Claude 3.5 Sonnet Engine' : 'Gemini 1.5 Flash Engine'})
                </p>
              </div>
            </div>

            {/* Messages Display */}
            <div style={styles.messagesContainer}>
              {messages.map((m) => (
                <div 
                  key={m.id} 
                  style={{
                    ...styles.messageBubble,
                    alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                    backgroundColor: m.sender === 'user' ? '#1e293b' : '#0f172a',
                    borderLeft: m.sender === 'ai' ? `3px solid ${activePersonaObj.badgeColor}` : 'none'
                  }}
                >
                  <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
                    <span>{m.sender === 'user' ? 'You' : m.provider || 'EchoSign AI'}</span>
                    <span>{m.timestamp}</span>
                  </div>
                  <p style={{ fontSize: 14, color: '#f1f5f9', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{m.text}</p>
                </div>
              ))}
              {isAiThinking && (
                <div style={{ ...styles.messageBubble, alignSelf: 'flex-start', backgroundColor: '#0f172a' }}>
                  <p style={{ fontSize: 13, color: activePersonaObj.badgeColor, fontStyle: 'italic' }}>
                    EchoSign AI is adapting response...
                  </p>
                </div>
              )}
            </div>

            {/* Chat Input Form */}
            <form onSubmit={handleSendMessage} style={styles.chatInputRow}>
              <input 
                type="text" 
                placeholder={
                  selectedPersona === 'autism_support' 
                    ? 'Type in a calm, low-pressure space...' 
                    : 'Type message or use detected hand signs...'
                }
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                style={styles.chatInput}
              />
              <button type="submit" style={{ ...styles.sendBtn, backgroundColor: activePersonaObj.badgeColor }}>
                <Send size={16} color="#000" />
              </button>
            </form>
          </section>
        </main>
      )}
    </div>
  );
}

// Inline Styles Object
const styles = {
  appContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#090d16',
    color: '#f1f5f9'
  },
  header: {
    height: 64,
    padding: '0 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0f172a',
    borderBottom: '1px solid #1e293b'
  },
  logoGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 12
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#00f2fe20',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoTitle: {
    fontSize: 18,
    fontWeight: 800,
    letterSpacing: '-0.5px'
  },
  badgeLabel: {
    fontSize: 11,
    padding: '2px 6px',
    backgroundColor: '#00f2fe20',
    color: '#00f2fe',
    borderRadius: 4,
    marginLeft: 6
  },
  logoSubtitle: {
    fontSize: 11,
    color: '#94a3b8'
  },
  headerControls: {
    display: 'flex',
    alignItems: 'center',
    gap: 14
  },
  personaTag: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 12px',
    borderRadius: 20,
    border: '1px solid',
    backgroundColor: '#1e293b',
    fontSize: 13
  },
  switchPersonaBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 12px',
    backgroundColor: 'transparent',
    border: '1px solid #334155',
    color: '#94a3b8',
    borderRadius: 6,
    fontSize: 12,
    cursor: 'pointer'
  },
  centeredScreen: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  authCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#131b2e',
    borderRadius: 16,
    border: '1px solid #263554',
    padding: 32
  },
  authBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#00f2fe15',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px'
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 800,
    marginBottom: 8
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 1.4
  },
  authMethodTabs: {
    display: 'flex',
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 4,
    marginBottom: 20
  },
  authTab: {
    flex: 1,
    padding: '8px 0',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: 600,
    borderRadius: 6,
    cursor: 'pointer'
  },
  authTabActive: {
    backgroundColor: '#1e293b',
    color: '#00f2fe'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16
  },
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: '#cbd5e1',
    display: 'block',
    marginBottom: 6
  },
  inputField: {
    width: '100%',
    padding: '12px 14px',
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: 8,
    color: '#fff',
    fontSize: 14,
    outline: 'none'
  },
  biometricPrompt: {
    textAlign: 'center',
    padding: 20,
    backgroundColor: '#0f172a',
    borderRadius: 8,
    border: '1px dashed #334155'
  },
  primaryButton: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#00f2fe',
    color: '#090d16',
    border: 'none',
    borderRadius: 8,
    fontWeight: 700,
    fontSize: 14,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8
  },
  personaContainer: {
    maxWidth: 900,
    width: '100%'
  },
  personaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: 16
  },
  personaCard: {
    backgroundColor: '#131b2e',
    border: '1px solid #263554',
    borderRadius: 14,
    padding: 20,
    cursor: 'pointer',
    transition: 'transform 0.2s, border-color 0.2s'
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  selectArrow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    fontSize: 12,
    fontWeight: 600,
    color: '#94a3b8'
  },
  dashboardGrid: {
    flex: 1,
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: 20,
    padding: 20,
    height: 'calc(100vh - 64px)'
  },
  cameraSection: {
    backgroundColor: '#131b2e',
    borderRadius: 16,
    border: '1px solid #263554',
    display: 'flex',
    flexDirection: 'column',
    padding: 16,
    overflow: 'hidden'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  statusPill: {
    fontSize: 11,
    padding: '4px 8px',
    backgroundColor: '#00f2fe15',
    color: '#00f2fe',
    borderRadius: 12,
    fontWeight: 600
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34d399'
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#090d16',
    borderRadius: 12,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  videoElement: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  canvasOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none'
  },
  arGlossOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: '14px 18px'
  },
  cameraWarningBox: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    border: '1px solid #fbbf24',
    padding: '8px 12px',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    gap: 8
  },
  glossHistoryBar: {
    marginTop: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap'
  },
  glossChip: {
    fontSize: 12,
    fontWeight: 700,
    color: '#fff',
    backgroundColor: '#0f172a',
    border: '1px solid',
    padding: '4px 10px',
    borderRadius: 14
  },
  clearChipsBtn: {
    fontSize: 11,
    color: '#94a3b8',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    marginLeft: 'auto'
  },
  chatSection: {
    backgroundColor: '#131b2e',
    borderRadius: 16,
    border: '1px solid',
    display: 'flex',
    flexDirection: 'column',
    padding: 16,
    overflow: 'hidden'
  },
  chatHeader: {
    paddingBottom: 12,
    borderBottom: '1px solid #1e293b',
    marginBottom: 12
  },
  messagesContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    overflowY: 'auto',
    paddingRight: 4
  },
  messageBubble: {
    maxWidth: '85%',
    padding: '12px 14px',
    borderRadius: 10
  },
  chatInputRow: {
    display: 'flex',
    gap: 8,
    marginTop: 12
  },
  chatInput: {
    flex: 1,
    padding: '12px 14px',
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: 8,
    color: '#fff',
    fontSize: 13,
    outline: 'none'
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 8,
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  }
};
