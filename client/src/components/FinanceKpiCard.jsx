import { Wallet, WalletCards } from "lucide-react";

/**
 * CircularProgress — Anillo SVG con porcentaje centrado.
 */
const CircularProgress = ({ percentage, color }) => {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;

  return (
    <div className="relative w-14 h-14 flex items-center justify-center flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
        {/* Pista de fondo */}
        <circle cx="28" cy="28" r={radius} fill="none" stroke="#F3F4F6" strokeWidth="4" />
        {/* Arco de progreso */}
        <circle
          cx="28" cy="28" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      {/* Texto centrado */}
      <span
        className="absolute text-[10px] font-bold leading-none"
        style={{ color }}
      >
        +{percentage}%
      </span>
    </div>
  );
};

/**
 * FinanceKpiCard — Tarjeta de KPI financiero para el dashboard.
 *
 * Props:
 *  - label       {string}           Etiqueta de la métrica (ej. "Paid Invoices")
 *  - amount      {string}           Monto formateado (ej. "$30,256.23")
 *  - subtitle    {string}           Subtítulo (ej. "Current Financial Year")
 *  - percentage  {number}           Porcentaje del anillo (ej. 15)
 *  - color       {string}           Color del anillo y del texto del % (ej. "#C084FC")
 *  - icon        {React.ElementType} Ícono de lucide-react
 */
const FinanceKpiCard = ({
  label = "Paid Invoices",
  amount = "$30,256.23",
  subtitle = "Current Financial Year",
  percentage = 15,
  color = "#C084FC",
  icon: Icon = Wallet,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4 hover:shadow-md transition-shadow duration-300 flex-1">

      {/* Fila superior: ícono + anillo */}
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-400">
          <Icon className="w-5 h-5" />
        </div>
        <CircularProgress percentage={percentage} color={color} />
      </div>

      {/* Contenido */}
      <div className="flex flex-col gap-1">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-gray-800 leading-tight">{amount}</p>
        <p className="text-xs text-gray-400">{subtitle}</p>
      </div>

    </div>
  );
};

export default FinanceKpiCard;
