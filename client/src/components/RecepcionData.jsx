import "../css/recepcionData.css";
import BoxDataCircular from "./BoxDataCircular.jsx";
import BoxDatos from "./BoxDatos.jsx";
import BoxDataGraficoBarra from "./BoxDataGraficoBarra.jsx";
import BoxTopProductos from "./BoxTopProductos.jsx";
import BoxTopStock from "./BoxTopStock.jsx";
import BoxTopSinStock from "./BoxTopSinStock.jsx";
import Dashboard from "../pages/Dashboard.jsx";

function RecepcionData({
  ventas,
  compras,
  productos,
  reposiciones,
  cortesias,
}) {
  const filtroBoxDatos = "hoy";
  return (
    <div className="recepcion-data grid place-content-center">
      {/* <div className="container">
        <h1 className="text-2xl bold font-medium">Dashboard Diao</h1>
        <p className="p_final">
          En este panel podrás ver un resumen general de la actividad del
          sistema. Aquí encontrarás los datos más importantes de manera rápida y
          visual: tus ventas, compras, productos más vendidos y el estado actual
          del inventario. Este espacio te permite conocer cómo va tu operación
          sin necesidad de revisar cada módulo. Si necesitas actualizar la
          información o agregar nuevos registros, puedes hacerlo fácilmente
          desde los botones disponibles en la parte superior.
        </p>
        <div>
          <Dashboard />
        </div>
      </div> */}
      En Proceso...
    </div>
  );
}

export default RecepcionData;
