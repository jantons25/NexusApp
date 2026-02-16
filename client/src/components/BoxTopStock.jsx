import "../css/boxTopStock.css";

function BoxTopStock({ productos }) {
  // Calcular stock por producto
  const stockPorProducto = productos.map((producto) => {
    const nombre = producto.nombre || "Producto sin nombre";
    const ingresos = producto.ingresos || 0;
    const vendida = producto.cantidad_vendida || 0;
    const repuesta = producto.cantidad_repuesta || 0;
    const cortesia = producto.cantidad_cortesia || 0;

    const stock = ingresos - (vendida + repuesta + cortesia);

    return { nombre, stock };
  });

  // Filtrar y ordenar por mayor stock
  const topStock = stockPorProducto
    .filter(p => p.stock > 0)
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 5); // Top 5

  return (
    <div className="card-top-productos">
      <h4>Top Productos en Stock</h4>
      <ul className="lista-productos">
        {topStock.map((producto, index) => (
          <li key={index} className="producto-item">
            <span className="producto-nombre">{producto.nombre}</span>
            <span className="producto-cantidad">{producto.stock}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default BoxTopStock;
