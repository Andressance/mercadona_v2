import { Link } from 'react-router-dom';

export default function Home() {
  return (
    // Usamos estilos para centrar el contenido como en tu captura
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      marginTop: '4rem',
      textAlign: 'center'
    }}>

      {/* Título verde, como en la captura */}
      <h1 style={{
        color: 'var(--primary)', // Usa el color primario de tu styles.css
        fontSize: '2rem',
        fontWeight: '600',
        marginBottom: '1rem'
      }}>
        BIENVENIDO A Mercart
      </h1>

      <p style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
        Tu asistente inteligente de compra.
      </p>

      <p className="text-secondary" style={{ maxWidth: '500px', marginBottom: '2.5rem' }}>
        Gestiona tu carrito, comparte listas y recibe sugerencias. Inicia sesión para guardar tus datos
        en la nube o entra como invitado.
      </p>

      {/* --- AQUÍ ESTÁ LA SOLUCIÓN ---
        Cambiamos 'to="/carrito"' por 'to="/login"'.
      */}
      <Link to="/login" className="btn" style={{ fontSize: '1.1rem' }}>
        Comenzar
      </Link>

    </div>
  );
}