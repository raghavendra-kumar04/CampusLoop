import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const ThemeContext = createContext();

const STORAGE_KEY = 'campusloop-theme';

const getInitialTheme = () => {
  try {
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
  } catch (err) {
    // Storage access restricted (e.g. strict private mode)
    console.warn('Unable to access localStorage:', err);
  }

  // Fallback to system preference
  if (
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark';
  }

  return 'light';
};

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(getInitialTheme);

  // Apply theme to DOM
  const applyThemeToDOM = useCallback((currentTheme) => {
    try {
      const root = document.documentElement;
      if (currentTheme === 'dark') {
        root.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
        root.style.colorScheme = 'light';
      }
    } catch (err) {
      console.warn('Unable to apply theme to DOM:', err);
    }
  }, []);

  const setTheme = useCallback((newTheme) => {
    const resolvedTheme = typeof newTheme === 'function' ? newTheme(theme) : newTheme;
    setThemeState(resolvedTheme);
    applyThemeToDOM(resolvedTheme);
    try {
      localStorage.setItem(STORAGE_KEY, resolvedTheme);
    } catch (err) {
      console.warn('Unable to persist theme to localStorage:', err);
    }
  }, [theme, applyThemeToDOM]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, [setTheme]);

  // Sync on initial mount
  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme, applyThemeToDOM]);

  // Edge Case 1: Cross-tab synchronization via StorageEvent
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY && (e.newValue === 'light' || e.newValue === 'dark')) {
        setThemeState(e.newValue);
        applyThemeToDOM(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [applyThemeToDOM]);

  // Edge Case 2: System theme change listener (when user hasn't manually set a key, or dynamic system shifts)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = (e) => {
      try {
        const savedTheme = localStorage.getItem(STORAGE_KEY);
        // Only automatically follow system theme if user hasn't explicitly set preference
        if (!savedTheme) {
          const systemTheme = e.matches ? 'dark' : 'light';
          setThemeState(systemTheme);
          applyThemeToDOM(systemTheme);
        }
      } catch (err) {
        console.warn('Error reading storage in media query listener:', err);
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaChange);
      return () => mediaQuery.removeEventListener('change', handleMediaChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleMediaChange);
      return () => mediaQuery.removeListener(handleMediaChange);
    }
  }, [applyThemeToDOM]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme === 'dark',
        toggleTheme,
        setTheme,
      }}
    >
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

export default ThemeContext;
