import React, { useState } from 'react';
import { Volume2, ArrowRight, Sparkles } from 'lucide-react';
import { translateApi } from '../services/api';

const TABS = ['TEXT', 'SPEECH', 'SIGN'];

export default function TranslatorModule() {
  const [tab,    setTab]    = useState('TEXT');
  const [input,  setInput]  = useState('Hello');
  const [result, setResult] = useState({
    output: 'HELLO 👋',
    speech: 'Hello! Nice to meet you.'
  });
  const [loading, setLoading] = useState(false);

  const translate = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    try {
      const res = await translateApi(input.trim(), tab);
      setResult(res);
    } catch {
      setResult({
        output: `${input.toUpperCase()} 🤟`,
        speech: input
      });
    } finally {
      setLoading(false);
    }
  };

  const speak = () => {
    if (result?.speech && window.speechSynthesis) {
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(result.speech));
    }
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:18, height:'100%' }}>
      {/* Header */}
      <div>
        <div style={{ fontSize:11, fontWeight:800, color:'#A78BFA', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:4 }}>
          MIDDLE THIRD • Translator Module
        </div>
        <h2 style={{ fontSize:20, fontWeight:900, color:'#fff' }}>Everyday Translation</h2>
      </div>

      {/* Tabs */}
      <div style={{
        display:'flex', gap:2, padding:4,
        background:'rgba(255,255,255,0.04)',
        border:'1px solid rgba(255,255,255,0.07)',
        borderRadius:12, width:'fit-content',
      }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding:'6px 16px', borderRadius:9,
            fontSize:12, fontWeight:700, cursor:'pointer',
            background: tab === t
              ? 'linear-gradient(135deg,rgba(0,229,255,0.18),rgba(157,80,187,0.18))'
              : 'transparent',
            color: tab === t ? '#00e5ff' : '#94a3b8',
            border: tab === t ? '1px solid rgba(0,229,255,0.25)' : '1px solid transparent',
            transition:'all .2s',
          }}>{t}</button>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={translate} style={{ display:'flex', flexDirection:'column', gap:10 }}>
        <textarea
          rows={3}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="e.g. Hello, Yes, Stop, Water..."
          style={{
            background:'rgba(255,255,255,0.04)',
            border:'1px solid rgba(255,255,255,0.09)',
            borderRadius:14, padding:'12px 14px',
            color:'#fff', fontSize:14, fontWeight:500,
            resize:'none', outline:'none', fontFamily:'inherit',
            transition:'border-color .2s',
          }}
          onFocus={e => { e.currentTarget.style.borderColor='rgba(0,229,255,0.35)'; }}
          onBlur={e  => { e.currentTarget.style.borderColor='rgba(255,255,255,0.09)'; }}
        />
        <button type="submit" disabled={!input.trim() || loading} style={{
          background:'linear-gradient(135deg,#00e5ff,#9d50bb)',
          color:'#fff', border:'none', cursor:'pointer',
          padding:'10px', borderRadius:12, fontWeight:700, fontSize:13,
          display:'flex', alignItems:'center', justifyContent:'center', gap:6,
          opacity: !input.trim() ? 0.45 : 1,
          boxShadow:'0 0 20px rgba(0,229,255,0.2)',
        }}>
          {loading ? 'Translating...' : <>Translate <ArrowRight size={14}/></>}
        </button>
      </form>

      {/* Output */}
      <div style={{
        flex:1, borderRadius:16, padding:18,
        background:'#05070a',
        border:'1px solid rgba(0,229,255,0.15)',
        display:'flex', flexDirection:'column', gap:12, justifyContent:'space-between',
        minHeight:120,
      }}>
        {result ? (
          <>
            <div style={{ fontSize:42, fontWeight:900, color:'#00e5ff', letterSpacing:'-0.02em' }}>
              {result.output}
            </div>
            <div style={{
              fontSize:12, padding:'8px 12px', borderRadius:10,
              background:'rgba(255,255,255,0.04)',
              border:'1px solid rgba(255,255,255,0.07)',
              color:'#94a3b8', fontFamily:'monospace',
            }}>
              Audio Speech: {result.speech}
            </div>
            <button onClick={speak} style={{
              background:'rgba(0,229,255,0.1)',
              border:'1px solid rgba(0,229,255,0.3)',
              color:'#00e5ff', cursor:'pointer',
              padding:'10px', borderRadius:12,
              fontWeight:700, fontSize:13,
              display:'flex', alignItems:'center', justifyContent:'center', gap:6,
              transition:'all .2s',
            }}
            onMouseEnter={e=>e.currentTarget.style.background='rgba(0,229,255,0.18)'}
            onMouseLeave={e=>e.currentTarget.style.background='rgba(0,229,255,0.1)'}
            >
              <Volume2 size={15}/> Speak Output Audio
            </button>
          </>
        ) : (
          <div style={{ color:'#2e3f55', fontSize:13, fontStyle:'italic', textAlign:'center', marginTop:24 }}>
            Translation output appears here
          </div>
        )}
      </div>
    </div>
  );
}
