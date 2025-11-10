import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importamos useNavigate
import { useAuth } from '../modules/auth/AuthContext.jsx';

export default function AuthPage() {
  const { login, register, useLocalMode } = useAuth();
  const navigate = useNavigate(); // Hook para navegar

  // Estado para controlar qué vista mostrar: 'login' o 'register'
  const [view, setView] = useState('login'); 
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(''); // Para el mensaje de registro

  // --- Manejador de LOGIN ---
  const onLogin = async (e) => {
    e.preventDefault();
    setLoading(true); 
    setError('');
    setSuccess('');
    try { 
      await login(email, password);
      navigate('/carrito'); // 1. Logueado -> Va al carrito
    } catch (err) { 
      setError(err.message); 
    } finally { 
      setLoading(false); 
    }
  };

  // --- Manejador de REGISTRO ---
  const onRegister = async (e) => {
    e.preventDefault();
    setLoading(true); 
    setError('');
    setSuccess('');
    try { 
      await register(email, password);
      // 2. Registrado -> Vuelve al Login
      setSuccess('¡Cuenta creada! Ahora puedes iniciar sesión.');
      setView('login'); // Cambia la vista a 'login'
      setPassword(''); // Limpia la contraseña
    } catch (err) { 
      setError(err.message); 
    } finally { 
      setLoading(false); 
    }
  };

  // --- Manejador de INVITADO ---
  const onGuestMode = () => {
    useLocalMode();
    navigate('/carrito'); // 3. Invitado -> Va al carrito
  };

  // Limpia errores al cambiar de pestaña
  const switchView = (newView) => {
    setView(newView);
    setError('');
    setSuccess('');
    setPassword('');
  };

  return (
    // Contenedor principal para centrar la tarjeta
    <div className="auth-container">
      <div className="card" style={{ maxWidth: '450px', width: '100%' }}>
        
        {/* Pestañas de Logueo / Registro */}
        <div className="auth-tabs">
          <button 
            className={`auth-tab-btn ${view === 'login' ? 'active' : ''}`}
            onClick={() => switchView('login')}
          >
            Iniciar Sesión
          </button>
          <button 
            className={`auth-tab-btn ${view === 'register' ? 'active' : ''}`}
            onClick={() => switchView('register')}
          >
            Registrarse
          </button>
        </div>

        {/* Mensajes de éxito o error */}
        {error && <p className="muted" style={{ color: 'var(--error)', textAlign: 'center' }}>{error}</p>}
        {success && <p className="muted" style={{ color: 'var(--primary)', textAlign: 'center' }}>{success}</p>}

        {/* FORMULARIO (cambia según la vista) */}
        <form onSubmit={view === 'login' ? onLogin : onRegister}>
          <input 
            className="input mt-4" 
            placeholder="Email" 
            type="email"
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required
          />
          <input 
            className="input mt-2" 
            type="password" 
            placeholder="Contraseña" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required
            minLength={6}
          />
          
          <button className="btn mt-4" type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Cargando...' : (view === 'login' ? 'Entrar' : 'Crear Cuenta')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <p className="muted" style={{ marginBottom: '1rem' }}>O continúa sin guardar tus datos:</p>
          <button 
            className="btn secondary" 
            onClick={onGuestMode}
          >
            Usar sin registro
          </button>
        </div>
        
      </div>
    </div>
  );
}