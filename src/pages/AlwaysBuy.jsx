import { useEffect, useState } from 'react';
import { useAuth } from '../modules/auth/AuthContext.jsx';
import { useCart } from '../modules/cart/CartContext.jsx';
// Importamos la nueva función
import { getAlwaysList } from '../services/suggestions.js';

export default function AlwaysBuyPage() {
  const { addItem } = useCart();
  const { mode } = useAuth(); // Para saber si estamos en local
  const [always, setAlways] = useState([]);

  // Función para recargar la lista
  const refreshList = () => {
    // La lógica de "Siempre Compro" solo funciona en modo invitado
    if (mode === 'local') {
      setAlways(getAlwaysList());
    } else {
      setAlways([]); // Vacío si estás online (porque no hemos implementado la lógica de Firebase)
    }
  };

  // Recargamos la lista cuando carga la página o cuando cambia el modo (invitado/online)
  useEffect(() => {
    refreshList();
  }, [mode]);

  const onAddToCart = (prod) => {
    addItem({ name: prod.name, quantity: 1 });
  };

  return (
    <div className="card">
      <h2>Siempre compro</h2>
      
      {mode === 'local' ? (
        <p className="muted">
          Aquí aparecen automáticamente los productos que has comprado 3 veces o más.
          Si dejas de comprar un producto, desaparecerá de la lista.
        </p>
      ) : (
        <p className="muted">
          La lista automática de "Siempre compro" solo está disponible en el "Modo Invitado (local)".
        </p>
      )}

      {/* --- ESTADO VACÍO O LISTA --- */}
      {always.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '1rem 0', border: '2px dashed #e2e8f0', borderRadius: '.5rem', marginTop: '1rem' }}>
          <p className="muted">
            {mode === 'local' 
              ? 'Aún no hay productos en tu lista. ¡Sigue comprando!' 
              : 'Inicia sesión en "Modo Invitado" para ver esta función.'}
          </p>
          <p className="muted" style={{ fontSize: '.8rem', marginTop: '1rem' }}>
            (Para probar, ve al Carrito, añade productos y pulsa "Vaciar".
            Repite 3 veces con el mismo producto.)
          </p>
        </div>
      ) : (
        <ul className="list" style={{ marginTop: '.5rem' }}>
          {always.map((it) => (
            <li key={it.id}>
              {/* Nombre y contador de compras */}
              <span style={{ flexGrow: 1, fontWeight: '500' }}>{it.name}</span>
              <span className="badge">Comprado {it.count} veces</span>
              
              {/* Acciones */}
              <button className="btn secondary" onClick={() => onAddToCart(it)}>Añadir al carrito</button>
              {/* El botón "Eliminar" se quita porque la lista es automática */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}