# Mercart – Asistente de Compra

Aplicación web en React (Vite) con autenticación, listas compartidas y carrito dinámico. Soporta modo invitado (datos locales) y sincronización con Firebase para colaboración en tiempo real.

## Requisitos
- Node.js 18+
- Cuenta de Firebase con proyecto: `mercart-2186c`

## Configuración de Firebase
1. En Firebase Console, habilita:
   - Authentication → Sign-in method → Email/Password (activar).
   - Firestore Database → Crea base de datos en modo producción.
   - Hosting → Activar Hosting para el proyecto.

2. Reglas de Firestore (mínimas para pruebas):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /lists/{listId} {
      allow read: if request.auth != null && request.auth.uid in resource.data.memberIds;
      allow write: if request.auth != null && request.auth.uid in resource.data.memberIds;
    }
  }
}
```

3. Configuración del cliente: ya está embebida en `src/services/firebase.js` usando tu `firebaseConfig`.
   - Opcional: usa variables de entorno (`.env`) y sustituye.

## Instalación y desarrollo
```bash
npm install
npm run dev
```

Abrir la URL que muestre el servidor (por defecto `http://localhost:5173`).

## Deploy en Firebase Hosting
```bash
npm run build
firebase login
firebase init hosting   # seleccionar proyecto mercart-2186c, carpeta "dist", SPA: yes
firebase deploy --only hosting
```

Si ya tienes `firebase.json` y `.firebaserc`, basta con:
```bash
firebase deploy --only hosting
```

## Funcionalidades clave
- Carrito local sin registro (persistencia en `localStorage`).
- Registro/Login con Email/Password.
- Listas compartidas en Firestore y enlaces de invitación (`/invitar/:listId`).
- Sugerencias basadas en “Siempre compro”, básicos y temporada.

## Estructura
- `src/modules/auth/*`: contexto y estado de autenticación.
- `src/modules/cart/*`: estado del carrito (local/online).
- `src/services/*`: Firebase, Firestore y sugerencias.
- `src/pages/*`: páginas de la app.

## Notas
- Para colaboración en tiempo real, usa sesión (modo online). En modo invitado, las funciones de listas compartidas están deshabilitadas.
- Invitar por enlace: copia el enlace desde Listas y compártelo. El invitado debe iniciar sesión para unirse.