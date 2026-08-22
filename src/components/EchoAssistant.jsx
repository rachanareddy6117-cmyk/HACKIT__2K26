import React, { useState, useRef } from 'react';
import { Send, Sparkles, Trash2, Volume2 } from 'lucide-react';
import { sendChatMessage } from '../services/api';

function getWelcome(personaId) {
  if (personaId === 'deaf_hoh')       return "Your communication mode is optimised for visual interaction. Live sign detection captions appear over your video feed.";
  if (personaId === 'autism_support') return "Let's take this one step at a time. I'm here to provide calm, predictable support whenever you need it.";
  if (personaId === 'introvert_coach')return "Would you like to practice a conversation? Feel free to try out responses here at your own pace.";
  return "Hi! I'm Echo Assistant. Sign, speak or type — I'll help translate and communicate in real time.";
}

export default function EchoAssistant({ persona }) {
  const personaId = persona?.id || 'deaf_hoh';
  const [messages, setMessages] = useState([{
    id: 1, sender:'ai',
    text: getWelcome(personaId),
    time: new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}),
  }]);
  const [input,   setInput]   = useState('');
  const [typing,  setTyping]  = useState(false);
  const bottomRef = useRef(null);

  const scrollDown = () => setTimeout(() => bottomRef.current?.scrollIntoView({ behavior:'smooth' }), 50);

  const send = async (e) => {
    e?.preventDefault();
    if (!input.trim() || typing) return;

    const text = input.trim();
    const userMsg = { id: Date.now(), sender:'user', text, time: new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);
    scrollDown();

    // Try real backend (Gemini / Claude)
    const res = await sendChatMessage({ message: text, personaCategory: personaId });
    let reply = res?.reply;

    // Fallback if backend unavailable
    if (!reply) {
      if (personaId === 'deaf_hoh')       reply = `[Sign Translator]: "${text.toUpperCase()}" 🤟 — translated. Need another sign?`;
      else if (personaId === 'autism_support') reply = `[Sensory Guide]: Let's approach "${text}" calmly, step by step. You're in full control.`;
      else reply = `I heard: "${text}" — how can I help you communicate this?`;
    }

    setMessages(prev => [...prev, {
      id: Date.now()+1, sender:'ai', text: reply,
      time: new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}),
      provider: res?.provider,
    }]);
    setTyping(false);
    scrollDown();
  };

  const speak = (text) => window.speechSynthesis?.speak(new SpeechSynthesisUtterance(text));

  return (
    <div style={{
      display:'flex', flexDirection:'column',
      background:'rgba(255,255,255,0.03)',
      border:'1px solid rgba(255,255,255,0.07)',
      borderRadius:20, overflow:'hidden', height:'100%',
    }}>
      {/* Header */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'12px 16px',
        borderBottom:'1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{
            width:34, height:34, borderRadius:10,
            background:'rgba(0,229,255,0.1)',
            border:'1px solid rgba(0,229,255,0.28)',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <Sparkles size={16} color="#00e5ff"/>
          </div>
          <div>
            <div style={{ fontWeight:800, fontSize:14, color:'#fff' }}>Echo Assistant</div>
            <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, fontWeight:600 }}>
              <span style={{
                width:7, height:7, borderRadius:'50%', background:'#22c55e',
                boxShadow:'0 0 6px #22c55e', display:'inline-block',
              }}/>
              <span style={{ color:'#22c55e' }}>AI Online</span>
            </div>
          </div>
        </div>
        <button onClick={() => setMessages([])} style={{
          background:'none', border:'none', cursor:'pointer', color:'#475569', padding:6, borderRadius:8,
        }}
        onMouseEnter={e=>e.currentTarget.style.color='#94a3b8'}
        onMouseLeave={e=>e.currentTarget.style.color='#475569'}
        >
          <Trash2 size={15}/>
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflowY:'auto', padding:'14px 14px 8px', display:'flex', flexDirection:'column', gap:10 }}>
        {messages.map(m => (
          <div key={m.id} style={{ display:'flex', flexDirection:'column', alignItems: m.sender==='user'?'flex-end':'flex-start' }}>
            <div style={{
              maxWidth:'88%', padding:'10px 14px', borderRadius: m.sender==='user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              fontSize:12, lineHeight:1.6, fontWeight:500,
              ...(m.sender==='user' ? {
                background:'linear-gradient(135deg,rgba(0,229,255,0.2),rgba(157,80,187,0.2))',
                border:'1px solid rgba(0,229,255,0.28)',
                color:'#fff',
              } : {
                background:'rgba(255,255,255,0.05)',
                border:'1px solid rgba(255,255,255,0.08)',
                color:'#94a3b8',
              }),
            }}>
              {m.text}
              {m.sender==='ai' && (
                <div style={{
                  display:'flex', justifyContent:'space-between', alignItems:'center',
                  marginTop:6, paddingTop:6,
                  borderTop:'1px solid rgba(255,255,255,0.06)',
                  fontSize:10, color:'#475569',
                }}>
                  <span>{m.time}{m.provider ? ` · ${m.provider}` : ''}</span>
                  <button onClick={()=>speak(m.text)} style={{
                    background:'none', border:'none', cursor:'pointer', color:'#00e5ff', padding:0,
                  }}>
                    <Volume2 size={12}/>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {typing && (
          <div style={{ display:'flex', gap:5, padding:'8px 4px' }}>
            {[0,1,2].map(i => (
              <span key={i} className="anim-bounce" style={{
                width:7, height:7, borderRadius:'50%', background:'#00e5ff', display:'inline-block',
                animationDelay:`${i*0.18}s`,
              }}/>
            ))}
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <form onSubmit={send} style={{
        display:'flex', gap:8, padding:'10px 12px',
        borderTop:'1px solid rgba(255,255,255,0.06)',
      }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your message..."
          style={{
            flex:1, background:'rgba(255,255,255,0.05)',
            border:'1px solid rgba(255,255,255,0.08)',
            borderRadius:12, padding:'9px 14px',
            color:'#fff', fontSize:13, outline:'none', fontFamily:'inherit',
            transition:'border-color .2s',
          }}
          onFocus={e => e.currentTarget.style.borderColor='rgba(0,229,255,0.3)'}
          onBlur={e  => e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'}
        />
        <button type="submit" disabled={!input.trim() || typing} style={{
          background:'linear-gradient(135deg,#00e5ff,#9d50bb)',
          border:'none', borderRadius:12, padding:'9px 13px',
          color:'#fff', cursor:'pointer',
          opacity: !input.trim() ? 0.45 : 1,
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          <Send size={15}/>
        </button>
      </form>
    </div>
  );
}
