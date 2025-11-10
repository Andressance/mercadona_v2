import { Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar.jsx';
import Home from './pages/Home.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import CartPage from './pages/Cart.jsx';
import AlwaysBuyPage from './pages/AlwaysBuy.jsx';
import SharedListsPage from './pages/SharedLists.jsx';
import InvitationJoinPage from './pages/InvitationJoin.jsx';
import ListPage from './pages/ListPage.jsx'; // 1. IMPORTAR LA NUEVA PÁGINA
import { useAuth } from './modules/auth/AuthContext.jsx';

export default function App() {
  const { mode } = useAuth();
  return (
    <div className="app">
      <NavBar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
          <Route path="/carrito" element={<CartPage />} />
          <Route path="/siempre" element={<AlwaysBuyPage />} />
          <Route path="/listas" element={<SharedListsPage />} />
          <Route path="/invitar/:listId" element={<InvitationJoinPage />} />
          {/* 2. AÑADIR LA NUEVA RUTA */}
          <Route path="/lista/:listId" element={<ListPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="footer">Modo: {mode === 'local' ? 'Invitado (local)' : 'Online (Firebase)'}</footer>
    </div>
  );
}