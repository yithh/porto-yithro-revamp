import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { auth, googleProvider } from '../firebase';
import { onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut } from 'firebase/auth';

const ADMIN_EMAIL = 'yithro04@gmail.com';

const AuthContext = createContext({
  user: null,
  isAdmin: false,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Login failed', err);
      // Fallback to redirect if popup is blocked or cancelled
      const code = err?.code || '';
      if (code === 'auth/popup-blocked' || code === 'auth/cancelled-popup-request') {
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (e) {
          console.error('Redirect login failed', e);
          alert('Login failed. Please allow popups or try again.');
        }
      } else {
        alert('Login failed. Check console for details.');
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const value = useMemo(() => ({
    user,
    isAdmin: !!user && (user.email || '').toLowerCase() === ADMIN_EMAIL.toLowerCase(),
    loading,
    login,
    logout,
    username: user?.displayName
      ? user.displayName.trim().split(/\s+/)[0]
      : (user?.email ? user.email.split('@')[0] : null),
  }), [user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
