'use client';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('bi-theme', next ? 'dark' : 'light');
    } catch (e) {
      // localStorage unavailable (private browsing etc.) — theme just won't persist
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="w-9 h-9 rounded-lg border flex items-center justify-center text-sm"
      style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}
    >
      {isDark ? '☀' : '☾'}
    </button>
  );
}
