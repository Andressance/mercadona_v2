import { Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar.jsx';
import WelcomePage from './pages/Welcome.jsx';
import AuthPage from './pages/Auth.jsx';
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
          <Route path="/" element={<WelcomePage />} />
          <Route path="/auth" element={<AuthPage />} />
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