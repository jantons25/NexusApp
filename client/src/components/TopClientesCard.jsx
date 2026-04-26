import { RefreshCw } from "lucide-react";

/**
 * Configuración visual por estado de orden.
 */
const STATUS_CONFIG = {
  Delivered: {
    text: "text-green-600",
    dot:  "bg-green-500",
    rowBg: "",
  },
  Processed: {
    text: "text-blue-500",
    dot:  "bg-blue-400",
    rowBg: "bg-green-50/60",
  },
  Cancelled: {
    text: "text-red-500",
    dot:  "bg-red-400",
    rowBg: "bg-red-50/60",
  },
};

const AVATAR_COLORS = ["#4A6CF7", "#22C55E", "#F0A500", "#C084FC", "#EF4444", "#06B6D4"];

/**
 * Avatar con iniciales del nombre.
 */
const Avatar = ({ name, colorIndex = 0 }) => (
  <div
    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 select-none"
    style={{ backgroundColor: AVATAR_COLORS[colorIndex % AVATAR_COLORS.length] }}
  >
    {name.slice(0, 2).toUpperCase()}
  </div>
);

/**
 * TopClientesCard — Tabla de top clientes / pedidos del mes.
 *
 * Props:
 *  - title    {string}   Título de la tarjeta
 *  - clients  {Array<{  name, address, date, status, price }>}
 *             Lista de clientes a mostrar
 *  - onRefresh {() => void}  Callback al pulsar el icono de refresco
 */
const TopClientesCard = ({
  title = "Customer order",
  onRefresh,
  clients = [
    { name: "Press",  address: "London",   date: "22.08.2024", status: "Delivered", price: "$920"  },
    { name: "Marina", address: "Man city", date: "24.08.2024", status: "Processed", price: "$452"  },
    { name: "Alex",   address: "Unknown",  date: "18.08.2024", status: "Cancelled", price: "$1200" },
    { name: "Robert", address: "New York", date: "03.08.2024", status: "Delivered", price: "$1235" },
    { name: "Sofia",  address: "Lima",     date: "01.08.2024", status: "Processed", price: "$880"  },
  ],
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4 hover:shadow-md transition-shadow duration-300 h-full">

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-700">{title}</p>
        <button
          onClick={onRefresh}
          className="text-gray-400 hover:text-gray-600 hover:rotate-180 transition-all duration-300"
          title="Refrescar"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Encabezado de columnas */}
      <div className="grid grid-cols-5 text-xs text-gray-400 font-medium pb-2 border-b border-gray-100 px-2">
        <span>Profile</span>
        <span>Address</span>
        <span>Date</span>
        <span>Status</span>
        <span className="text-right">Price</span>
      </div>

      {/* Filas */}
      <div className="flex flex-col gap-1 overflow-y-auto">
        {clients.map((client, i) => {
          const cfg = STATUS_CONFIG[client.status] ?? STATUS_CONFIG.Delivered;
          return (
            <div
              key={i}
              className={`grid grid-cols-5 items-center py-2.5 px-2 rounded-xl transition-colors ${cfg.rowBg} hover:bg-gray-50`}
            >
              {/* Perfil */}
              <div className="flex items-center gap-2 min-w-0">
                <Avatar name={client.name} colorIndex={i} />
                <span className="text-xs font-medium text-gray-700 truncate">{client.name}</span>
              </div>

              {/* Dirección */}
              <span className="text-xs text-gray-500">{client.address}</span>

              {/* Fecha */}
              <span className="text-xs text-gray-500">{client.date}</span>

              {/* Estado */}
              <span className={`flex items-center gap-1.5 text-xs font-medium ${cfg.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                {client.status}
              </span>

              {/* Precio */}
              <span className="text-xs font-semibold text-gray-700 text-right">{client.price}</span>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default TopClientesCard;
