import { useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from "chart.js";
import { ChevronDown } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

/**
 * SalesDynamicsCard — Tarjeta con gráfico de barras agrupadas para el dashboard.
 *
 * Props:
 *  - title        {string}          Título de la tarjeta
 *  - year         {string}          Año seleccionado por defecto
 *  - targetData   {number[]}        12 valores mensuales (barras claras / objetivo)
 *  - actualData   {number[]}        12 valores mensuales (barras azules / actual)
 */
const SalesDynamicsCard = ({
  title = "Ventas por mes",
  year = "2025",
  targetData = [280000, 200000, 280000, 230000, 260000, 210000, 190000, 300000, 240000, 320000, 370000, 400000],
  actualData = [150000, 120000, 185000, 160000, 175000, 140000, 80000, 200000, 155000, 240000, 295000, 375000],
}) => {
  const [selectedYear, setSelectedYear] = useState(year);

  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

  const data = {
    labels: months,
    datasets: [
      {
        label: "Target",
        data: targetData,
        backgroundColor: "#C5D3F5",
        borderRadius: { topLeft: 5, topRight: 5 },
        borderSkipped: false,
        barPercentage: 0.55,
        categoryPercentage: 0.8,
        order: 2,
      },
      {
        label: "Actual",
        data: actualData,
        backgroundColor: "#4A6CF7",
        borderRadius: { topLeft: 5, topRight: 5 },
        borderSkipped: false,
        barPercentage: 0.55,
        categoryPercentage: 0.8,
        order: 1,
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
          label: (ctx) => ` ${ctx.dataset.label}: ${(ctx.raw / 1000).toFixed(0)}k`,
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
          maxTicksLimit: 5,
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
        <Bar data={data} options={options} />
      </div>

    </div>
  );
};

export default SalesDynamicsCard;
