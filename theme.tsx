'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'dark' | 'light' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'dark' | 'light';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state lazily to avoid layout shift/flicker
  // Check localStorage immediately. If nothing found, default to 'light'.
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      if (typeof window !== 'undefined') {
        const savedTheme = localStorage.getItem('app_theme') as Theme;
        if (savedTheme === 'dark' || savedTheme === 'light' || savedTheme === 'system') {
          return savedTheme;
        }
      }
    } catch (e) {
      // Ignore localStorage errors
    }
    return 'light';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('light');

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('app_theme', newTheme);
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  };

  useEffect(() => {
    const root = window.document.documentElement;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const effectiveTheme = theme === 'system' ? systemTheme : theme;

    setResolvedTheme(effectiveTheme);

    // Apply the class
    if (effectiveTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Listen to system changes if on system theme
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const newSystemTheme = mediaQuery.matches ? 'dark' : 'light';
      setResolvedTheme(newSystemTheme);
      if (newSystemTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};