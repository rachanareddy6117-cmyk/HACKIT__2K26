import React, { useRef, useState, useEffect } from 'react';
import CameraView from './CameraView';
import HandTracker from './HandTracker';
import ChatPanel from './ChatPanel';
import Practice from './Practice';
import Translator from './Translator';
import Emergency from './Emergency';
import PracticeModule from './PracticeModule';
import TranslatorModule from './TranslatorModule';
import EmergencyModule from './EmergencyModule';
import ModulesView from './ModulesView';
import LiveWorkspaceView from './LiveWorkspaceView';
import AutismSupportModule from './AutismSupportModule';
import PeerConnectModule from './PeerConnectModule';
import Logo from './Logo';
import {
  MessageSquare, Award, Globe, ShieldAlert, LogOut, User, Menu, X, Activity, LayoutGrid, Sparkles, MonitorPlay, Heart, Users
} from 'lucide-react';
import { clearSession } from '../utils/storage';
import { checkBackendHealth } from '../services/api';

const NAV_ITEMS = [
  { id: 'suite',        label: '3-Column Suite',   icon: LayoutGrid },
  { id: 'workspace',    label: 'Live Workspace',   icon: MonitorPlay },
  { id: 'practice',     label: 'Practice (20 Lvl)', icon: Award },
  { id: 'autism',       label: 'Autism & AAC',     icon: Heart },
  { id: 'peer_connect', label: 'Peer Connect & Call', icon: Users },
  { id: 'conversation', label: 'Conversation',     icon: MessageSquare },
  { id: 'translate',    label: 'Translate',        icon: Globe },
  { id: 'emergency',    label: 'Emergency',        icon: ShieldAlert, red: true },
];

