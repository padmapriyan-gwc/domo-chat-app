import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Check both localStorage (remember me) and sessionStorage
    try {
      const local   = localStorage.getItem('chat_user');
      const session = sessionStorage.getItem('chat_user');
      const stored  = local || session;
      if (stored) {
        const parsed = JSON.parse(stored);
        // Validate — must have username string
        if (parsed?.username && typeof parsed.username === 'string') {
          return parsed;
        }
      }
    } catch (_) {}
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

export const useAuth = () => useContext(AuthContext);