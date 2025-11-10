import { useEffect, useState } from 'react';
import { useCart } from '../modules/cart/CartContext.jsx';
import { getAlwaysList, addAlwaysItem, removeAlwaysItem } from '../services/suggestions.js';

export default function AlwaysBuyPage() {
  const { addItem } = useCart();
  const [always, setAlways] = useState([]);

  useEffect(() => { setAlways(getAlwaysList()); }, []);

  const onAddToCart = (prod) => addItem({ name: prod.name, quantity: 1 });
  const onRemove = (id) => { removeAlwaysItem(id); setAlways(getAlwaysList()); };

  const onAddNew = () => {
    const name = prompt('Producto recurrente');
    if (name && name.trim()) { addAlwaysItem({ name: name.trim() }); setAlways(getAlwaysList()); }
  };

  return (
    <div className="card">
      <h2>Siempre compro</h2>
      <p className="muted">Gestiona tus productos recurrentes para añadirlos rápido al carrito.</p>
      <div style={{ display: 'flex', gap: '.5rem' }}>
        <button className="btn" onClick={onAddNew}>Añadir recurrente</button>
      </div>
      <ul className="list" style={{ marginTop: '.5rem' }}>
        {always.map((it) => (
          <li key={it.id}>
            <span>{it.name}</span>
            <button className="btn secondary" onClick={() => onAddToCart(it)}>Añadir al carrito</button>
            <button className="btn secondary" onClick={() => onRemove(it.id)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}