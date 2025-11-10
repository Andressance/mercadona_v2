import { NavLink } from 'react-router-dom';
import { useAuth } from '../modules/auth/AuthContext.jsx';

export default function NavBar() {
  const { user, mode, logout, useLocalMode } = useAuth();
  return (
    <nav className="nav">
      <NavLink to="/">Inicio</NavLink>
      <NavLink to="/carrito">Carrito</NavLink>
      <NavLink to="/siempre">Siempre compro</NavLink>
      <NavLink to="/listas">Listas compartidas</NavLink>
      <div className="nav-right">
        {mode === 'local' ? (
          <button className="btn secondary" onClick={() => useLocalMode()}>Invitado</button>
        ) : (
          <span className="badge">{user?.email || 'Usuario'}</span>
        )}
        <NavLink to="/auth">Acceso</NavLink>
        {user && (
          <button className="btn secondary" onClick={logout}>Salir</button>
        )}
      </div>
    </nav>
  );
}