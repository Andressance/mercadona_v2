import { createContext, useContext, useEffect, useState } from 'react';
import { app, auth, db } from '../../services/firebase.js'; // Importa 'db'
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore'; // Importa 'doc' y 'setDoc'

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

  // --- MODIFICADO ---
  // Ahora acepta nombre y apellidos
  const register = async (email, password, nombre, apellidos) => {
    // 1. Crea el usuario en Authentication
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;

    // 2. Guarda los datos extra en Firestore
    try {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        nombre,
        apellidos,
      });
    } catch (e) {
      // Opcional: manejar el error si Firestore falla
      console.error("Error al guardar datos de usuario en Firestore:", e);
      // Podrías decidir si revertir el registro o solo loggear el error
    }

    // 3. Actualiza el estado local
    setUser(user);
    setMode('online');
  };
  // --- FIN MODIFICADO ---

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