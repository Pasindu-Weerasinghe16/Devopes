import React, { createContext, useState } from 'react';

// Simple AuthContext providing a "user" identifier used by Dashboard fetch calls.
// Replace the default user with a real user id/email once authentication is wired.
const AuthContext = createContext({ user: null });

export function AuthProvider({ children }) {
  // For now we hardcode a demo user id (could be an email or database id)
  const [user] = useState('demoUser');
  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
