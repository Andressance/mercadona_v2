import { createContext, useContext, useEffect, useState } from 'react';
import { app, auth } from '../../services/firebase.js';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState('local'); // 'local' | 'online'

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
      setMode(u ? 'online' : 'local');
    });
    return () => unsub();
  }, []);

  const login = async (email, password) => {
    const res = await signInWithEmailAndPassword(auth, email, password);
    setUser(res.user);
    setMode('online');
  };

  const register = async (email, password) => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    setUser(res.user);
    setMode('online');
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setMode('local');
  };

  const useLocalMode = () => {
    setUser(null);
    setMode('local');
  };

  return (
    <AuthCtx.Provider value={{ user, mode, login, register, logout, useLocalMode }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);