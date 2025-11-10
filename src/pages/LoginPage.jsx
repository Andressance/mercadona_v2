import { useState } from 'react';
import { useAuth } from '../modules/auth/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';

export default function LoginPage() {
  const { login, useLocalMode } = useAuth();
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
      navigate('/'); // Redirige al inicio tras login exitoso
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row">
      <div className="col">
        <div className="card">
          <h2>Acceder</h2>
          <form onSubmit={onLogin} style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
            <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className="input" type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
            <div style={{ display: 'flex', gap: '.5rem', marginTop: '.5rem' }}>
              <button className="btn" type="submit" disabled={loading}>Entrar</button>
              <button className="btn secondary" type="button" onClick={useLocalMode}>Usar sin registro</button>
            </div>
            {error && <p className="muted" style={{ color: 'red', marginTop: '.5rem' }}>{error}</p>}
            
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