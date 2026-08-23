import React, { useState, useRef, useEffect } from 'react';
import {
  Phone, Video, PhoneOff, Mic, MicOff, VideoOff, Send, Sparkles,
  User, CheckCheck, Smile, Volume2, Globe, ShieldCheck, MoreVertical,
  UserPlus, Copy, Check, Link, Users, MessageSquare
} from 'lucide-react';
import CameraView from './CameraView';
import { createPeerInviteApi, sendPeerMessageApi, signalPeerCallApi } from '../services/api';

const DEFAULT_CONTACTS = [
  { id: 'mentor', name: 'Dr. Sharma (ASL Specialist)', role: 'Certified Sign Interpreter', avatar: '👨‍🏫', status: 'online', color: '#00f2fe' },
  { id: 'peer', name: 'Rachana Reddy (Friend)', role: 'Deaf Accessibility Peer', avatar: '👩‍💻', status: 'online', color: '#9d50bb' },
  { id: 'caregiver', name: 'Alex Caregiver', role: 'Support Coordinator', avatar: '🤝', status: 'busy', color: '#f59e0b' },
  { id: 'learner', name: 'Priya (Sign Learner)', role: 'Level 4 Practice Partner', avatar: '🎓', status: 'online', color: '#10b981' },
];

const INITIAL_CHATS = {
  mentor: [
    { id: 1, sender: 'them', text: 'Hello! I noticed you are practicing the ASL letter shapes today. How is the hand alignment going?', time: '10:42 AM' },
    { id: 2, sender: 'me', text: 'Hello Dr. Sharma! The dotted skeleton guide helps with the thumb position on Letter A.', time: '10:44 AM' },
    { id: 3, sender: 'them', text: 'Excellent. Keep your fingers firmly pressed against your palm for maximum accuracy.', time: '10:45 AM', signTag: 'ASL_A ✊' }
  ],
  peer: [
    { id: 1, sender: 'them', text: 'Hey! Are you free for a quick sign language practice video call?', time: '11:15 AM' },
    { id: 2, sender: 'me', text: 'Yes! Starting our video session now with live captioning on.', time: '11:16 AM' }
  ],
  caregiver: [
    { id: 1, sender: 'them', text: 'All your sensory room settings are synchronized. Let me know if you need anything.', time: '09:30 AM' }
  ],
  learner: [
    { id: 1, sender: 'them', text: 'Hi! Let’s practice Level 3 numbers together.', time: 'Yesterday' }
  ]
};

