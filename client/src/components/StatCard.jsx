import { TrendingUp, TrendingDown } from "lucide-react";

/**
 * StatCard — Tarjeta de estadística de tipo KPI para el dashboard.
 *
 * Props:
 *  - title       {string}  Título de la métrica (ej. "Orders")
 *  - value       {number|string}  Valor principal (ej. 201)
 *  - change      {number}  Porcentaje de cambio (positivo o negativo, ej. 8.2)
 *  - changeLabel {string}  Etiqueta del período de comparación (ej. "since last month")
 *  - icon        {React.ElementType}  Ícono de lucide-react u otra librería
 */
const StatCard = ({
  title = "Orders",
  value = 0,
  change = 0,
  changeLabel = "since last month",
  icon: Icon,
}) => {
  const isPositive = change >= 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3 hover:shadow-md transition-shadow duration-300">
      {/* Header: título e ícono */}
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400">
          {Icon ? (
            <Icon className="w-5 h-5" />
          ) : (
            /* Cuadrado vacío por defecto (igual que en la imagen) */
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <rect x="3" y="3" width="18" height="18" rx="3" />
            </svg>
          )}
        </div>
      </div>

      {/* Valor principal */}
      <p className="text-4xl font-bold text-gray-800 leading-none">{value}</p>

      {/* Indicador de cambio */}
      <div className="flex items-center gap-1.5 text-xs font-medium">
        <span
          className={`flex items-center gap-0.5 ${isPositive ? "text-green-500" : "text-red-500"
            }`}
        >
          {isPositive ? (
            <TrendingUp className="w-3.5 h-3.5" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5" />
          )}
          {Math.abs(change).toFixed(1)}%
        </span>
        <span className="text-gray-400">{changeLabel}</span>
      </div>
    </div>
  );
};

export default StatCard;
