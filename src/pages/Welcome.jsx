import { useNavigate } from 'react-router-dom';
import { useAuth } from '../modules/auth/AuthContext.jsx';

export default function WelcomePage() {
  const navigate = useNavigate();
  const { mode, useLocalMode } = useAuth();

  const goAuth = () => navigate('/auth');
  const useGuest = () => { useLocalMode(); navigate('/carrito'); };

  return (
    <div className="card">
      <h1>Bienvenido</h1>
      <p className="muted">Elige cómo quieres usar la aplicación:</p>
      <div className="row" style={{ marginTop: '.5rem' }}>
        <div className="col">
          <div className="card">
            <h3>Registrarme</h3>
            <p className="muted">Crea cuenta para sincronizar y colaborar.</p>
            <button className="btn" onClick={goAuth}>Ir a registro</button>
          </div>
        </div>
        <div className="col">
          <div className="card">
            <h3>Iniciar sesión</h3>
            <p className="muted">Accede si ya tienes cuenta.</p>
            <button className="btn" onClick={goAuth}>Entrar</button>
          </div>
        </div>
        <div className="col">
          <div className="card">
            <h3>Invitado</h3>
            <p className="muted">Usa funciones locales con datos en tu dispositivo.</p>
            <button className="btn secondary" onClick={useGuest}>Entrar como invitado</button>
          </div>
        </div>
      </div>
      {mode === 'local' && (
        <p className="muted" style={{ marginTop: '.75rem' }}>
          Como invitado, siempre puedes iniciar sesión desde "Acceso" arriba a la derecha.
        </p>
      )}
    </div>
  );
}