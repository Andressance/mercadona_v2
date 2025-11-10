export default function Home() {
  return (
    <div className="card">
      <h1>Mercart – Asistente inteligente de compra</h1>
      <p>
        Gestiona tu carrito dinámico, comparte listas y recibe sugerencias basadas en hábitos,
        productos esenciales, complementarios y de temporada. Úsala sin registro (datos locales)
        o inicia sesión para sincronizar en Firebase y colaborar en tiempo real.
      </p>
      <div className="row">
        <div className="col">
          <h3>Características</h3>
          <ul>
            <li>Carrito dinámico con edición en tiempo real</li>
            <li>Sugerencias automáticas según hábitos y temporada</li>
            <li>Listas compartidas con enlaces de invitación</li>
            <li>Modo invitado local sin registro</li>
            <li>Sección “Siempre compro” para listas recurrentes</li>
          </ul>
        </div>
        <div className="col">
          <h3>Cómo empezar</h3>
          <ol>
            <li>Entra en Carrito y añade productos</li>
            <li>Activa sugerencias desde la barra lateral</li>
            <li>Ve a Listas para crear y compartir</li>
            <li>Usa Acceso para registrarte o entrar</li>
          </ol>
        </div>
      </div>
    </div>
  );
}