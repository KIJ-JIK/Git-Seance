'use client';

import { useState, useEffect } from 'react';

export default function ModeToggle() {
  const [isOfrenda, setIsOfrenda] = useState(false);

  useEffect(() => {
    // Check saved preference or initial body class
    const saved = localStorage.getItem('git_seance_mode');
    if (saved === 'ofrenda') {
      setIsOfrenda(true);
      document.body.classList.add('ofrenda-mode');
    } else {
      setIsOfrenda(document.body.classList.contains('ofrenda-mode'));
    }
  }, []);

  const toggleMode = () => {
    const next = !isOfrenda;
    setIsOfrenda(next);
    if (next) {
      document.body.classList.add('ofrenda-mode');
      localStorage.setItem('git_seance_mode', 'ofrenda');
    } else {
      document.body.classList.remove('ofrenda-mode');
      localStorage.setItem('git_seance_mode', 'seance');
    }
  };

  return (
    <button
      onClick={toggleMode}
      className="btn-ghost flex items-center gap-2 select-none"
      style={{ padding: '0.45rem 1rem', fontSize: '0.78rem' }}
      title={isOfrenda ? 'Switch to Midnight Séance Mode (Image 1)' : 'Switch to Fiery Ofrenda Mode (Image 2)'}
    >
      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--phosphor)' }} />
      <span>{isOfrenda ? '🕯 Séance Mode' : '🌸 Ofrenda Mode'}</span>
    </button>
  );
}
