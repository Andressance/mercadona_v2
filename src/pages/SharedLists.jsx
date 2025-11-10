import { useEffect, useState } from 'react';
import { useAuth } from '../modules/auth/AuthContext.jsx';
import { createList, getListsForUser } from '../services/firestore.js';
import { jsPDF } from "jspdf";

export default function SharedListsPage() {
  const { user, mode } = useAuth();
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (mode === 'online' && user) {
        const res = await getListsForUser(user.uid);
        setLists(res);
      } else {
        setLists([]);
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

  const showCart = () => {
    const url = `${window.location.origin}/carrito`;
    navigator.clipboard.writeText(url);
    window.location.href = url
  }

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
            <button className="btn secondary" onClick={() => showCart()}>Mostrar Carrito</button>
            <button className="btn secondary" onClick={() => copyLink(l.id)}>Copiar enlace</button>
            <button className="btn secondary" onClick={() => createPdf()}> Descargar lista</button>
          </li>
        ))}
      </ul>
    </div>
  );
}