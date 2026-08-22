import React, { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import Logo from './Logo';
import { setStoredItem, STORAGE_KEYS } from '../utils/storage';

const PERSONAS = [
  { id: 'deaf_hoh',         icon: '🤟', label: 'SIGN ↔ SPEECH',        title: 'Deaf / Non-Speaking',       desc: 'Real-time sign communication with captions and speech.',   features: ['Live Camera','Captions','Speech Output'], accent: '#00F2FE' },
  { id: 'autism_support',   icon: '🧩', label: 'CALM COMMUNICATION',    title: 'Autism Spectrum',           desc: 'A calm and predictable communication experience.',         features: ['Calm Mode','Visual Prompts','AI Support'],   accent: '#9D50BB' },
  { id: 'introvert_coach',  icon: '🌱', label: 'SOCIAL SUPPORT',        title: 'Introvert Confidence',      desc: 'Practice conversations before real interactions.',         features: ['Coach','Practice','Suggestions'],            accent: '#00F2FE' },
  { id: 'sign_learner',     icon: '📚', label: 'LEARN & PRACTICE',      title: 'Sign Language Learner',     desc: 'Practice signs and receive instant feedback.',            features: ['Learn Signs','Practice','Feedback'],         accent: '#9D50BB' },
  { id: 'general_translator',icon: '🌎',label: 'EVERYDAY TRANSLATION',  title: 'General Translator',        desc: 'Translate between speech, text and sign.',                features: ['Speech','Text','Sign'],                      accent: '#00F2FE' },
  { id: 'explore_all',      icon: '✨', label: 'EXPLORE ECHOSIGN',      title: 'Others',                    desc: 'Explore EchoSign accessibility tools.',                   features: ['AI Assistant','Translation','Tools'],        accent: '#9D50BB' },
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
      className="min-h-screen flex flex-col px-6 py-14 bg-cyber-grid"
      style={{ background: 'linear-gradient(180deg,#05070A,#0B0E14)' }}
    >
      <div className="max-w-5xl mx-auto w-full space-y-10">
        <div className="text-center space-y-3">
          <Logo size="medium" className="justify-center mb-4" />
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            How can EchoSign{' '}
            <span style={{
              background: 'linear-gradient(90deg,#00F2FE,#9D50BB)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>help you?</span>
          </h1>
          <p className="text-sm font-medium" style={{ color: '#94A3B8' }}>
            Choose a module that matches how you communicate.
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
                className="relative p-6 rounded-3xl flex flex-col gap-4 cursor-pointer transition-all duration-200"
                style={{
                  background: isSelected ? `${p.accent}08` : 'rgba(255,255,255,0.03)',
                  border: isSelected ? `1px solid ${p.accent}50` : '1px solid rgba(255,255,255,0.07)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  boxShadow: isSelected ? `0 0 40px ${p.accent}12` : 'none',
                }}
              >
                {/* Check Badge */}
                {isSelected && (
                  <div
                    className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: p.accent, boxShadow: `0 0 14px ${p.accent}60` }}
                  >
                    <Check className="w-4 h-4 text-black" strokeWidth={3} />
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <span className="text-3xl">{p.icon}</span>
                  <div>
                    <span
                      className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                      style={{ background: `${p.accent}14`, color: p.accent, border: `1px solid ${p.accent}30` }}
                    >
                      {p.label}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1">{p.title}</h3>
                  </div>
                </div>

                <p className="text-xs leading-relaxed" style={{ color: '#94A3B8' }}>{p.desc}</p>

                <div className="flex flex-wrap gap-1.5 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  {p.features.map(f => (
                    <span
                      key={f}
                      className="text-[10px] font-bold px-2.5 py-1 rounded-lg"
                      style={{ background: 'rgba(255,255,255,0.05)', color: '#94A3B8' }}
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
            className="px-10 py-4 rounded-2xl font-bold text-base flex items-center gap-3 transition-all"
            style={{
              background: 'linear-gradient(135deg,#00F2FE,#9D50BB)',
              color: '#fff',
              boxShadow: '0 0 40px rgba(0,242,254,0.25)',
            }}
          >
            Continue to Dashboard <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
