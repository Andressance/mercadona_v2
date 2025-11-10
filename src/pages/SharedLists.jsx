import { useEffect, useState, useCallback } from 'react'; // 1. IMPORTAMOS useState y useCallback
import { useAuth } from '../modules/auth/AuthContext.jsx';
// 2. IMPORTAMOS la función para UNIRSE
import { createList, getListsForUser, joinListById } from '../services/firestore.js';

export default function SharedListsPage() {
  const { user, mode } = useAuth();
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- 3. NUEVO ESTADO PARA EL FORMULARIO DE UNIRSE ---
  const [joinUrl, setJoinUrl] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [joinSuccess, setJoinSuccess] = useState('');

  // 4. Mover la lógica de carga a una función reutilizable
  const loadLists = useCallback(async () => {
    if (mode === 'online' && user) {
      setLoading(true);
      try {
        const res = await getListsForUser(user.uid);
        setLists(res);
      } catch (e) {
        console.error("Error cargando listas:", e);
      } finally {
        setLoading(false);
      }
    } else {
      setLists([]);
    }
  }, [user, mode]);

  // 5. useEffect ahora solo llama a loadLists
  useEffect(() => {
    loadLists();
  }, [loadLists]);

  const onCreate = async () => {
    if (!user) return alert('Inicia sesión para crear listas');
    const name = prompt('Nombre de la lista');
    if (!name) return;
    setLoading(true);
    try {
      const id = await createList({ name, ownerId: user.uid });
      alert('Lista creada. Comparte el enlace: ' + `${window.location.origin}/invitar/${id}`);
      await loadLists(); // Refresca la lista
    } finally {
      setLoading(false);
    }
  };

  const copyLink = (id) => {
    const url = `${window.location.origin}/invitar/${id}`;
    navigator.clipboard.writeText(url);
    alert('Enlace copiado: ' + url);
  };

  // --- 6. NUEVA FUNCIÓN PARA MANEJAR EL FORMULARIO DE UNIRSE ---
  const onJoinList = async (e) => {
    e.preventDefault();
    if (!user) {
      setJoinError('Necesitas iniciar sesión para unirte a una lista.');
      return;
    }
    setJoinLoading(true);
    setJoinError('');
    setJoinSuccess('');

    try {
      // Extrae el ID del enlace (ej: .../invitar/LIST_ID)
      const parts = joinUrl.trim().split('/');
      const listId = parts[parts.length - 1];

      if (!listId) {
        throw new Error('El enlace no parece válido.');
      }

      await joinListById(listId, user.uid);
      setJoinSuccess('¡Te has unido a la lista! Actualizando...');
      setJoinUrl('');
      await loadLists(); // Refresca la lista de "Tus Listas"
    } catch (err) {
      console.error(err);
      setJoinError(err.message || 'No se pudo unir a la lista. Verifica el enlace.');
    } finally {
      setJoinLoading(false);
    }
  };

  return (
    // 7. ESTRUCTURA ACTUALIZADA A GRID
    <div className="grid grid-cols-2">
      {/* Columna 1: Tus listas (código existente) */}
      <div className="card">
        <h2>Tus Listas</h2>
        {mode === 'local' && <p className="muted">Inicia sesión para crear y ver tus listas.</p>}
        
        <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1rem' }}>
          <button className="btn" disabled={!user || loading} onClick={onCreate}>
            Crear lista nueva
          </button>
        </div>

        {loading && <p className="muted">Cargando tus listas...</p>}

        <ul className="list">
          {lists.map((l) => (
            <li key={l.id}>
              <span style={{ flexGrow: 1 }}>{l.name}</span>
              <span className="badge badge-secondary">
                {l.memberIds?.length || 1} {l.memberIds?.length > 1 ? 'miembros' : 'miembro'}
              </span>
              <button className="btn secondary" onClick={() => copyLink(l.id)}>Copiar enlace</button>
            </li>
          ))}
        </ul>
      </div>

      {/* Columna 2: Unirse a una lista (nuevo) */}
      <div className="card">
        <h2>Unirse a una Lista</h2>
        <p className="muted" style={{ marginBottom: '1rem' }}>
          Pega el enlace de invitación que te han compartido para unirte a la lista de otro usuario.
        </p>

        <form onSubmit={onJoinList} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input 
            className="input"
            placeholder="Pega el enlace aquí..."
            value={joinUrl}
            onChange={(e) => setJoinUrl(e.target.value)}
            disabled={!user}
          />
          <button className="btn accent" type="submit" disabled={!user || joinLoading}>
            {joinLoading ? 'Uniéndose...' : 'Unirme a la lista'}
          </button>
          
          {joinError && <p className="muted" style={{ color: 'var(--error)' }}>{joinError}</p>}
          {joinSuccess && <p className="muted" style={{ color: 'var(--primary)' }}>{joinSuccess}</p>}
          {!user && <p className="muted">Debes iniciar sesión para poder unirte a una lista.</p>}
        </form>
      </div>
    </div>
  );
}