import { useState, useRef } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from "chart.js";
import { ChevronDown } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

/**
 * LineActivityCard — Tarjeta con gráfico de línea suave para el dashboard.
 *
 * Props:
 *  - title     {string}    Título de la tarjeta
 *  - year      {string}    Año seleccionado por defecto
 *  - data      {number[]}  12 valores mensuales de ingresos
 *  - color     {string}    Color de la línea y del gradiente
 */
const LineActivityCard = ({
  title = "Overall User Activity",
  year = "2021",
  data: rawData = [180000, 220000, 270000, 260000, 200000, 195000, 230000, 210000, 290000, 340000, 390000, 430000],
  color = "#C084FC",
}) => {
  const [selectedYear, setSelectedYear] = useState(year);
  const chartRef = useRef(null);

  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

  /* Gradiente bajo la línea — se genera en el canvas cuando Chart.js monta */
  const getGradient = (ctx, chartArea) => {
    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
    gradient.addColorStop(0, `${color}40`);   // 25% opacidad arriba
    gradient.addColorStop(1, `${color}00`);   // transparente abajo
    return gradient;
  };

  const data = {
    labels: months,
    datasets: [
      {
        label: "Ingresos",
        data: rawData,
        borderColor: color,
        borderWidth: 2.5,
        tension: 0.45,           // línea curva suave
        pointRadius: 0,          // sin puntos visibles
        pointHoverRadius: 5,
        pointHoverBackgroundColor: color,
        pointHoverBorderColor: "#fff",
        pointHoverBorderWidth: 2,
        fill: true,
        backgroundColor: (ctx) => {
          const chart = ctx.chart;
          const { chartArea } = chart;
          if (!chartArea) return `${color}20`;
          return getGradient(chart.ctx, chartArea);
        },
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1F2937",
        titleColor: "#F9FAFB",
        bodyColor: "#D1D5DB",
        padding: 10,
        callbacks: {
          label: (ctx) => ` Ingresos: S/${(ctx.raw / 1000).toFixed(0)}k`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          color: "#9CA3AF",
          font: { size: 10, family: "inherit" },
        },
      },
      y: {
        grid: { color: "#F3F4F6" },
        border: { display: false },
        ticks: {
          color: "#9CA3AF",
          font: { size: 10, family: "inherit" },
          callback: (value) => `${value / 1000}k`,
          maxTicksLimit: 4,
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4 hover:shadow-md transition-shadow duration-300 h-full">

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-700">{title}</p>
        <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
          {selectedYear}
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Gráfico */}
      <div className="relative flex-1 min-h-[180px]">
        <Line ref={chartRef} data={data} options={options} />
      </div>

    </div>
  );
};

export default LineActivityCard;
