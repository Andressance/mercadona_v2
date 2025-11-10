import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import { useLocalStorage } from '../../hooks/useLocalStorage.js';
import { ensureDefaultList, subscribeToList, addListItem, removeListItem, toggleListItem } from '../../services/firestore.js';

const CartCtx = createContext(null);

export function CartProvider({ children }) {
  const { user, mode } = useAuth();
  const [localItems, setLocalItems] = useLocalStorage('cart.items', []);
  const [onlineItems, setOnlineItems] = useState([]);
  const [currentListId, setCurrentListId] = useState(null);

  useEffect(() => {
    let unsub;
    if (mode === 'online' && user) {
      (async () => {
        const listId = await ensureDefaultList(user.uid);
        setCurrentListId(listId);
        unsub = subscribeToList(listId, setOnlineItems);
      })();
    } else {
      setCurrentListId(null);
      setOnlineItems([]);
    }
    return () => { if (unsub) unsub(); };
  }, [user, mode]);

  const items = mode === 'online' ? onlineItems : localItems;

  // --- FUNCIÓN addItem MODIFICADA ---
  const addItem = async ({ name, quantity }) => {
    if (!name) return;
    // Normalizamos el nombre para evitar duplicados por mayúsculas/minúsculas
    const normalizedName = name.toLowerCase(); 

    if (mode === 'online' && currentListId) {
      // La lógica online la delegamos a addListItem (ver firestore.js)
      await addListItem(currentListId, { name, quantity });
    } else {
      // --- LÓGICA LOCAL MODIFICADA ---
      const existingItem = localItems.find(it => it.name.toLowerCase() === normalizedName);
      
      if (existingItem) {
        // Si existe, actualiza la cantidad
        setLocalItems(
          localItems.map(it => 
            it.name.toLowerCase() === normalizedName
              ? { ...it, quantity: it.quantity + quantity } // Suma la cantidad
              : it
          )
        );
      } else {
        // Si no existe, añádelo nuevo
        const id = crypto.randomUUID();
        setLocalItems([...localItems, { id, name, quantity, checked: false }]);
      }
    }
  };
  // --- FIN DE LA MODIFICACIÓN ---

  const removeItem = async (id) => {
    if (mode === 'online' && currentListId) {
      await removeListItem(currentListId, id);
    } else {
      setLocalItems(localItems.filter((it) => it.id !== id));
    }
  };

  const toggleItem = async (id) => {
    if (mode === 'online' && currentListId) {
      await toggleListItem(currentListId, id);
    } else {
      setLocalItems(localItems.map((it) => it.id === id ? { ...it, checked: !it.checked } : it));
    }
  };

  const clearCart = async () => {
    if (mode === 'online' && currentListId) {
      for (const it of onlineItems) { await removeListItem(currentListId, it.id); }
    } else {
      setLocalItems([]);
    }
  };

  return (
    <CartCtx.Provider value={{ items, addItem, removeItem, toggleItem, clearCart, currentListId }}>
      {children}
    </CartCtx.Provider>
  );
}

export const useCart = () => useContext(CartCtx);