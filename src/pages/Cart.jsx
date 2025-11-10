import { useState } from 'react';
import { useCart } from '../modules/cart/CartContext.jsx';
import { useSuggestions } from '../services/suggestions.js';

export default function CartPage() {
  const { items, addItem, removeItem, toggleItem, clearCart } = useCart();
  const [name, setName] = useState('');
  const [qty, setQty] = useState(1);
  const suggestions = useSuggestions(items);

  const onAdd = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    addItem({ name: name.trim(), quantity: qty });
    setName(''); setQty(1);
  };

  return (
    <div className="row">
      <div className="col">
        <div className="card">
          <h2>Tu carrito</h2>
          <form onSubmit={onAdd} style={{ display: 'flex', gap: '.5rem' }}>
            <input className="input" placeholder="Producto" value={name} onChange={(e) => setName(e.target.value)} />
            <input className="input" type="number" min={1} value={qty} onChange={(e) => setQty(parseInt(e.target.value || '1'))} />
            <button className="btn" type="submit">Añadir</button>
            <button className="btn secondary" type="button" onClick={clearCart}>Vaciar</button>
          </form>
          <ul className="list">
            {items.map((it) => (
              <li key={it.id}>
                <input type="checkbox" checked={!!it.checked} onChange={() => toggleItem(it.id)} />
                <span>{it.name}</span>
                <span className="badge">x{it.quantity}</span>
                <button className="btn secondary" onClick={() => removeItem(it.id)}>Quitar</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="col">
        <div className="card">
          <h2>Sugerencias</h2>
          <p className="muted">Basadas en hábitos, esenciales y temporada.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
            {suggestions.map((s) => (
              <button key={s.id} className="btn secondary" onClick={() => addItem({ name: s.name, quantity: s.defaultQty || 1 })}>{s.name}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}