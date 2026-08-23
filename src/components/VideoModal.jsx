import React from 'react';
import { X } from 'lucide-react';

export default function VideoModal({ onClose, src = "/how-it-works.mp4" }) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(8px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <button 
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'rgba(255,255,255,0.1)',
          border: 'none',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          cursor: 'pointer',
          zIndex: 10000
        }}
      >
        <X size={24} />
      </button>
      <video 
        src={src} 
        controls 
        autoPlay 
        style={{ 
          maxWidth: '90%', 
          maxHeight: '90vh', 
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
        }} 
      />
    </div>
  );
}
