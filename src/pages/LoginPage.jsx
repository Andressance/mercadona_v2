import { useState } from 'react';
import { useAuth } from '../modules/auth/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';

// Helper para traducir errores de Firebase a español
function getAuthErrorES(errorCode) {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'El formato del correo electrónico no es válido.';
    case 'auth/user-not-found':
      return 'No se encontró ningún usuario con este correo electrónico.';
    case 'auth/wrong-password':
      return 'La contraseña es incorrecta.';
    case 'auth/invalid-credential':
      return 'El correo o la contraseña son incorrectos.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos fallidos. Tu cuenta ha sido bloqueada temporalmente.';
    default:
      return 'Error en el inicio de sesión. Revisa tus datos.';
  }
}

export default function LoginPage() {
  const { login } = useAuth(); // Esta es la línea corregida
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await login(email, password);
      navigate('/carrito'); 
    } catch (err) {
      setError(getAuthErrorES(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row">
      <div className="col">
        <div className="card">
          <h2>Iniciar Sesión</h2>
          <form onSubmit={onLogin} style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
            <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className="input" type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
            
            <div style={{ display: 'flex', gap: '.5rem', marginTop: '.5rem' }}>
              <button className="btn" type="submit" disabled={loading}>Entrar</button>
            </div>

            {/* --- ESTA LÍNEA MUESTRA EL ERROR EN ROJO --- */}
            {error && <p className="muted" style={{ color: 'var(--error)', marginTop: '.5rem' }}>{error}</p>}
            
            <p className="muted" style={{ marginTop: '1rem' }}>
              ¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
            </p>
          </form>
        </div>
      </div>
      <div className="col">
        <div className="card">
          <h2>Privacidad</h2>
          <p className="muted">
            En modo invitado, los datos se guardan sólo en tu dispositivo.
            Al registrarte/iniciar sesión, se sincronizan con Firebase para colaborar y
            acceder desde otros dispositivos.
          </p>
        </div>
      </div>
    </div>
  );
}