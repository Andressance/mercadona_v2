import { Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar.jsx';
import Home from './pages/Home.jsx';
// Importamos las nuevas páginas
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import CartPage from './pages/Cart.jsx';
import AlwaysBuyPage from './pages/AlwaysBuy.jsx';
import SharedListsPage from './pages/SharedLists.jsx';
import InvitationJoinPage from './pages/InvitationJoin.jsx';
import { useAuth } from './modules/auth/AuthContext.jsx';

export default function App() {
  const { mode } = useAuth();
  return (
    <div className="app">
      <NavBar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          {/* --- RUTAS MODIFICADAS --- */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
          {/* La ruta /auth ya no existe */}
          {/* --- FIN MODIFICADAS --- */}
          <Route path="/carrito" element={<CartPage />} />
          <Route path="/siempre" element={<AlwaysBuyPage />} />
          <Route path="/listas" element={<SharedListsPage />} />
          <Route path="/invitar/:listId" element={<InvitationJoinPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="footer">Modo: {mode === 'local' ? 'Invitado (local)' : 'Online (Firebase)'}</footer>
    </div>
  );
}