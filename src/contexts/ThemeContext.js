// src/contexts/ThemeContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [preferences, setPreferences] = useState(null);

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  // Apply theme to document
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const loadPreferences = async () => {
    try {
      const response = await fetch('/api/settings/preferences', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success && data.preferences) {
        setPreferences(data.preferences);
        
        // Apply saved theme
        const savedTheme = data.preferences.theme || 'light';
        
        // Handle 'auto' theme
        if (savedTheme === 'auto') {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          setTheme(prefersDark ? 'dark' : 'light');
        } else {
          setTheme(savedTheme);
        }
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      // Default to light theme on error
      setTheme('light');
    }
  };

  const applyTheme = (newTheme) => {
    const root = document.documentElement;
    
    // ✅ FIX: Handle 'auto' theme properly
    let actualTheme = newTheme;
    if (newTheme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      actualTheme = prefersDark ? 'dark' : 'light';
    }
    
    // ✅ FIX: Remove ALL theme classes first
    root.classList.remove('dark', 'light');
    
    // ✅ FIX: Apply correct theme
    if (actualTheme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
      document.body.style.backgroundColor = '#0f172a';
    } else {
      root.classList.add('light');
      root.style.colorScheme = 'light';
      document.body.style.backgroundColor = '#f9fafb';
    }
    
    console.log('✅ Theme applied:', actualTheme); // ← Debug log
  };

  const updateTheme = (newTheme) => {
    console.log('🎨 Updating theme to:', newTheme); // ← Debug log
    setTheme(newTheme);
    
    // Immediately apply theme (don't wait for backend)
    applyTheme(newTheme);
    
    // Save to backend in background
    if (preferences) {
      fetch('/api/settings/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          preferences: {
            ...preferences,
            theme: newTheme
          }
        })
      }).catch(error => {
        console.error('Error saving theme:', error);
      });
    }
  };

  const value = {
    theme,
    setTheme: updateTheme,
    preferences,
    setPreferences,
    reloadPreferences: loadPreferences
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
