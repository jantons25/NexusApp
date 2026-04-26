import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";

ChartJS.register(ArcElement, Tooltip);

/**
 * DonutCard — Tarjeta KPI con gráfico de dona para el dashboard.
 *
 * Props:
 *  - title       {string}   Título de la tarjeta (ej. "Users")
 *  - value       {string|number}  Valor principal (ej. "4.890")
 *  - subtitle    {string}   Texto bajo el valor (ej. "since last month")
 *  - segments    {Array<{ label: string, value: number, color: string }>}
 *                           Segmentos del donut
 */
const DonutCard = ({
  title = "Users",
  value = "4.890",
  subtitle = "since last month",
  segments = [
    { label: "New", value: 62, color: "#FCD535" },
    { label: "Returning", value: 26, color: "#F0A500" },
    { label: "Inactive", value: 12, color: "#E8E8E8" },
  ],
}) => {
  const chartData = {
    datasets: [
      {
        data: segments.map((s) => s.value),
        backgroundColor: segments.map((s) => s.color),
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const chartOptions = {
    cutout: "72%",
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    animation: { animateRotate: true, duration: 700 },
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3 hover:shadow-md transition-shadow duration-300">

      {/* Título */}
      <p className="text-sm font-medium text-gray-500">{title}</p>

      {/* Cuerpo: texto izquierda + donut derecha */}
      <div className="flex items-center justify-between gap-4">

        {/* Columna izquierda */}
        <div className="flex flex-col gap-3">
          {/* Valor principal */}
          <p className="text-4xl font-bold text-gray-800 leading-none">{value}</p>

          {/* Subtítulo */}
          <p className="text-xs text-gray-400">{subtitle}</p>

          {/* Leyenda */}
          <ul className="flex flex-col gap-1.5 mt-1">
            {segments.map((seg) => (
              <li key={seg.label} className="flex items-center gap-2 text-xs text-gray-500">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: seg.color }}
                />
                <span className="font-semibold text-gray-700">{seg.value}%</span>
                {seg.label}
              </li>
            ))}
          </ul>
        </div>

        {/* Donut */}
        <div className="w-28 h-28 flex-shrink-0">
          <Doughnut data={chartData} options={chartOptions} />
        </div>

      </div>
    </div>
  );
};

export default DonutCard;
