import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Check both localStorage (remember me) and sessionStorage
    try {
      // const local   = localStorage.getItem('chat_user');
      // const session = sessionStorage.getItem('chat_user');
      const stored = sessionStorage.getItem('chat_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Validate — must have username string
        if (parsed?.username && typeof parsed.username === 'string') {
          return parsed;
        }
      }
    }
      catch (err) {
        console.error('[Auth] Failed to load user from storage:', err);
      }
    return null;
  });

  const login = (userData) => {
    sessionStorage.setItem('chat_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('chat_user');
    sessionStorage.removeItem('chat_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);