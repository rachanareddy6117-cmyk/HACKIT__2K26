import React from 'react';
import Navbar from './Navbar';
import Hero from './Hero';

export default function Landing({ onGetStarted, onLogin, onSeeHowItWorks, onOpenModules, onOpenWorkspace }) {
  return (
    <div className="landing-shell" style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #05070A 0%, #0B0E14 100%)', color: '#fff' }}>
      <Navbar
        onGetStarted={onGetStarted}
        onLogin={() => onLogin && onLogin()}
        onSeeHowItWorks={onSeeHowItWorks}
        onOpenModules={onOpenModules}
        onOpenWorkspace={onOpenWorkspace}
      />
      <Hero onGetStarted={onGetStarted} onSeeHowItWorks={onSeeHowItWorks} />
    </div>
  );
}
