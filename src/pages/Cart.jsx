import { useState, useEffect} from 'react';
import { useCart } from '../modules/cart/CartContext.jsx';
import { useSuggestions } from '../services/suggestions.js';
import { getAllProducts } from '../services/product.js';

export default function CartPage() {
  const { items, addItem, removeItem, toggleItem, clearCart } = useCart();
  const [name, setName] = useState('');
  const [qty, setQty] = useState(1);
  const [allProducts, setAllProducts] = useState([]);
  const [matches, setMatches] = useState([]);
  const suggestions = useSuggestions(items);

  useEffect(() => {
    getAllProducts().then(setAllProducts);
  }, []);

   const onChangeName = (e) => {
    const value = e.target.value;
    setName(value);

    if (value.trim() === '') {
      setMatches([]);
      return;
    }

    const filtered = allProducts.filter(p =>
      p.nombre.toLowerCase().includes(value.toLowerCase())
    );
    setMatches(filtered);
  };

  const onSelectMatch = (product) => {
    addItem({ name: product.nombre, quantity: 1 });
    setName('');
    setQty(1);
    setMatches([]);
  };  

  const onAdd = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    // Podrías validar que name exista en allProducts antes de añadir
    const exists = allProducts.find(p => p.nombre.toLowerCase() === name.toLowerCase());
    if (!exists) return;
    addItem({ name: exists.nombre, quantity: qty });
    setName(''); setQty(1); setMatches([]);
  };

  return (
    <div className="row">
      <div className="col">
        <div className="card">
          <h2>Tu carrito</h2>
          <form onSubmit={onAdd} style={{ display: 'flex', gap: '.5rem', flexDirection: 'column' }}>
            <div style={{ position: 'relative' }}>
              <input
                className="input"
                placeholder="Producto"
                value={name}
                onChange={onChangeName}
                autoComplete="off"
              />
              {matches.length > 0 && (
                <ul style={{
                  position: 'absolute', top: '100%', left: 0, right: 0,
                  background: 'white', border: '1px solid #ccc', maxHeight: '150px', overflowY: 'auto', zIndex: 10
                }}>
                  {matches.map(p => (
                    <li key={p.nombre} style={{ padding: '.5rem', cursor: 'pointer' }}
                        onClick={() => onSelectMatch(p)}>
                      {p.nombre}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <input className="input" type="number" min={1} value={qty} onChange={(e) => setQty(parseInt(e.target.value || '1'))} />
            <div style={{ display: 'flex', gap: '.5rem' }}>
              <button className="btn" type="submit">Añadir</button>
              <button className="btn secondary" type="button" onClick={clearCart}>Vaciar</button>
            </div>
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
    </div>
  );
}