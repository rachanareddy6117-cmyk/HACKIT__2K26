import React, { useRef, useState } from 'react';
import CameraView from './CameraView';
import HandTracker from './HandTracker';
import ChatPanel from './ChatPanel';
import Practice from './Practice';
import Translator from './Translator';
import Emergency from './Emergency';
import Logo from './Logo';
import {
  MessageSquare, Award, Globe, ShieldAlert, LogOut, User, Menu, X
} from 'lucide-react';
import { clearSession } from '../utils/storage';

const NAV_ITEMS = [
  { id: 'conversation', label: 'Conversation', icon: MessageSquare },
  { id: 'practice',     label: 'Practice',     icon: Award },
  { id: 'translate',    label: 'Translate',     icon: Globe },
  { id: 'emergency',    label: 'Emergency',     icon: ShieldAlert, red: true },
];

export default function Dashboard({ user, persona, onLogout, onChangePersona }) {
  const [activeTab,       setActiveTab]       = useState('conversation');
  const [mobileMenuOpen,  setMobileMenuOpen]  = useState(false);
  const cameraRef = useRef(null);

  const handleLogout = () => { clearSession(); onLogout(); };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: '#0B0E14', color: '#fff' }}
    >
      {/* ── Top Header ── */}
      <header
        className="sticky top-0 z-40 px-5 py-3.5 flex items-center justify-between"
        style={{
          background: 'rgba(5,7,10,0.9)',
          border: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
      >
        <div className="flex items-center gap-4">
          <Logo size="small" />
          {persona && (
            <button
              onClick={onChangePersona}
              className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition-all"
              style={{
                background: 'rgba(0,242,254,0.07)',
                border: '1px solid rgba(0,242,254,0.2)',
                color: '#00F2FE',
              }}
            >
              <span>{persona.icon || '🤟'}</span>
              <span>{persona.title || 'Deaf / Non-Speaking'}</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#94A3B8' }}
          >
            <User className="w-4 h-4" style={{ color: '#9D50BB' }} />
            <span>{user?.name || user?.email || 'Demo User'}</span>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 rounded-xl transition-all"
            style={{ color: '#475569' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.background = 'transparent'; }}
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl"
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
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-3"
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
            <div className="font-bold text-white">Active Module</div>
            <div style={{ color: '#94A3B8' }}>{persona?.title || 'Deaf / Non-Speaking'}</div>
            <button
              onClick={onChangePersona}
              className="font-bold text-[10px] block pt-1 transition-colors"
              style={{ color: '#9D50BB' }}
            >
              Switch Module →
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="md:col-span-10 min-h-0">

          {/* CONVERSATION */}
          {activeTab === 'conversation' && (
            <div className="space-y-4 h-full flex flex-col">
              <div>
                <h1 className="text-2xl font-black text-white">Let's start a conversation.</h1>
                <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>
                  Sign, speak or type. EchoSign adapts in real time.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0" style={{ height: 'calc(100vh - 200px)' }}>
                {/* Camera Panel */}
                <div className="lg:col-span-7 relative h-full" style={{ minHeight: 420 }}>
                  <CameraView ref={cameraRef} />
                  <HandTracker
                    videoElement={cameraRef.current?.getVideoElement()}
                    isCameraActive={cameraRef.current?.isCameraActive()}
                    onGestureDetected={() => {}}
                  />
                </div>

                {/* Chat Panel */}
                <div className="lg:col-span-5 h-full" style={{ minHeight: 420 }}>
                  <ChatPanel persona={persona} />
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
