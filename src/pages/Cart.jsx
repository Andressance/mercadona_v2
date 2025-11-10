import { useState, useEffect} from 'react';
import { useCart } from '../modules/cart/CartContext.jsx';
import { useAuth } from '../modules/auth/AuthContext.jsx'; 
import { useSuggestions, trackPurchase, getAlwaysList } from '../services/suggestions.js'; 
import { getAllProducts } from '../services/product.js';
// (Quitamos las importaciones de 'list.js' que daban problemas,
//  ya que el botón 'Guardar lista' ya estaba en el código base anterior)
// import { createNewList, getUserUidFromFirestore } from '../services/list.js';
import { useLocation } from 'react-router-dom';
import { createNewList, getUserUidFromFirestore, generatePdf } from '../services/list.js';

export default function CartPage() {
  const location = useLocation(); // Añadir hook
  const { items, addItem, removeItem, toggleItem, clearCart } = useCart();
  const { user, mode } = useAuth(); // Obtenemos 'user' y 'mode'
  const [name, setName] = useState('');
  const [qty, setQty] = useState(1);
  const [allProducts, setAllProducts] = useState([]);
  const [matches, setMatches] = useState([]);
  
  // --- LÓGICA "SIEMPRE COMPRO" MOVIDA A FIRESTORE ---
  const [alwaysList, setAlwaysList] = useState([]);
  
  // 1. Cargamos la lista "Siempre compro" del usuario logueado
  useEffect(() => {
    if (location.state?.products) {
      const productsToLoad = location.state.products;
      
      // Vaciar carrito actual y cargar nuevos productos
      clearCart();
      
      productsToLoad.forEach(product => {
        addItem({ 
          name: product.name, 
          quantity: product.quantity 
        });
      });
      
      // Opcional: mostrar mensaje
      if (location.state.listName) {
        alert(`Lista "${location.state.listName}" cargada en el carrito`);
      }
      
      // Limpiar el state para evitar recargar si el usuario recarga la página
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // 2. Pasamos la lista cargada al hook de sugerencias
  const suggestions = useSuggestions(items, alwaysList);
  // --- FIN DE LA LÓGICA ---

  useEffect(() => {
    getAllProducts().then(res => {
      console.log('Productos cargados:', res);
      setAllProducts(res);
    });
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
    setName(product.nombre);
    setQty(1);
    setMatches([]);
  };  

  const onAdd = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const exists = allProducts.find(p => p.nombre.toLowerCase() === name.toLowerCase());
    if (!exists) return;
    addItem({ name: exists.nombre, quantity: qty });
    setName(''); setQty(1); setMatches([]);
  };

  // 3. FUNCIÓN "SIMULAR COMPRA" AHORA ES ASYNC Y ONLINE
  const onSimulatePurchase = async () => {
    // Solo aprende si está ONLINE
    if (mode === 'online' && user && items.length > 0) {
      await trackPurchase(user.uid, items); // Primero aprende (en Firestore)
    }
    clearCart(); // Luego vacía el carrito
  };

  // (Mantenemos la lógica de 'Guardar Lista' que ya tenías)
  const saveCurrentCartAsList = async () => {
  if (!user || !user.uid) {
    alert("Debes iniciar sesión para guardar la lista");
    return;
  }

  let ownerUid;
  try {
    ownerUid = await getUserUidFromFirestore(user.uid);
  } catch (err) {
    console.error(err);
    alert("No se pudo obtener el UID del usuario");
    return;
  }

  const products = items.map(it => ({ name: it.name, quantity: it.quantity }));

  try {
    const listId = await createNewList(ownerUid, products);
    alert(`Lista creada con ID: ${listId}`);

    // ✅ Genera PDF aquí mismo
    generatePdf(products);
  } catch (err) {
    console.error(err);
    alert("Error al crear la lista");
  }
};

  return (
    <div className="row">
      <div className="col">
        <div className="card">
          <h2>Tu carrito</h2>
          <form onSubmit={onAdd} style={{ display: 'flex', gap: '.5rem', flexDirection: 'column' }}>
            {/* ... (inputs de producto y cantidad) ... */}
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
              <button className="btn" type="submit">Añadir</button>
              
              <button 
                className="btn secondary" 
                type="button" 
                onClick={clearCart}
                disabled={items.length === 0}
              >
                Vaciar
              </button>

              {/* --- 4. VISIBILIDAD DEL BOTÓN INVERTIDA --- */}
              {/* Ahora solo se muestra en modo 'online' */}
              {mode === 'online' && (
                <button 
                  className="btn accent" 
                  type="button" 
                  onClick={onSimulatePurchase}
                  disabled={items.length === 0}
                  style={{ marginLeft: 'auto' }} 
                >
                  Simular Compra
                </button>
              )}
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
           
           {/* Botón Guardar lista (se muestra si hay items y estás online) */}
           {mode === 'online' && items.length > 0 && (
            <button
              className="btn" // (Le he quitado el 'primary' que no existe en tu CSS)
              style={{ marginTop: '1rem' }}
              onClick={saveCurrentCartAsList} 
            >
              Guardar lista
            </button>
           )}
        </div>
      </div>
    </div>
  );
}