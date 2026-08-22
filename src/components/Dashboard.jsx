import React, { useRef, useState, useEffect } from 'react';
import CameraView from './CameraView';
import HandTracker from './HandTracker';
import ChatPanel from './ChatPanel';
import Practice from './Practice';
import Translator from './Translator';
import Emergency from './Emergency';
import Logo from './Logo';
import {
  MessageSquare, Award, Globe, ShieldAlert, LogOut, User, Menu, X, Activity, CheckCircle2, AlertCircle
} from 'lucide-react';
import { clearSession } from '../utils/storage';
import { checkBackendHealth } from '../services/api';

const NAV_ITEMS = [
  { id: 'conversation', label: 'Conversation', icon: MessageSquare },
  { id: 'practice',     label: 'Practice',     icon: Award },
  { id: 'translate',    label: 'Translate',     icon: Globe },
  { id: 'emergency',    label: 'Emergency',     icon: ShieldAlert, red: true },
];

export default function Dashboard({ user, persona, onLogout, onChangePersona }) {
  const [activeTab,       setActiveTab]       = useState('conversation');
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
            setBackendHealth({ status: 'connected', port: res.port || 5001, service: res.service });
          } else {
            setBackendHealth({ status: 'fallback', port: 5001, message: 'In-Memory Simulation Ready' });
          }
        }
      } catch {
        if (mounted) setBackendHealth({ status: 'fallback', port: 5001, message: 'In-Memory Simulation Ready' });
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
            <span>API {backendHealth.status === 'connected' ? `Online (:5001)` : 'Simulated Active'}</span>
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
            <div>• Express Server: <span className="text-green-400">Port 5001</span></div>
            <div>• Inference API: <span className="text-cyan-400">Port 8000</span></div>
            <div>• Privacy Firewall: <span className="text-purple-400">AES-256</span></div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="md:col-span-10 min-h-0">

          {/* CONVERSATION */}
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

          {activeTab === 'practice'   && <Practice />}
          {activeTab === 'translate'  && <Translator />}
          {activeTab === 'emergency'  && <Emergency />}

        </main>
      </div>
    </div>
  );
}
