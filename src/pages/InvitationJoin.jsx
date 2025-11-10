import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../modules/auth/AuthContext.jsx';
import { joinListById } from '../services/firestore.js';

export default function InvitationJoinPage() {
  const { listId } = useParams();
  const { user } = useAuth();
  const [status, setStatus] = useState('');

  useEffect(() => {
    const run = async () => {
      if (!user) { setStatus('Necesitas iniciar sesión para unirte.'); return; }
      try { await joinListById(listId, user.uid); setStatus('Te has unido a la lista.'); }
      catch (e) { setStatus('Error: ' + e.message); }
    };
    run();
  }, [listId, user]);

  return (
    <div className="card">
      <h2>Invitación a lista</h2>
      <p className="muted">ID de lista: {listId}</p>
      <p>{status}</p>
    </div>
  );
}