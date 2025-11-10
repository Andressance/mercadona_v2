import { createContext, useContext, useEffect, useState } from 'react';
import { app, auth, db } from '../../services/firebase.js';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState('local');
  const [loading, setLoading] = useState(true); // Para evitar "parpadeo" al cargar

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
      setMode(u ? 'online' : 'local');
      setLoading(false); // Firebase ha comprobado el estado
    });
    return () => unsub();
  }, []);

  const login = async (email, password) => {
    const res = await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged se encarga de actualizar user y mode
  };

  const register = async (email, password, nombre, apellidos) => {
    // 1. Crea el usuario
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;

    // 2. Guarda datos en Firestore
    try {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        nombre,
        apellidos,
      });
    } catch (e) {
      console.error("Error al guardar datos de usuario en Firestore:", e);
    }

    // --- ESTO CUMPLE EL REQUISITO 1 (Parte B) ---
    // Deslogueamos al usuario inmediatamente.
    await signOut(auth);
    // onAuthStateChanged se disparará y pondrá user=null y mode='local'
    // --- FIN ---
  };

  const logout = async () => {
    await signOut(auth);
    // onAuthStateChanged se encarga del resto
  };

  const useLocalMode = () => {
    // Si el usuario está logueado y pulsa "Invitado", lo deslogueamos.
    if (user) {
      signOut(auth);
    } else {
    // Si ya es invitado, solo aseguramos el estado
      setUser(null);
      setMode('local');
    }
  };

  // No renderiza la app hasta saber el estado de auth
  if (loading) {
    return null; // O un <Spinner />
  }

  return (
    <AuthCtx.Provider value={{ user, mode, login, register, logout, useLocalMode }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);