export default function PeerConnectModule({ currentUser }) {
  const [contacts, setContacts] = useState(DEFAULT_CONTACTS);
  const [selectedContact, setSelectedContact] = useState(DEFAULT_CONTACTS[0]);
  const [messages, setMessages] = useState(INITIAL_CHATS);
  const [inputText, setInputText] = useState('');
  const [callActive, setCallActive] = useState(false);
  const [callType, setCallType] = useState('video'); // 'video' | 'voice'
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [liveCaptions, setLiveCaptions] = useState('Live sign-to-speech captions active: "HELLO 👋 - NICE TO MEET YOU"');

  // Friend Invite Modal State
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [friendNameInput, setFriendNameInput] = useState('');
  const [friendEmailInput, setFriendEmailInput] = useState('');
  const [generatedInvite, setGeneratedInvite] = useState(null);
  const [copied, setCopied] = useState(false);

  const cameraRef = useRef(null);
  const currentChat = messages[selectedContact.id] || [];

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const text = inputText.trim();
    const signTag = text.toUpperCase().includes('HELLO') ? 'HELLO 👋' : text.toUpperCase().includes('YES') ? 'YES 👍' : text.toUpperCase().includes('WATER') ? 'WATER 💧' : null;

    const newMsg = {
      id: Date.now(),
      sender: 'me',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      signTag
    };

    setMessages((prev) => ({
      ...prev,
      [selectedContact.id]: [...(prev[selectedContact.id] || []), newMsg]
    }));

    setInputText('');

    // Send to backend room endpoint
    sendPeerMessageApi(selectedContact.id, { sender: currentUser?.name || 'me', text, signTag }).catch(() => {});

    // Simulated peer auto-reply after 1.4s
    setTimeout(() => {
      const replies = [
        `Received: "${text}". I can see your sign stream clearly!`,
        `Got it! Let me reply in sign language right now. 🤟`,
        `Great point! Transliterating text to hand gestures seamlessly.`
      ];
      const replyText = replies[Math.floor(Math.random() * replies.length)];
      const peerMsg = {
        id: Date.now() + 1,
        sender: 'them',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => ({
        ...prev,
        [selectedContact.id]: [...(prev[selectedContact.id] || []), peerMsg]
      }));
    }, 1400);
  };

  const handleCreateInvite = async (e) => {
    e?.preventDefault();
    const friendName = friendNameInput.trim() || 'Accessibility Friend';
    const friendEmail = friendEmailInput.trim();

    try {
      const res = await createPeerInviteApi({
        inviterName: currentUser?.name || 'Rachana Reddy',
        friendEmail,
        friendName
      });

      if (res && res.roomCode) {
        setGeneratedInvite(res);

        // Add as a new contact in list
        const newContact = {
          id: res.roomCode,
          name: `${friendName} (Room ${res.roomCode})`,
          role: 'Invited Friend',
          avatar: '🎉',
          status: 'online',
          color: '#00f2fe'
        };

        setContacts(prev => [newContact, ...prev]);
        setSelectedContact(newContact);
        setMessages(prev => ({
          ...prev,
          [res.roomCode]: [
            {
              id: 'init_invite',
              sender: 'system',
              text: `Room [${res.roomCode}] created! Share link with ${friendName} to chat, voice call or video call.`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]
        }));
      }
    } catch {
      // fallback room
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      setGeneratedInvite({
        roomCode: code,
        inviteUrl: `${window.location.origin}/?room=${code}`
      });
    }
  };

  const copyInviteLink = () => {
    if (generatedInvite?.inviteUrl) {
      navigator.clipboard?.writeText(generatedInvite.inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const startCall = (type) => {
    setCallType(type);
    setCallActive(true);
    signalPeerCallApi(selectedContact.id, { action: 'start', callType: type, caller: currentUser?.name || 'User' }).catch(() => {});
    if (window.speechSynthesis) {
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(`Connecting ${type} call with ${selectedContact.name}`));
    }
  };

  const endCall = () => {
    setCallActive(false);
    signalPeerCallApi(selectedContact.id, { action: 'end' }).catch(() => {});
    if (window.speechSynthesis) {
      window.speechSynthesis.speak(new SpeechSynthesisUtterance("Call ended."));
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      height: '100%',
      color: '#fff',
      fontFamily: 'inherit'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#00f2fe', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            CONVERSATIONAL PEER MODULE
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#fff', margin: '2px 0 0 0' }}>
            Two-Friend Connect: Voice, Video & Real-Time Sign Chat
          </h1>
        </div>

        <button
          onClick={() => { setInviteModalOpen(true); setGeneratedInvite(null); }}
          style={{
            background: 'linear-gradient(135deg, #00f2fe, #9d50bb)',
            border: 'none',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: 12,
            fontSize: 12,
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 0 20px rgba(0,242,254,0.3)',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
        >
          <UserPlus size={16} />
          <span>+ Invite a Friend</span>
        </button>
      </div>

      {/* Main Container */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '290px 1fr',
        gap: 16,
        flex: 1,
        minHeight: 520,
        background: 'rgba(18, 22, 33, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 20,
        overflow: 'hidden',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
      }}>
        {/* Left: Contact List */}
        <div style={{
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            padding: '14px 16px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: 13,
            fontWeight: 800,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>Active Friends ({contacts.length})</span>
            <span style={{ fontSize: 10, color: '#22c55e' }}>● Encrypted</span>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {contacts.map((c) => {
              const isSelected = selectedContact.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedContact(c)}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    background: isSelected ? 'rgba(0, 242, 254, 0.12)' : 'transparent',
                    borderLeft: isSelected ? '3px solid #00f2fe' : '3px solid transparent',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'; }}
                  onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{
                    fontSize: 22,
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `1px solid ${c.color || '#00f2fe'}40`
                  }}>
                    {c.avatar}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: isSelected ? '#00f2fe' : '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.name}
                    </div>
                    <div style={{ fontSize: 11, color: '#8a99ad', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.role}
                    </div>
                  </div>
                  <span style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: c.status === 'online' ? '#22c55e' : '#f59e0b',
                    boxShadow: c.status === 'online' ? '0 0 8px #22c55e' : 'none'
                  }} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Active Chat / Call Room */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {/* Room Top Header */}
          <div style={{
            padding: '12px 18px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 24 }}>{selectedContact.avatar}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{selectedContact.name}</div>
                <div style={{ fontSize: 11, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                  <span>Online • Live Sign & Voice Captions Active</span>
                </div>
              </div>
            </div>

            {/* Call Action Buttons */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => startCall('voice')}
                style={{
                  background: 'rgba(0,242,254,0.12)',
                  border: '1px solid rgba(0,242,254,0.3)',
                  color: '#00f2fe',
                  padding: '8px 14px',
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <Phone size={14} /> Voice Call
              </button>
              <button
                onClick={() => startCall('video')}
                style={{
                  background: 'linear-gradient(135deg,#00f2fe,#9d50bb)',
                  border: 'none',
                  color: '#fff',
                  padding: '8px 14px',
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 0 16px rgba(0,242,254,0.25)'
                }}
              >
                <Video size={14} /> Video Call
              </button>
            </div>
          </div>

          {/* If In Live Call -> Display Live Video / Voice Overlay */}
          {callActive ? (
            <div style={{
              flex: 1,
              position: 'relative',
              background: '#000',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: 20
            }}>
              {/* Remote Peer Video Stream */}
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {callType === 'video' && !isVideoOff ? (
                  <CameraView ref={cameraRef} />
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 64, marginBottom: 12 }}>{selectedContact.avatar}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{selectedContact.name}</div>
                    <div style={{ fontSize: 13, color: '#00f2fe', marginTop: 4 }}>Voice Call Connected</div>
                  </div>
                )}
              </div>

              {/* Top Call Info */}
              <div style={{
                position: 'relative',
                zIndex: 10,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{
                  background: 'rgba(0,0,0,0.65)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  padding: '6px 14px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#22c55e'
                }}>
                  ● 02:45 Connected (Encrypted P2P)
                </span>
              </div>

              {/* Bottom Live Caption Banner */}
              <div style={{
                position: 'relative',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                gap: 12
              }}>
                <div style={{
                  background: 'rgba(18, 22, 33, 0.9)',
                  border: '1px solid #00f2fe',
                  borderRadius: 14,
                  padding: '10px 16px',
                  backdropFilter: 'blur(12px)',
                  textAlign: 'center',
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#00f2fe',
                  boxShadow: '0 0 20px rgba(0,242,254,0.2)'
                }}>
                  {liveCaptions}
                </div>

                {/* Call Controls */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: isMuted ? '#ef4444' : 'rgba(255,255,255,0.15)',
                      border: 'none',
                      color: '#fff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
                  </button>

                  <button
                    onClick={() => setIsVideoOff(!isVideoOff)}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: isVideoOff ? '#ef4444' : 'rgba(255,255,255,0.15)',
                      border: 'none',
                      color: '#fff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {isVideoOff ? <VideoOff size={18} /> : <Video size={18} />}
                  </button>

                  <button
                    onClick={endCall}
                    style={{
                      padding: '0 24px',
                      height: 44,
                      borderRadius: 24,
                      background: '#ef4444',
                      border: 'none',
                      color: '#fff',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      boxShadow: '0 0 20px rgba(239,68,68,0.4)'
                    }}
                  >
                    <PhoneOff size={18} /> End Call
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Chat Message Area */
            <>
              <div style={{ flex: 1, padding: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {currentChat.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      alignSelf: msg.sender === 'me' ? 'flex-end' : 'flex-start',
                      maxWidth: '75%'
                    }}
                  >
                    <div style={{
                      padding: '10px 14px',
                      borderRadius: 14,
                      fontSize: 13,
                      lineHeight: 1.4,
                      background: msg.sender === 'me'
                        ? 'linear-gradient(135deg,#00f2fe,#9d50bb)'
                        : 'rgba(255,255,255,0.06)',
                      color: '#fff',
                      border: msg.sender === 'them' ? '1px solid rgba(255,255,255,0.08)' : 'none',
                      borderBottomRightRadius: msg.sender === 'me' ? 2 : 14,
                      borderBottomLeftRadius: msg.sender === 'them' ? 2 : 14
                    }}>
                      <div>{msg.text}</div>
                      {msg.signTag && (
                        <div style={{
                          marginTop: 6,
                          padding: '4px 8px',
                          background: 'rgba(0,0,0,0.3)',
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 700,
                          color: '#00f2fe'
                        }}>
                          🤟 Sign Meaning: {msg.signTag}
                        </div>
                      )}
                    </div>
                    <div style={{
                      fontSize: 10,
                      color: '#8a99ad',
                      marginTop: 3,
                      textAlign: msg.sender === 'me' ? 'right' : 'left'
                    }}>
                      {msg.time}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input Bar */}
              <form
                onSubmit={handleSendMessage}
                style={{
                  padding: 12,
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: 'rgba(0,0,0,0.15)'
                }}
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Message ${selectedContact.name} (type words to see signs)...`}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    borderRadius: 20,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#fff',
                    fontSize: 13,
                    outline: 'none'
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#00f2fe'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg,#00f2fe,#9d50bb)',
                    border: 'none',
                    color: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: !inputText.trim() ? 0.4 : 1
                  }}
                >
                  <Send size={16} />
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* ── INVITE A FRIEND MODAL ── */}
      {inviteModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: 20
        }}>
          <div style={{
            background: 'linear-gradient(180deg, #121621 0%, #07090e 100%)',
            border: '1px solid rgba(0, 242, 254, 0.3)',
            borderRadius: 24,
            padding: 28,
            maxWidth: 480,
            width: '100%',
            boxShadow: '0 0 60px rgba(0, 242, 254, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: 18
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(0,242,254,0.15)', border: '1px solid #00f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00f2fe' }}>
                  <Users size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 900, color: '#fff', margin: 0 }}>Invite a Friend</h3>
                  <p style={{ fontSize: 11, color: '#8a99ad', margin: 0 }}>Connect 2 peers for live chat, voice & video</p>
                </div>
              </div>
              <button
                onClick={() => setInviteModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#8a99ad', cursor: 'pointer', fontSize: 18 }}
              >
                ✕
              </button>
            </div>

            {!generatedInvite ? (
              <form onSubmit={handleCreateInvite} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: 4 }}>
                    Friend's Name
                  </label>
                  <input
                    type="text"
                    required
                    value={friendNameInput}
                    onChange={e => setFriendNameInput(e.target.value)}
                    placeholder="e.g. Rachana Reddy"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 12,
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: '#fff',
                      fontSize: 13,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: 4 }}>
                    Friend's Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={friendEmailInput}
                    onChange={e => setFriendEmailInput(e.target.value)}
                    placeholder="e.g. friend@echosign.org"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 12,
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: '#fff',
                      fontSize: 13,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    marginTop: 8,
                    padding: '12px',
                    borderRadius: 12,
                    border: 'none',
                    background: 'linear-gradient(135deg, #00f2fe, #9d50bb)',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: 13,
                    cursor: 'pointer',
                    boxShadow: '0 0 20px rgba(0,242,254,0.3)'
                  }}
                >
                  Generate Invitation & Room Code ⚡
                </button>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{
                  background: 'rgba(0, 242, 254, 0.08)',
                  border: '1px solid #00f2fe',
                  borderRadius: 16,
                  padding: 16,
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: 11, color: '#8a99ad', textTransform: 'uppercase', fontWeight: 800 }}>
                    ROOM CODE
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: 4, color: '#00f2fe', margin: '4px 0' }}>
                    {generatedInvite.roomCode}
                  </div>
                  <div style={{ fontSize: 11, color: '#cbd5e1' }}>
                    Share this code or link with your friend to connect instantly.
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'rgba(255,255,255,0.05)',
                  padding: '8px 12px',
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <input
                    type="text"
                    readOnly
                    value={generatedInvite.inviteUrl}
                    style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', fontSize: 12, outline: 'none' }}
                  />
                  <button
                    onClick={copyInviteLink}
                    style={{
                      background: copied ? '#22c55e' : '#00f2fe',
                      color: '#000',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                </div>

                <button
                  onClick={() => setInviteModalOpen(false)}
                  style={{
                    padding: '10px',
                    borderRadius: 12,
                    border: '1px solid rgba(255,255,255,0.12)',
                    background: 'rgba(255,255,255,0.06)',
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Close & Start Chatting
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
