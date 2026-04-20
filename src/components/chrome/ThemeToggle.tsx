import { useEffect, useState } from 'react';
type Theme = 'dark' | 'light' | 'system';

function apply(t: Theme) {
  const resolved = t === 'system'
    ? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
    : t;
  document.documentElement.setAttribute('data-theme', resolved);
}

function icon(t: Theme) {
  return { system: '◐', dark: '●', light: '○' }[t];
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    const saved = (localStorage.getItem('theme') as Theme | null) ?? 'system';
    setTheme(saved);
    apply(saved);
  }, []);

  const cycle = () => {
    const next: Theme = theme === 'system' ? 'dark' : theme === 'dark' ? 'light' : 'system';
    setTheme(next);
    localStorage.setItem('theme', next);
    apply(next);
  };

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`Theme: ${theme}`}
      className="text-sm font-mono text-bone/70 hover:text-bone transition-colors"
      title={`Theme: ${theme} (click to cycle)`}
    >
      {icon(theme)}
    </button>
  );
}
