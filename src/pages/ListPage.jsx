import { useState, useEffect } from 'react';
// 1. IMPORTAMOS Link
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../modules/auth/AuthContext.jsx';
import { 
  subscribeToList, 
  addListItem, 
  removeListItem, 
  toggleListItem 
} from '../services/firestore.js'; 
import { getAllProducts } from '../services/product.js';

export default function ListPage() {
  const { listId } = useParams(); 
  const { user, mode } = useAuth();
  
  const [items, setItems] = useState([]); 
  const [name, setName] = useState('');
  const [qty, setQty] = useState(1);
  const [allProducts, setAllProducts] = useState([]);
  const [matches, setMatches] = useState([]);

  // Suscripción a la lista
  useEffect(() => {
    if (mode === 'online' && user && listId) {
      const unsub = subscribeToList(listId, setItems);
      return () => unsub(); 
    } else {
      setItems([]);
    }
  }, [mode, user, listId]);

  // Cargar catálogo de productos
  useEffect(() => {
    getAllProducts().then(setAllProducts);
  }, []);

  // --- Lógica de autocompletar ---
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
    setName(product.nombre);
    setQty(1);
    setMatches([]);
  };  

  // --- Handlers de acciones ---
  const onAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const exists = allProducts.find(p => p.nombre.toLowerCase() === name.toLowerCase());
    if (!exists) return;
    
    await addListItem(listId, { name: exists.nombre, quantity: qty });
    setName(''); setQty(1); setMatches([]);
  };

  const onRemove = (itemId) => {
    removeListItem(listId, itemId);
  };

  const onToggle = (itemId) => {
    toggleListItem(listId, itemId);
  };

  const onClearList = async () => {
    for (const it of items) {
      await removeListItem(listId, it.id);
    }
  };

  return (
    <div className="row">
      <div className="col">
        <div className="card">
          
          {/* --- 2. BOTÓN AÑADIDO --- */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Editando Lista</h2>
            <Link to="/listas" className="btn secondary">
              ← Volver a Listas
            </Link>
          </div>
          {/* --- FIN BOTÓN --- */}

          <p className="muted">Estás modificando la lista: {listId}</p>
          <form onSubmit={onAdd} style={{ display: 'flex', flexDirection: 'column', gap: '.5rem', marginTop: '1rem' }}>
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
            
            <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              <button className="btn" type="submit">Añadir a esta lista</button>
              
              <button 
                className="btn secondary" 
                type="button" 
                onClick={onClearList}
                disabled={items.length === 0}
              >
                Vaciar Lista
              </button>
            </div>
          </form>

          <ul className="list">
            {items.map((it) => (
              <li key={it.id}>
                <input type="checkbox" checked={!!it.checked} onChange={() => onToggle(it.id)} />
                <span>{it.name}</span>
                <span className="badge">x{it.quantity}</span>
                <button className="btn secondary" onClick={() => onRemove(it.id)}>Quitar</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}