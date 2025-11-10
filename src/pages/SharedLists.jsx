import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; // 1. IMPORTAR LINK
import { useAuth } from '../modules/auth/AuthContext.jsx';
import { createList, getListsForUser } from '../services/firestore.js';
import { jsPDF } from "jspdf";
import { sendInvitation, getInvitationsForUser, acceptInvitation, rejectInvitation } from '../services/invitations'; 

export default function SharedListsPage() {
  const { user, mode } = useAuth();
  const [lists, setLists] = useState([]);
  const [invitedLists, setInvitedLists] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (mode === 'online' && user) {
        const res = await getListsForUser(user.uid);
        setLists(res);
        // (Tu código de invitaciones se mantiene)
        const invites = await getInvitationsForUser(user.email);
        setInvitedLists(invites);
      } else {
        setLists([]);
        setInvitedLists([]);
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
      // Esta función crea una lista VACÍA (items: [])
      const id = await createList({ name, ownerId: user.uid });
      // El alert se mantiene igual
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

  // --- FUNCIÓN createPdf CORREGIDA ---
  // Ahora acepta los items de la lista como argumento
  const createPdf = (items) => {
    if (!items || items.length === 0) {
      alert("Esta lista está vacía, no se puede generar un PDF.");
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Lista de Compra', 10, 10);
    let yPosition = 20;

    items.forEach((item, index) => {
      doc.rect(10, yPosition - 4, 5, 5);
      // Usamos item.name (el campo en firestore) no item.nombre
      doc.text(`${item.name || 'Producto'} x${item.quantity}`, 20, yPosition);
      yPosition += 10;
    });

    doc.save('lista_compartida.pdf');
  }
  // --- FIN DE LA CORRECCIÓN ---


  const inviteMembers = async () => {
    // ... (tu lógica de invitar se mantiene)
  };

  const handleAcceptInvite = async (listId) => {
    // ... (tu lógica de aceptar se mantiene)
  };

  const handleRejectInvite = async (listId) => {
    // ... (tu lógica de rechazar se mantiene)
  };

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
              
              {/* --- BOTÓN "MOSTRAR CARRITO" CAMBIADO POR LINK --- */}
              <Link to={`/lista/${l.id}`} className="btn secondary">
                Ver / Editar lista
              </Link>
              
              <button className="btn secondary" onClick={() => copyLink(l.id)}>Copiar enlace</button>
              
              {/* Le pasamos l.items a la función createPdf */}
              <button className="btn secondary" onClick={() => createPdf(l.items)}> Descargar lista</button>
              
              <button className="btn secondary" onClick={() => inviteMembers()}> Invitar miembros</button>
            </li>
          ))}
        </ul>
      </div>
      
      {/* ... (tu sección de invitaciones se mantiene) ... */}
      <div className="Invited">
         {/* ... */}
      </div>
    </div>
  );
}