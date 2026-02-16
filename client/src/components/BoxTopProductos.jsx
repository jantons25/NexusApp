import "../css/boxTopProductos.css"; // Asegúrate de crear/ajustar este CSS

function BoxTopProductos({ ventas }) {
  // Procesar el top 5 de productos más vendidos
  const conteoProductos = {};

  ventas.forEach((venta) => {
    const producto = venta.producto?.nombre || "Producto sin nombre";
    conteoProductos[producto] = (conteoProductos[producto] || 0) + venta.cantidad;
  });

  const topProductos = Object.entries(conteoProductos)
    .sort((a, b) => b[1] - a[1]) // Orden descendente por cantidad
    .slice(0, 5); // Top 5

  return (
    <div className="card-top-productos">
      <h4>Top 5 Productos Vendidos</h4>
      <ul className="lista-productos">
        {topProductos.map(([nombre, cantidad], index) => (
          <li key={index} className="producto-item">
            <span className="producto-nombre">{nombre}</span>
            <span className="producto-cantidad">{cantidad}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default BoxTopProductos;
