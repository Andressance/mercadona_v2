import { useState } from 'react';
import { useAuth } from '../modules/auth/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const onRegister = async (e) => {
    e.preventDefault();
    if (!nombre || !apellidos || !email || !password) {
      setError('Todos los campos son obligatorios.');
      return;
    }
    setLoading(true); setError(''); setSuccess('');
    
    try {
      await register(email, password, nombre, apellidos);
      setSuccess('¡Registro completado! Serás redirigido a la página de acceso en 3 segundos...');
      // Muestra mensaje de éxito y redirige
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
    // No ponemos setLoading(false) aquí si hay éxito,
    // porque el componente se desmontará al redirigir
  };

  return (
    <div className="row">
      <div className="col">
        <div className="card">
          <h2>Registrarse</h2>
          <form onSubmit={onRegister} style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
            <input className="input" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            <input className="input" placeholder="Apellidos" value={apellidos} onChange={(e) => setApellidos(e.target.value)} />
            <input className="input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className="input" type="password" placeholder="Contraseña (mín. 6 caracteres)" value={password} onChange={(e) => setPassword(e.target.value)} />
            
            <div style={{ display: 'flex', gap: '.5rem', marginTop: '.5rem' }}>
              <button className="btn" type="submit" disabled={loading}>Registrarme</button>
            </div>
            
            {error && <p className="muted" style={{ color: 'red', marginTop: '.5rem' }}>{error}</p>}
            {success && <p className="muted" style={{ color: 'green', marginTop: '.5rem' }}>{success}</p>}
            
            <p className="muted" style={{ marginTop: '1rem' }}>
              ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
            </p>
          </form>
        </div>
      </div>
      <div className="col">
        <div className="card">
          <h2>Privacidad</h2>
          <p className="muted">
            Al registrarte, tus datos de perfil (nombre, email) y tus listas se guardarán
            de forma segura en Firebase para permitir la sincronización entre dispositivos
            y la colaboración en listas compartidas.
          </p>
        </div>
      </div>
    </div>
  );
}