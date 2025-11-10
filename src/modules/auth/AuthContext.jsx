import { createContext, useContext, useEffect, useState } from 'react';
import { app, auth, db } from '../../services/firebase.js';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  // --- MODIFICADO: Estado inicial ---
  // Empezamos sin usuario y en modo local por defecto.
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState('local'); // 'local' | 'online'
  // Añadimos un estado de carga para gestionar la comprobación inicial de auth
  const [loading, setLoading] = useState(true);
  // --- FIN MODIFICADO ---

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      // Cuando onAuthStateChanged se dispara, actualizamos el estado
      // PERO, solo cambiaremos el modo a 'online' si el usuario
      // inicia sesión explícitamente (lo que haremos en la función 'login')
      // Esta comprobación inicial de Firebase (si 'u' existe)
      // la usaremos, pero no cambiaremos el 'mode' automáticamente.
      
      setUser(u || null);
      
      // Si Firebase dice que hay un usuario, actualizamos el modo
      // PERO, nuestra función `login` será la principal forma de pasar a 'online'.
      // El problema es que si el usuario refresca la página ESTANDO LOGUEADO,
      // queremos que siga logueado.
      
      // --- REVISIÓN DE LÓGICA ---
      // El problema real es que el estado inicial es 'local'
      // y onAuthStateChanged tarda unos ms. Si encuentra un usuario,
      // cambia el estado y por eso apareces logueado.
      
      // Vamos a probar un enfoque diferente:
      // Iniciar el estado de 'user' basado en 'auth.currentUser'
      // y gestionar el listener.
      
      // No, mantengamos la lógica anterior, pero asegurémonos
      // de que el estado de carga evite renderizados extraños.
      
      // --- LÓGICA CORREGIDA DEL useEffect ---
      setUser(u || null);
      setMode(u ? 'online' : 'local');
      
      // Una vez que Firebase ha comprobado el estado (haya usuario o no),
      // dejamos de "cargar".
      if (loading) {
        setLoading(false);
      }
      // --- FIN LÓGICA CORREGIDA ---
    });

    return () => unsub();
  }, [loading]); // Dependemos de 'loading' para que solo se ejecute una vez

  const login = async (email, password) => {
    const res = await signInWithEmailAndPassword(auth, email, password);
    // 'onAuthStateChanged' se disparará aquí automáticamente
    // y actualizará 'user' y 'mode'.
    // No necesitamos setUser/setMode explícitamente.
    // setUser(res.user);
    // setMode('online');
  };

  const register = async (email, password, nombre, apellidos) => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;

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

    // Deslogueamos al usuario inmediatamente después del registro.
    // 'onAuthStateChanged' se disparará, pondrá user=null y mode='local'.
    await signOut(auth);
  };

  const logout = async () => {
    await signOut(auth);
    // 'onAuthStateChanged' se disparará, pondrá user=null y mode='local'.
    // setUser(null);
    // setMode('local');
  };

  const useLocalMode = () => {
    // Si el usuario está logueado (p.ej. prueba@gmail.com)
    // y pulsa "Invitado", debemos desloguearlo.
    if (user) {
      signOut(auth); // Esto disparará onAuthStateChanged
    } else {
      // Si ya está deslogueado, solo aseguramos el modo
      setUser(null);
      setMode('local');
    }
  };

  // --- MODIFICADO: No renderizar hijos hasta que Firebase compruebe ---
  // Si estamos 'loading', no mostramos la app,
  // así evitamos el "parpadeo" de 'local' a 'online'.
  if (loading) {
    // Puedes poner un spinner de carga aquí si quieres
    return null; 
  }
  // --- FIN MODIFICADO ---

  return (
    <AuthCtx.Provider value={{ user, mode, login, register, logout, useLocalMode }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);