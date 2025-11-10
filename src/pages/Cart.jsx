import { useState, useEffect} from 'react';
import { useCart } from '../modules/cart/CartContext.jsx';
import { useAuth } from '../modules/auth/AuthContext.jsx'; 
import { useSuggestions, trackPurchase, getAlwaysList } from '../services/suggestions.js'; 
import { getAllProducts } from '../services/product.js';
// --- IMPORTACIONES MODIFICADAS ---
// Importamos las funciones de 'firestore.js', no del antiguo 'list.js'
import { 
  createList, 
  getListsForUser, 
  addCartItemsToList 
} from '../services/firestore.js';
// (Ya no necesitamos 'list.js')
// --- FIN IMPORTACIONES ---

export default function CartPage() {
  const { items, addItem, removeItem, toggleItem, clearCart, currentListId } = useCart(); // Traemos el currentListId
  const { user, mode } = useAuth(); 
  const [name, setName] = useState('');
  const [qty, setQty] = useState(1);
  const [allProducts, setAllProducts] = useState([]);
  const [matches, setMatches] = useState([]);
  const [alwaysList, setAlwaysList] = useState([]);

  // --- NUEVO ESTADO PARA EL MODAL ---
  const [showListModal, setShowListModal] = useState(false);
  const [userLists, setUserLists] = useState([]);
  // --- FIN NUEVO ESTADO ---
  
  useEffect(() => {
    if (mode === 'online' && user) {
      getAlwaysList(user.uid).then(setAlwaysList);
    } else {
      setAlwaysList([]); 
    }
  }, [mode, user, items]); 

  const suggestions = useSuggestions(items, alwaysList);

  useEffect(() => {
    getAllProducts().then(res => {
      console.log('Productos cargados:', res);
      setAllProducts(res);
    });
  }, []);

  // ... (onChangeName, onSelectMatch, onAdd no cambian) ...
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

  const onSimulatePurchase = async () => {
    if (mode !== 'online' || !user) {
      alert('Debes iniciar sesión para usar la función de "Siempre Compro".');
      return;
    }
    if (items.length > 0) {
      await trackPurchase(user.uid, items); 
    }
    clearCart(); 
  };

  // --- "GUARDAR LISTA" CORREGIDO ---
  // Ahora crea una NUEVA LISTA VACÍA, como en SharedLists.jsx
  const saveCurrentCartAsList = async () => {
    if (!user || !user.uid) {
      alert("Debes iniciar sesión para guardar la lista");
      return;
    }
    
    const name = prompt("Nombre para tu NUEVA lista vacía:");
    if (!name) return; // Si el usuario cancela

    try {
      // Llama a createList de firestore.js, que crea una lista con items: []
      const listId = await createList({ name, ownerId: user.uid });
      alert(`¡Nueva lista vacía "${name}" creada!\nYa puedes verla en "Listas compartidas".`);
      // Ya no genera un PDF de una lista vacía
    } catch (err) {
      console.error(err);
      alert("Error al crear la lista");
    }
  };
  
  // --- NUEVAS FUNCIONES PARA EL MODAL ---
  
  // 1. Abre el modal y carga las listas del usuario
  const handleOpenListModal = async () => {
    if (mode !== 'online' || !user) {
      alert("Debes iniciar sesión para añadir productos a una lista.");
      return;
    }
    try {
      const lists = await getListsForUser(user.uid);
      // Filtramos la "lista/carrito principal" para no añadir items a ella misma
      const sharedLists = lists.filter(l => l.id !== currentListId);
      setUserLists(sharedLists);
      setShowListModal(true);
    } catch (e) {
      console.error(e);
      alert("Error al cargar tus listas.");
    }
  };

  // 2. Se llama al hacer clic en una lista del modal
  const handleSelectList = async (list) => {
    try {
      // Llama a la nueva función de firestore
      await addCartItemsToList(list.id, items);
      alert(`¡Productos añadidos a la lista "${list.name}"!`);
      setShowListModal(false);
      clearCart(); // Vaciamos el carrito después de "guardar"
    } catch (e) {
      console.error(e);
      alert("Error al añadir los productos.");
    }
  };
  // --- FIN NUEVAS FUNCIONES ---

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
              <button 
                className="btn accent" 
                type="button" 
                onClick={onSimulatePurchase}
                disabled={items.length === 0}
                style={{ marginLeft: 'auto' }} 
              >
                Simular Compra
              </button>
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
           
           {/* --- BOTONES DE GUARDADO MODIFICADOS --- */}
           {items.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              {/* Este botón ahora crea una lista vacía */}
              <button
                className="btn" 
                onClick={saveCurrentCartAsList} 
              >
                Crear nueva lista
              </button>
              
              {/* Este es el NUEVO botón de tu funcionalidad */}
              <button
                className="btn" 
                style={{ background: 'var(--accent)', color: 'white' }}
                onClick={handleOpenListModal}
              >
                Añadir a lista...
              </button>
            </div>
           )}
        </div>
      </div>
      
      {/* --- MODAL PARA SELECCIONAR LISTA (AÑADIDO) --- */}
      {showListModal && (
        // Fondo del modal
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0, 0, 0, 0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}
        onClick={() => setShowListModal(false)} // Cierra al hacer clic fuera
        >
          {/* Contenido del modal */}
          <div className="card" 
               style={{ minWidth: '300px', maxWidth: '500px' }}
               onClick={(e) => e.stopPropagation()} // Evita que se cierre al hacer clic dentro
          >
            <h3>Añadir a una lista existente</h3>
            <p className="muted">Los productos del carrito se añadirán y sus cantidades se sumarán a la lista que selecciones.</p>
            
            {userLists.length > 0 ? (
              <ul className="list" style={{ marginTop: '1rem' }}>
                {userLists.map(list => (
                  <li key={list.id} 
                      style={{ justifyContent: 'flex-start', cursor: 'pointer' }}
                      onClick={() => handleSelectList(list)}
                  >
                    <span>{list.name}</span>
                    <span className="badge" style={{ marginLeft: 'auto' }}>
                      {list.items?.length || 0} productos
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted" style={{ marginTop: '1rem' }}>No tienes otras listas compartidas. Puedes crear una desde la pestaña "Listas".</p>
            )}

            <button 
              className="btn secondary" 
              style={{ marginTop: '1rem' }}
              onClick={() => setShowListModal(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
      {/* --- FIN DEL MODAL --- */}
    </div>
  );
}