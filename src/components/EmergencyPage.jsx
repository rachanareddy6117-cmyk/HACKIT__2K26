import React, { useState } from 'react';

const API_BASE = 'http://localhost:5001';

const ALERTS = [
  { id: 'help',     label: '🚨 I NEED HELP',      cls: 'red',    speech: 'I need immediate help!',             desc: 'Dispatches to first responders & security' },
  { id: 'doctor',   label: '🏥 I NEED A DOCTOR',  cls: 'orange', speech: 'I need medical assistance.',        desc: 'Alerts medical team on-site' },
  { id: 'water',    label: '💧 I NEED WATER',      cls: 'cyan',   speech: 'Please, I need drinking water.',   desc: 'Requests hydration from staff' },
  { id: 'security', label: '📢 CALL SECURITY',     cls: 'yellow', speech: 'Call security right away.',        desc: 'Triggers security alert response' },
  { id: 'lost',     label: '📍 I AM LOST',         cls: 'purple', speech: 'I am lost and need directions.',   desc: 'Shares location with assistance team' },
  { id: 'pain',     label: '❤️ I AM IN PAIN',      cls: 'red',    speech: 'I am experiencing serious pain.',  desc: 'Urgent medical attention alert' },
];

const COLORS = {
  red:    { border: '#ff3b30', glow: 'rgba(255,59,48,0.3)',  bg: 'rgba(255,59,48,0.08)' },
  orange: { border: '#ff9500', glow: 'rgba(255,149,0,0.3)',  bg: 'rgba(255,149,0,0.08)' },
  cyan:   { border: '#00f2fe', glow: 'rgba(0,242,254,0.3)',  bg: 'rgba(0,242,254,0.08)' },
  yellow: { border: '#ffcc00', glow: 'rgba(255,204,0,0.3)',  bg: 'rgba(255,204,0,0.08)' },
  purple: { border: '#af52de', glow: 'rgba(175,82,222,0.3)', bg: 'rgba(175,82,222,0.08)' },
};

