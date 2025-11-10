import { NavLink, useLocation, useNavigate } from 'react-router-dom'; // Importa useNavigate
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../modules/auth/AuthContext.jsx';

export default function NavBar() {
  const { user, mode, logout, useLocalMode } = useAuth();
  const location = useLocation();
  const navRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, x: 0 });
  const navigate = useNavigate(); // Hook para navegar

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

  // --- CAMBIO AQUÍ ---
  // Función para manejar el clic en "Invitado"
  const onGuestAccess = () => {
    useLocalMode(); // 1. Establece el modo invitado
    navigate('/carrito'); // 2. Redirige al carrito
  };
  // --- FIN DEL CAMBIO ---

  return (
    <nav className="nav" ref={navRef}>
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
        {/* Esto cumple tu requisito 4: muestra estado (invitado o email) */}
        {mode === 'local' ? (
          // Usamos la nueva función 'onGuestAccess'
          <button className="btn secondary" onClick={onGuestAccess}>Invitado</button>
        ) : (
          <span className="badge">{user?.email || 'Usuario'}</span>
        )}

        {/* El enlace a '/login' solo se muestra si NO hay usuario */}
        {!user && (
          <NavLink to="/login" className={({ isActive }) => (isActive ? 'active' : undefined)}>Acceso</NavLink>
        )}
        
        {/* El botón 'Salir' solo se muestra si SÍ hay usuario */}
        {user && (
          <button className="btn secondary" onClick={logout}>Salir</button>
        )}
      </div>
    </nav>
  );
}