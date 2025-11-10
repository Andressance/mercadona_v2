import { NavLink, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../modules/auth/AuthContext.jsx';

export default function NavBar() {
  const { user, mode, logout, useLocalMode } = useAuth();
  const location = useLocation();
  const navRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, x: 0 });

  const updateIndicator = () => {
    const navEl = navRef.current;
    if (!navEl) return;
    const activeLink = navEl.querySelector('a.active');
    const containerRect = navEl.getBoundingClientRect();
    if (activeLink) {
      const rect = activeLink.getBoundingClientRect();
      const width = rect.width;
      const x = rect.left - containerRect.left;
      setIndicatorStyle({ width, x });
    }
  };

  useEffect(() => {
    updateIndicator();
  }, [location.pathname]);

  useEffect(() => {
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, []);
  return (
    <nav className="nav" ref={navRef}>
      {/* Logo a la izquierda del botón Inicio */}
      <img src="/logo.jpg" alt="Logo Mercart" className="logo" />
      <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : undefined)}>Inicio</NavLink>
      <NavLink to="/carrito" className={({ isActive }) => (isActive ? 'active' : undefined)}>Carrito</NavLink>
      <NavLink to="/siempre" className={({ isActive }) => (isActive ? 'active' : undefined)}>Siempre compro</NavLink>
      <NavLink to="/listas" className={({ isActive }) => (isActive ? 'active' : undefined)}>Listas compartidas</NavLink>
      <span
        className="nav-indicator"
        style={{
          width: indicatorStyle.width,
          transform: `translateX(${indicatorStyle.x}px)`,
        }}
      />
      <div className="nav-right">
        {mode === 'local' ? (
          <button className="btn secondary" onClick={() => useLocalMode()}>Invitado</button>
        ) : (
          <span className="badge">{user?.email || 'Usuario'}</span>
        )}
        <NavLink to="/auth" className={({ isActive }) => (isActive ? 'active' : undefined)}>Acceso</NavLink>
        {user && (
          <button className="btn secondary" onClick={logout}>Salir</button>
        )}
      </div>
    </nav>
  );
}