import { useNavigate } from 'react-router-dom'; // Importamos 'useNavigate'

export default function Home() {
  const navigate = useNavigate(); // Inicializamos el hook

  // Creamos una función para manejar el clic
  const handleComenzarClick = () => {
    navigate('/auth'); // Navega a la página de autenticación
  };

  return (
    // Contenedor centrado para la bienvenida
    <div style={{ textAlign: 'center', maxWidth: '600px', margin: '4rem auto' }}>
      
      <h1 style={{ fontSize: '2.5rem', color: 'var(--primary)' }}>
        Bienvenido a Mercart
      </h1>
      
      <p className="text-secondary" style={{ fontSize: '1.25rem', marginTop: '1rem' }}>
        Tu asistente inteligente de compra.
      </p>
      
      <p className="muted" style={{ marginTop: '1.5rem', marginBottom: '2.5rem' }}>
        Gestiona tu carrito, comparte listas y recibe sugerencias. 
        Inicia sesión para guardar tus datos en la nube o entra como invitado.
      </p>

      {/* Reemplazamos <Link> por <button> con el evento onClick */}
      <button 
        onClick={handleComenzarClick} 
        className="btn" 
        style={{ padding: '1rem 2rem', fontSize: '1.25rem' }}
      >
        Comenzar
      </button>

    </div>
  );
}