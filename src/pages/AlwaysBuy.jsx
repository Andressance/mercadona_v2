import { useEffect, useState } from 'react';
import { useAuth } from '../modules/auth/AuthContext.jsx';
import { useCart } from '../modules/cart/CartContext.jsx';
// Importamos la nueva función ASYNC
import { getAlwaysList } from '../services/suggestions.js';

export default function AlwaysBuyPage() {
  const { addItem } = useCart();
  const { user, mode } = useAuth(); // Necesitamos el 'user' para el uid
  const [always, setAlways] = useState([]);

  // Función para recargar la lista
  const refreshList = () => {
    // --- LÓGICA INVERTIDA ---
    // Ahora carga la lista si está 'online' y hay un usuario
    if (mode === 'online' && user) {
      getAlwaysList(user.uid).then(setAlways);
    } else {
      setAlways([]); // Vacía si es invitado
    }
  };

  useEffect(() => {
    refreshList();
    window.addEventListener('focus', refreshList);
    return () => window.removeEventListener('focus', refreshList);
  }, [mode, user]); // Añadimos 'user' a las dependencias

  const onAddToCart = (prod) => {
    addItem({ name: prod.name, quantity: 1 });
  };

  return (
    <div className="card">
      <h2>Siempre compro</h2>
      
      {/* --- TEXTO INVERTIDO --- */}
      {mode === 'online' ? (
        <p className="muted">
          Aquí aparecen automáticamente los productos que has comprado 3 veces o más.
          Si dejas de comprar un producto 5 veces, desaparecerá de la lista.
        </p>
      ) : (
        <p className="muted">
          La lista automática de "Siempre compro" solo está disponible cuando has iniciado sesión.
        </p>
      )}

      {/* --- ESTADO VACÍO O LISTA (Lógica de texto invertida) --- */}
      {always.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '1rem 0', border: '2px dashed var(--border)', borderRadius: '.5rem', marginTop: '1rem' }}>
          <p className="muted">
            {mode === 'online' 
              ? 'Aún no hay productos en tu lista. ¡Sigue comprando!' 
              : 'Inicia sesión para ver esta función.'}
          </p>
          <p className="muted" style={{ fontSize: '.8rem', marginTop: '1rem' }}>
            (Para probar, ve al Carrito, añade productos y pulsa "Simular Compra".
            Repite 3 veces con el mismo producto.)
          </p>
        </div>
      ) : (
        <ul className="list" style={{ marginTop: '.5rem' }}>
          {always.map((it) => (
            <li key={it.id}>
              <span style={{ flexGrow: 1, fontWeight: '500' }}>{it.name}</span>
              <button className="btn secondary" onClick={() => onAddToCart(it)}>Añadir al carrito</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}