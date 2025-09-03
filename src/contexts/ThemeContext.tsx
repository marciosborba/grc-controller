import React, { createContext, useContext } from 'react';
import { ThemeProvider as NextThemeProvider, useTheme as useNextTheme } from 'next-themes';

interface ThemeContextType {
  theme: string | undefined;
  setTheme: (theme: string) => void;
  systemTheme: string | undefined;
  resolvedTheme: string | undefined;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const ThemeContextInner: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme, setTheme, systemTheme, resolvedTheme } = useNextTheme();

  // ThemeContext: Sistema estático simples - apenas dark/light toggle

  const contextValue = {
    theme,
    setTheme,
    systemTheme,
    resolvedTheme
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <NextThemeProvider 
      attribute="class" 
      defaultTheme="system" 
      enableSystem
      storageKey="grc-theme"
      disableTransitionOnChange={false}
    >
      <ThemeContextInner>
        {children}
      </ThemeContextInner>
    </NextThemeProvider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};