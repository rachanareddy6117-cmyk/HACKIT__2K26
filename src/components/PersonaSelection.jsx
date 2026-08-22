import React, { useState } from 'react';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import Logo from './Logo';
import { setStoredItem, STORAGE_KEYS } from '../utils/storage';

const PERSONAS = [
  { id: 'deaf_hoh',         icon: '🤟', label: 'SIGN ↔ SPEECH',        title: 'Deaf & Hard of Hearing',    desc: 'Real-time sign communication with live captions and speech output from PDF 1 Guide.',   features: ['20-Level ASL','Vision Mesh','Captions'], accent: '#00e5ff' },
  { id: 'autism_support',   icon: '🧩', label: 'CALM COMMUNICATION',    title: 'Autism Spectrum Support',   desc: 'Calm and predictable communication with action symbols from PDF 2 Guide.',              features: ['Sensory Mode','Symbol Prompts','AI Bridge'], accent: '#9d50bb' },
  { id: 'introvert_coach',  icon: '🌱', label: 'SOCIAL CONFIDENCE',     title: 'Introvert Coach',           desc: 'Practice conversations with micro-scripts before real interactions.',                   features: ['Low Pressure','Practice Scripts','Feedback'], accent: '#00e5ff' },
  { id: 'sign_learner',     icon: '📚', label: 'LEARN & PRACTICE',      title: 'Sign Language Learner',     desc: 'Interactive camera studio with dotted line skeleton matching and XP.',                  features: ['Dotted Guide','5s Auto Advance','100 Modules'], accent: '#f59e0b' },
  { id: 'general_translator',icon: '🌎',label: 'EVERYDAY TRANSLATION',  title: 'Everyday Translator',       desc: 'Translate between speech audio, text phrases, and manual signs.',                      features: ['Speech-to-Sign','Sign-to-Speech','TTS'], accent: '#ec4899' },
  { id: 'explore_all',      icon: '✨', label: 'ACCESSIBILITY SUITE',   title: 'All-in-One Suite',          desc: 'Unified 3-column practice, everyday translation, and emergency alerts.',               features: ['3-Column Suite','Emergency SOS','AI Assist'], accent: '#22c55e' },
];

export default function PersonaSelection({ onSelectPersona }) {
  const [selectedId, setSelectedId] = useState('deaf_hoh');

  const handleConfirm = () => {
    const persona = PERSONAS.find(p => p.id === selectedId) || PERSONAS[0];
    setStoredItem(STORAGE_KEYS.PERSONA, persona.id);
    onSelectPersona(persona);
  };

  return (
    <div
      className="min-h-screen flex flex-col px-6 py-14 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #05070a 0%, #0b0e14 100%)', color: '#fff' }}
    >
      {/* Background glow blobs */}
      <div style={{
        position: 'absolute', top: '-160px', left: '-160px',
        width: 520, height: 520, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,229,255,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }}/>
      <div style={{
        position: 'absolute', bottom: '-120px', right: '-80px',
        width: 440, height: 440, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(157,80,187,0.09) 0%, transparent 70%)',
        pointerEvents: 'none',
      }}/>
      {/* Cyber Grid */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.5,
        backgroundImage: 'linear-gradient(rgba(0,229,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.03) 1px, transparent 1px)',
        backgroundSize: '44px 44px',
      }}/>

      <div className="max-w-5xl mx-auto w-full space-y-10 relative z-10">
        <div className="text-center space-y-3">
          <Logo size="medium" className="justify-center mb-4" />
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            How can <span className="grad-text">EchoSign</span> help you?
          </h1>
          <p className="text-sm font-medium text-slate-400 max-w-lg mx-auto">
            Select a tailored communication mode matching your accessibility needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {PERSONAS.map(p => {
            const isSelected = selectedId === p.id;
            return (
              <div
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                role="button"
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setSelectedId(p.id); }}
                className="relative p-6 rounded-3xl flex flex-col justify-between gap-4 cursor-pointer transition-all duration-300 group"
                style={{
                  background: isSelected ? `${p.accent}10` : 'rgba(255,255,255,0.04)',
                  border: isSelected ? `2px solid ${p.accent}` : '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: isSelected ? `0 0 36px ${p.accent}25` : '0 4px 20px rgba(0,0,0,0.2)',
                  transform: isSelected ? 'translateY(-3px)' : 'none',
                }}
                onMouseEnter={e => {
                  if (!isSelected) {
                    e.currentTarget.style.border = `1px solid ${p.accent}50`;
                    e.currentTarget.style.boxShadow = `0 0 28px ${p.accent}15`;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isSelected) {
                    e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';
                    e.currentTarget.style.transform = 'none';
                  }
                }}
              >
                {/* Check Badge */}
                {isSelected && (
                  <div
                    className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center shadow-lg"
                    style={{ background: p.accent, color: '#000' }}
                  >
                    <Check className="w-4 h-4" strokeWidth={3} />
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                      style={{ background: `${p.accent}18`, border: `1px solid ${p.accent}35` }}
                    >
                      {p.icon}
                    </div>
                    <div>
                      <span
                        className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                        style={{ background: `${p.accent}14`, color: p.accent, border: `1px solid ${p.accent}30` }}
                      >
                        {p.label}
                      </span>
                      <h3 className="text-base font-bold text-white mt-1 group-hover:text-cyan-300 transition-colors">{p.title}</h3>
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed text-slate-400">{p.desc}</p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-3 border-t border-white/10">
                  {p.features.map(f => (
                    <span
                      key={f}
                      className="text-[10px] font-bold px-2.5 py-1 rounded-lg"
                      style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }}
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center pt-2">
          <button
            onClick={handleConfirm}
            className="px-10 py-4 rounded-2xl font-bold text-base flex items-center gap-3 transition-all cursor-pointer"
            style={{
              background: 'linear-gradient(135deg,#00e5ff,#9d50bb)',
              color: '#fff',
              border: 'none',
              boxShadow: '0 0 30px rgba(0,229,255,0.35)',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 44px rgba(0,229,255,0.55)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 30px rgba(0,229,255,0.35)'; e.currentTarget.style.transform = 'none'; }}
          >
            <span>Continue to Dashboard</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
