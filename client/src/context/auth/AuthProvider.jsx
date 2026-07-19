import React, { createContext, useContext, useMemo } from 'react';
import { isClientUser } from './authState';
import { useAuthSession } from './useAuthSession';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const authSession = useAuthSession();
  const { loading, role } = authSession;

  const contextValue = useMemo(
    () => ({
      ...authSession,
      isClientUser: isClientUser({ role }),
      isAdmin: role === 'ADMIN',
      isMod: role === 'MOD',
    }),
    [authSession, role]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {loading ? <div>Loading...</div> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
