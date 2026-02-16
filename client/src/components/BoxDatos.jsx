import "../css/boxDatos.css";

function BoxDatos({ ventas, compras, filtro = "general" }) {
  const esHoy = (fecha) => {
    if (!fecha) return false;
    const d = new Date(fecha);
    const hoy = new Date();

    return (
      d.getFullYear() === hoy.getFullYear() &&
      d.getMonth() === hoy.getMonth() &&
      d.getDate() === hoy.getDate()
    );
  };

  const aplicarFiltroFecha = (lista) => {
    if (!Array.isArray(lista)) return [];
    if (filtro === "hoy") {
      return lista.filter((item) => esHoy(item.fecha)); // cambia "fecha" si tu campo se llama distinto
    }
    // "general" => devuelve todo
    return lista;
  };

  const ventasFiltradas = aplicarFiltroFecha(ventas);
  const comprasFiltradas = aplicarFiltroFecha(compras);

  const totalVentas = Array.isArray(ventasFiltradas)
    ? ventasFiltradas.reduce((total, venta) => {
        const importe_total = venta.importe_venta || 0;
        return total + importe_total;
      }, 0)
    : 0;

  const totalCompras = Array.isArray(comprasFiltradas)
    ? comprasFiltradas.reduce((total, compra) => {
        const importe_total = compra.importe_compra || 0;
        return total + importe_total;
      }, 0)
    : 0;

  const esModoHoy = filtro === "hoy";

  return (
    <div className="box-datos">
      <div className="container">
        <div className="cabecera">
          <div className="barra"></div>
          <div className="texto">
            {totalVentas > 0 ? (
              <>
                <span>{esModoHoy ? "Ventas de hoy" : "Ventas"}</span>
                <p>S/{totalVentas.toFixed(2)}</p>
              </>
            ) : totalCompras > 0 ? (
              <>
                <span>{esModoHoy ? "Compras de hoy" : "Compras"}</span>
                <p>S/{totalCompras.toFixed(2)}</p>
              </>
            ) : (
              <p>S/0.00</p>
            )}
          </div>
        </div>
        <div className="descripcion">
          {Array.isArray(ventas) ? (
            // MODO VENTAS
            totalVentas > 0 ? (
              <p>
                Importe total de ventas {esModoHoy ? "de hoy" : "en general"}
              </p>
            ) : (
              <p>
                {esModoHoy
                  ? "No hay ventas registradas hoy."
                  : "No hay ventas registradas."}
              </p>
            )
          ) : Array.isArray(compras) ? (
            // MODO COMPRAS
            totalCompras > 0 ? (
              <p>
                Importe total de compras {esModoHoy ? "de hoy" : "en general"}
              </p>
            ) : (
              <p>
                {esModoHoy
                  ? "No hay compras registradas hoy."
                  : "No hay compras registradas."}
              </p>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default BoxDatos;
