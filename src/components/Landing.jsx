import React, { useState } from 'react';
import Navbar from './Navbar';
import Hero from './Hero';
import { X } from 'lucide-react';

export default function Landing({ onGetStarted, onLogin, onSeeHowItWorks, onOpenModules, onOpenWorkspace }) {
  const [showVideo, setShowVideo] = useState(false);

  const handleSeeHowItWorks = () => {
    setShowVideo(true);
    if (onSeeHowItWorks) onSeeHowItWorks();
  };

  return (
    <div className="landing-shell" style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #05070A 0%, #0B0E14 100%)', color: '#fff', position: 'relative' }}>
      <Navbar
        onGetStarted={onGetStarted}
        onLogin={() => onLogin && onLogin()}
        onSeeHowItWorks={handleSeeHowItWorks}
        onOpenModules={onOpenModules}
        onOpenWorkspace={onOpenWorkspace}
      />
      <Hero onGetStarted={onGetStarted} onSeeHowItWorks={handleSeeHowItWorks} />

      {showVideo && (
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
            onClick={() => setShowVideo(false)}
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
            src="/how-it-works.mp4" 
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
      )}
    </div>
  );
}