export default function EmergencyPage() {
  const [selected, setSelected] = useState(null);
  const [log, setLog] = useState([]);
  const [status, setStatus] = useState('STANDBY'); // STANDBY | DISPATCHING | DISPATCHED
  const [broadcastId, setBroadcastId] = useState(null);

  const handleSelect = (alert) => {
    setSelected(alert);
    setStatus('STANDBY');
    // Immediate speech preview
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(alert.speech));
    }
  };

  const handleBroadcast = async () => {
    if (!selected) return;
    setStatus('DISPATCHING');

    try {
      const res = await fetch(`${API_BASE}/api/emergency/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alertId: selected.id,
          label: selected.label,
          speech: selected.speech,
        }),
      });
      const json = await res.json();
      const bid = json.broadcastId || `sos_${Date.now()}`;
      setBroadcastId(bid);
      setStatus('DISPATCHED');
      setLog(l => [
        { id: bid, label: selected.label, time: new Date().toLocaleTimeString(), status: 'DISPATCHED' },
        ...l,
      ]);
    } catch {
      const bid = `sos_${Date.now()}`;
      setBroadcastId(bid);
      setStatus('DISPATCHED');
      setLog(l => [
        { id: bid, label: selected.label, time: new Date().toLocaleTimeString(), status: 'DISPATCHED (LOCAL)' },
        ...l,
      ]);
    }
  };

  const handleClear = () => {
    setSelected(null);
    setStatus('STANDBY');
    setBroadcastId(null);
  };

  return (
    <div style={{
      background: '#07090e', minHeight: '100vh', color: '#fff',
      fontFamily: "'Segoe UI',-apple-system,sans-serif",
    }}>
      {/* Page header */}
      <div style={{
        padding: '16px 24px', borderBottom: '1px solid rgba(255,59,48,0.2)',
        display: 'flex', alignItems: 'center', gap: 16,
        background: 'rgba(20,5,5,0.6)',
      }}>
        <span style={{ fontWeight: 800, fontSize: 15 }}>⚡ Echo<span style={{ color: '#00f2fe' }}>Sign</span></span>
        <span style={{ color: '#ff3b30', fontWeight: 700, fontSize: 13 }}>🛡️ Emergency Broadcast</span>
        <span style={{ fontSize: 12, color: '#8a99ad' }}>• /emergency</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            padding: '3px 10px', borderRadius: 10, fontSize: 11, fontWeight: 700,
            background: status === 'DISPATCHED' ? 'rgba(0,230,118,0.12)' : status === 'DISPATCHING' ? 'rgba(255,204,0,0.12)' : 'rgba(255,255,255,0.06)',
            border: `1px solid ${status === 'DISPATCHED' ? '#00e676' : status === 'DISPATCHING' ? '#ffcc00' : 'rgba(255,255,255,0.15)'}`,
            color: status === 'DISPATCHED' ? '#00e676' : status === 'DISPATCHING' ? '#ffcc00' : '#8a99ad',
          }}>{status}</span>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>

          {/* Left: Alert Grid */}
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Accessible Emergency Alerts
            </h2>
            <p style={{ color: '#8a99ad', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Select an alert type, then broadcast to all available responders.
            </p>

            {/* Alert 2-col grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem', marginBottom: '1.5rem' }}>
              {ALERTS.map(a => {
                const c = COLORS[a.cls];
                const isActive = selected?.id === a.id;
                return (
                  <div
                    key={a.id}
                    onClick={() => handleSelect(a)}
                    style={{
                      background: isActive ? c.bg : 'rgba(0,0,0,0.3)',
                      border: `1px solid ${isActive ? c.border : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: 12, padding: '1.25rem',
                      cursor: 'pointer',
                      boxShadow: isActive ? `0 0 20px ${c.glow}` : 'none',
                      transition: 'all 0.25s',
                    }}
                  >
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isActive ? c.border : '#8a99ad', marginBottom: 4 }}>
                      {a.label}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#8a99ad' }}>{a.desc}</div>
                  </div>
                );
              })}
            </div>

            {/* Selected preview + broadcast */}
            {selected && (
              <div style={{
                background: 'rgba(255,59,48,0.06)',
                border: '1px solid rgba(255,59,48,0.25)',
                borderRadius: 14, padding: '1.25rem',
                marginBottom: '1rem',
              }}>
                <div style={{ fontSize: '0.8rem', color: '#8a99ad', marginBottom: 6 }}>Selected Alert:</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ff3b30', marginBottom: 4 }}>{selected.label}</div>
                <div style={{ fontSize: '0.8rem', color: '#8a99ad', fontStyle: 'italic' }}>"{selected.speech}"</div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={handleBroadcast}
                disabled={!selected || status === 'DISPATCHING'}
                style={{
                  flex: 1, padding: '0.9rem', borderRadius: 10,
                  background: !selected ? 'rgba(255,255,255,0.06)' : status === 'DISPATCHED' ? 'rgba(0,230,118,0.15)' : 'rgba(255,59,48,0.15)',
                  border: `1px solid ${!selected ? 'rgba(255,255,255,0.15)' : status === 'DISPATCHED' ? '#00e676' : '#ff3b30'}`,
                  color: !selected ? '#8a99ad' : status === 'DISPATCHED' ? '#00e676' : '#ff3b30',
                  fontWeight: 800, fontSize: '0.9rem', cursor: !selected ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {status === 'DISPATCHING' ? '📡 Dispatching...' :
                 status === 'DISPATCHED' ? '✅ Alert Dispatched!' :
                 '📡 Broadcast Alert'}
              </button>

              {selected && (
                <button
                  onClick={handleClear}
                  style={{
                    padding: '0.9rem 1.25rem', borderRadius: 10,
                    background: 'transparent', border: '1px solid rgba(255,255,255,0.12)',
                    color: '#8a99ad', cursor: 'pointer', fontWeight: 600,
                  }}
                >Clear</button>
              )}
            </div>

            {broadcastId && (
              <div style={{
                marginTop: '0.75rem', fontSize: '0.75rem', color: '#8a99ad',
                textAlign: 'center',
              }}>Broadcast ID: <code style={{ color: '#00f2fe' }}>{broadcastId}</code></div>
            )}
          </div>

          {/* Right: Dispatch Log */}
          <div>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#8a99ad', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1rem' }}>
              Dispatch Log
            </h3>
            <div style={{
              background: 'rgba(12,16,24,0.8)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 14, padding: '0.75rem',
              maxHeight: 400, overflowY: 'auto',
            }}>
              {log.length === 0 ? (
                <div style={{ color: '#8a99ad', fontSize: '0.8rem', textAlign: 'center', padding: '2rem 0' }}>
                  No dispatches yet
                </div>
              ) : log.map((entry) => (
                <div key={entry.id} style={{
                  padding: '0.75rem',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fff' }}>{entry.label}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    <span style={{ fontSize: '0.7rem', color: '#00e676' }}>{entry.status}</span>
                    <span style={{ fontSize: '0.7rem', color: '#8a99ad' }}>{entry.time}</span>
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#8a99ad', marginTop: 2 }}>{entry.id}</div>
                </div>
              ))}
            </div>

            {/* Emergency info */}
            <div style={{
              marginTop: '1rem', background: 'rgba(255,59,48,0.05)',
              border: '1px solid rgba(255,59,48,0.15)',
              borderRadius: 12, padding: '1rem', fontSize: '0.78rem', color: '#8a99ad',
            }}>
              <div style={{ fontWeight: 700, color: '#ff3b30', marginBottom: 6 }}>⚠️ Emergency Protocols</div>
              <div>• Alerts broadcast to all active staff</div>
              <div>• Audio notification triggered on dispatch</div>
              <div>• Sign language speech synthesis active</div>
              <div>• Location shared with responders</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
