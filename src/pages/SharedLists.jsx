import { useEffect, useState } from 'react';
import { useAuth } from '../modules/auth/AuthContext.jsx';
import { createList, getListsForUser} from '../services/firestore.js';
import { jsPDF } from "jspdf";
import { useNavigate } from 'react-router-dom'; // Añadir al inicio
import { doc, getDoc } from 'firebase/firestore'; // Añadir al inicio
import { db } from '../services/firebase'; // Añadir al inicio

export default function SharedListsPage() {
  const navigate = useNavigate();
  const { user, mode } = useAuth();
  const [lists, setLists] = useState([]);
  const [invitedLists, setInvitedLists] = useState([]);
  const [loading, setLoading] = useState(false);

useEffect(() => {
  const load = async () => {
    if (mode === 'online' && user) {
      console.log('Cargando listas para user.uid:', user.uid); // LOG 5
      
      const res = await getListsForUser(user.uid);
      
      console.log('Listas obtenidas:', res); // LOG 6
      
      setLists(res);
      //const invites = await getInvitationsForUser(user.uid); // CAMBIA de user.email a user.uid
      //setInvitedLists(invites);
    } else {
      setLists([]);
      //setInvitedLists([]);
    }
  };
  load();
}, [user, mode]);


  const onCreate = async () => {
    if (!user) return alert('Inicia sesión para crear listas');
    const name = prompt('Nombre de la lista');
    if (!name) return;
    setLoading(true);
    try {
      const id = await createList({ name, ownerId: user.uid });
      alert('Lista creada. Comparte el enlace: ' + `${window.location.origin}/invitar/${id}`);
      const res = await getListsForUser(user.uid);
      setLists(res);
    } finally { setLoading(false); }
  };

  const copyLink = (id) => {
    const url = `${window.location.origin}/invitar/${id}`;
    navigator.clipboard.writeText(url);
    alert('Enlace copiado: ' + url);
  };

  const showCart = async (listId) => {
    try {
      // Obtener la lista de Firestore
      const listRef = doc(db, 'lists', listId);
      const listSnap = await getDoc(listRef);
      
      if (!listSnap.exists()) {
        alert('Lista no encontrada');
        return;
      }
      
      const listData = listSnap.data();
      
      // Navegar al carrito pasando los productos en el state
      navigate('/carrito', { 
        state: { 
          products: listData.products || [],
          listName: listData.name 
        } 
      });
    } catch (error) {
      console.error('Error cargando lista:', error);
      alert('Error al cargar la lista');
    }
  };

  const createPdf = () => {
    const carrito = JSON.parse(localStorage.getItem('carritoLista')) || [];

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('Lista de Compra', 10, 10);

    let yPosition = 20;

    carrito.forEach((item, index) => {
      // Dibujar cuadro para tick (sin funcionalidad de check al exportar pero visual)
      doc.rect(10, yPosition - 4, 5, 5);
      // Nombre del ítem al lado
      doc.text(item.nombre || 'Producto', 20, yPosition);
      yPosition += 10;
    });

    doc.save('carrito.pdf');
  }

  return (
    <div>
      <div className="card">
        <h2>Listas compartidas</h2>
        {mode === 'local' && <p className="muted">Para colaborar en tiempo real, inicia sesión.</p>}
        <div style={{ display: 'flex', gap: '.5rem' }}>
          <button className="btn" disabled={!user || loading} onClick={onCreate}>Crear lista</button>
        </div>
        <ul className="list" style={{ marginTop: '.5rem' }}>
          {lists.map((l) => (
            <li key={l.id}>
              <span>{l.name}</span>
              <span className="badge">miembros: {l.memberIds?.length || 1}</span>
              <button className="btn secondary" onClick={() => showCart(l.id)}>Mostrar Carrito</button>
              <button className="btn secondary" onClick={() => copyLink(l.id)}>Copiar enlace</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}