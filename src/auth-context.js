import React, { createContext, useContext, useState } from 'react';

export const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [isVerified, setIsVerified] = useState(() => {
    return localStorage.getItem('twoFACompleted') === 'true';
  });

  const completeTwoFA = () => {
    setIsVerified(true);
    localStorage.setItem('twoFACompleted', 'true');
  };

  const resetTwoFA = () => {
    setIsVerified(false);
    localStorage.removeItem('twoFACompleted');
  };

  const value = {
    isVerified,
    completeTwoFA,
    resetTwoFA
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
