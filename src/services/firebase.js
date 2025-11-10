import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuración proporcionada por el usuario
const firebaseConfig = {
  apiKey: "AIzaSyCoqqlnYjgdZwLudJbMBsSPIK7_5bwLnXA",
  authDomain: "mercart-2186c.firebaseapp.com",
  projectId: "mercart-2186c",
  storageBucket: "mercart-2186c.firebasestorage.app",
  messagingSenderId: "333431316019",
  appId: "1:333431316019:web:c613680acb592c6127cd46",
  measurementId: "G-3314Z8XX1N"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);