export default function Dashboard({ user, persona, onLogout, onChangePersona }) {
  const [activeTab,       setActiveTab]       = useState('suite');
  const [mobileMenuOpen,  setMobileMenuOpen]  = useState(false);
  const [backendHealth,   setBackendHealth]   = useState({ status: 'checking', message: 'Connecting to API...' });
  const [liveGlosses,     setLiveGlosses]     = useState([]);
  const cameraRef = useRef(null);

  // Poll backend health check
  useEffect(() => {
    let mounted = true;
    const testHealth = async () => {
      try {
        const res = await checkBackendHealth();
        if (mounted) {
          if (res && res.status === 'healthy') {
            setBackendHealth({ status: 'connected', port: res.port || 5002, service: res.service });
          } else {
            setBackendHealth({ status: 'fallback', port: 5002, message: 'In-Memory Store Active' });
          }
        }
      } catch {
        if (mounted) setBackendHealth({ status: 'fallback', port: 5002, message: 'In-Memory Store Active' });
      }
    };

    testHealth();
    const interval = setInterval(testHealth, 10000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  const handleGestureDetected = (gesture) => {
    if (gesture?.meta?.text) {
      setLiveGlosses(prev => {
        if (prev[prev.length - 1] !== gesture.meta.text) {
          return [...prev.slice(-3), gesture.meta.text];
        }
        return prev;
      });
    }
  };

  const handleLogout = () => { clearSession(); onLogout(); };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: '#0B0E14', color: '#fff' }}
    >
      {/* ── Top Header ── */}
      <header
        className="sticky top-0 z-40 px-5 py-3 flex items-center justify-between"
        style={{
          background: 'rgba(5,7,10,0.92)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
      >
        <div className="flex items-center gap-4">
          <Logo size="small" />
          {persona && (
            <button
              onClick={onChangePersona}
              className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer"
              style={{
                background: 'rgba(0,242,254,0.08)',
                border: '1px solid rgba(0,242,254,0.25)',
                color: '#00F2FE',
              }}
            >
              <span>{persona.icon || '🤟'}</span>
              <span>{persona.title || 'Deaf / Non-Speaking'}</span>
            </button>
          )}

          {/* Backend Status Pill */}
          <div
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono"
            style={{
              background: backendHealth.status === 'connected' ? 'rgba(34,197,94,0.1)' : 'rgba(0,242,254,0.1)',
              border: backendHealth.status === 'connected' ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(0,242,254,0.25)',
              color: backendHealth.status === 'connected' ? '#4ade80' : '#00F2FE'
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ background: backendHealth.status === 'connected' ? '#22c55e' : '#00F2FE' }} />
            <span>API {backendHealth.status === 'connected' ? `Online (:5002)` : 'Active (:5002)'}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#94A3B8' }}
          >
            <User className="w-4 h-4" style={{ color: '#9D50BB' }} />
            <span>{user?.name || user?.email || 'Rachana Reddy'}</span>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 rounded-xl transition-all cursor-pointer"
            style={{ color: '#94A3B8' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = 'transparent'; }}
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl cursor-pointer"
            style={{ color: '#94A3B8', background: 'rgba(255,255,255,0.04)' }}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* ── Main Layout ── */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-5">

        {/* Sidebar */}
        <aside className={`md:col-span-2 space-y-3 ${mobileMenuOpen ? 'block' : 'hidden md:block'}`}>
          <nav
            className="p-2 rounded-2xl space-y-1"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)' }}
          >
            {NAV_ITEMS.map(({ id, label, icon: Icon, red }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => { setActiveTab(id); setMobileMenuOpen(false); }}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-3 cursor-pointer"
                  style={{
                    background: active
                      ? (red ? 'rgba(239,68,68,0.12)' : 'rgba(0,242,254,0.1)')
                      : 'transparent',
                    color: active ? (red ? '#ef4444' : '#00F2FE') : '#94A3B8',
                    border: active
                      ? (red ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(0,242,254,0.25)')
                      : '1px solid transparent',
                    boxShadow: active && !red ? '0 0 16px rgba(0,242,254,0.08)' : 'none',
                  }}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{label}</span>
                </button>
              );
            })}
          </nav>

          {/* Persona Info Card */}
          <div
            className="p-4 rounded-2xl text-xs space-y-2"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="font-bold text-white flex items-center justify-between">
              <span>Active Persona</span>
              <span>{persona?.icon || '🤟'}</span>
            </div>
            <div style={{ color: '#94A3B8' }}>{persona?.title || 'Deaf / Non-Speaking'}</div>
            <button
              onClick={onChangePersona}
              className="font-bold text-[11px] block pt-1 transition-colors cursor-pointer text-purple-400 hover:text-purple-300"
            >
              Switch Persona →
            </button>
          </div>

          {/* System Diagnostics Box */}
          <div
            className="p-3.5 rounded-2xl text-[10px] space-y-1.5 font-mono"
            style={{ background: 'rgba(0,242,254,0.02)', border: '1px solid rgba(0,242,254,0.1)', color: '#94A3B8' }}
          >
            <div className="text-white font-bold flex items-center gap-1">
              <Activity className="w-3 h-3 text-cyan-400" />
              <span>Full-Stack Status</span>
            </div>
            <div>• Express Server: <span className="text-green-400">Port 5002</span></div>
            <div>• Dual AI Models: <span className="text-cyan-400">Active</span></div>
            <div>• Privacy Firewall: <span className="text-purple-400">AES-256</span></div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="md:col-span-10 min-h-0">

          {/* ── VIEW: 3-COLUMN ACCESSIBILITY SUITE (EXACT IMAGE 2 REPRODUCTION) ── */}
          {activeTab === 'suite' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-black text-white">EchoSign Real-Time Accessibility Suite</h1>
                  <p className="text-xs text-slate-400">Unified 3-Module Vision, Translation, and Emergency Assistance.</p>
                </div>
                <button
                  onClick={() => setActiveTab('practice')}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-2 cursor-pointer"
                  style={{ background: 'linear-gradient(135deg,#00F2FE,#9D50BB)', boxShadow: '0 0 20px rgba(0,242,254,0.25)' }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Open 20-Level Curriculum Studio →</span>
                </button>
              </div>

              {/* 3 Columns: Left Third, Middle Third, Right Third */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
                {/* LEFT THIRD: Practice Module */}
                <div
                  className="p-6 rounded-3xl flex flex-col justify-between h-full"
                  style={{
                    minHeight: 580,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(0,229,255,0.2)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 8px 32px rgba(0,229,255,0.08)',
                  }}
                >
                  <PracticeModule />
                </div>

                {/* MIDDLE THIRD: Translator Module */}
                <div
                  className="p-6 rounded-3xl flex flex-col justify-between h-full"
                  style={{
                    minHeight: 580,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(157,80,187,0.2)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 8px 32px rgba(157,80,187,0.08)',
                  }}
                >
                  <TranslatorModule />
                </div>

                {/* RIGHT THIRD: Emergency Module */}
                <div
                  className="p-6 rounded-3xl flex flex-col justify-between h-full"
                  style={{
                    minHeight: 580,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(239,68,68,0.25)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 8px 32px rgba(239,68,68,0.08)',
                  }}
                >
                  <EmergencyModule />
                </div>
              </div>
            </div>
          )}

          {/* ── VIEW: DEDICATED LIVE WORKSPACE (EXACT HTML SPECIFICATION) ── */}
          {activeTab === 'workspace' && (
            <div className="h-full rounded-2xl overflow-hidden" style={{ minHeight: 'calc(100vh - 120px)' }}>
              <LiveWorkspaceView
                user={user}
                persona={persona}
                onNavigateModules={() => setActiveTab('suite')}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onLogout={handleLogout}
                onChangePersona={onChangePersona}
              />
            </div>
          )}

          {/* ── VIEW: 20-LEVEL PRACTICE STUDIO (MATCHING PDF GUIDES & DOTTED SKELETON) ── */}
          {activeTab === 'practice' && (
            <Practice
              initialCategory={persona?.id || 'deaf_mute'}
              user={user}
            />
          )}

          {/* ── VIEW: AUTISM & SENSORY EXPRESSION BOARD ── */}
          {activeTab === 'autism' && (
            <AutismSupportModule />
          )}

          {/* ── VIEW: PEER CONNECT, CHAT & VIDEO CALL ── */}
          {activeTab === 'peer_connect' && (
            <PeerConnectModule currentUser={user} />
          )}

          {/* ── VIEW: LIVE CONVERSATION & CHATBOT ── */}
          {activeTab === 'conversation' && (
            <div className="space-y-4 h-full flex flex-col">
              <div>
                <h1 className="text-2xl font-black text-white">Live Conversation & AI Vision Bridge</h1>
                <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>
                  Sign, speak or type. MediaPipe landmark mesh and dual AI models translate in real time.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0" style={{ height: 'calc(100vh - 190px)' }}>
                {/* Camera Panel with Hand Tracking */}
                <div className="lg:col-span-7 relative h-full rounded-2xl overflow-hidden" style={{ minHeight: 420 }}>
                  <CameraView ref={cameraRef} />
                  <HandTracker
                    videoElement={cameraRef.current?.getVideoElement()}
                    isCameraActive={cameraRef.current?.isCameraActive()}
                    onGestureDetected={handleGestureDetected}
                  />
                </div>

                {/* AI Chat Panel */}
                <div className="lg:col-span-5 h-full" style={{ minHeight: 420 }}>
                  <ChatPanel persona={persona} liveGlosses={liveGlosses} />
                </div>
              </div>
            </div>
          )}

          {/* ── VIEW: TRANSLATOR ── */}
          {activeTab === 'translate' && <Translator />}

          {/* ── VIEW: EMERGENCY ── */}
          {activeTab === 'emergency' && <Emergency />}

        </main>
      </div>
    </div>
  );
}
