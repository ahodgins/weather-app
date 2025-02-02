'use client';

import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="fixed top-4 right-4 p-3 rounded-full bg-white/30 dark:bg-gray-800/30 
                 backdrop-blur-lg shadow-lg hover:shadow-xl transition-all duration-200"
      aria-label="Toggle dark mode"
    >
      {darkMode ? '🌞' : '🌙'}
    </button>
  );
} 