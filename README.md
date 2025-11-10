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
- Entrada de productos con autocompletado contra un catálogo en Firestore.

## Estructura
- `src/modules/auth/*`: contexto y estado de autenticación.
- `src/modules/cart/*`: estado del carrito (local/online).
- `src/services/*`: Firebase, Firestore y sugerencias.
- `src/pages/*`: páginas de la app.

## Catálogo de productos (nuevo)
Para que el input del carrito acepte solo productos válidos, crea una colección `products` en Firestore con documentos que tengan al menos el campo `name` (opcional: `category`, `price`, etc.). Ejemplo:

```
// Collection: products
{ "name": "Leche desnatada Hacendado", "category": "Lácteos" }
{ "name": "Arroz redondo Hacendado", "category": "Despensa" }
{ "name": "Pan de molde", "category": "Panadería" }
```

Reglas mínimas (solo lectura para usuarios autenticados) — ajusta según tus necesidades:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{productId} {
      allow read: if request.auth != null; // permitir lectura a usuarios autenticados
      allow write: if false;               // bloquear escritura desde cliente
    }
    match /lists/{listId} {
      allow read: if request.auth != null && request.auth.uid in resource.data.memberIds;
      allow write: if request.auth != null && request.auth.uid in resource.data.memberIds;
    }
  }
}
```

La búsqueda usa prefijo sobre el campo `name` (`orderBy('name')`, `startAt`, `endAt`). Para grandes catálogos, considera integrar Algolia o similares.

## Notas
- Para colaboración en tiempo real, usa sesión (modo online). En modo invitado, las funciones de listas compartidas están deshabilitadas.
- Invitar por enlace: copia el enlace desde Listas y compártelo. El invitado debe iniciar sesión para unirse.