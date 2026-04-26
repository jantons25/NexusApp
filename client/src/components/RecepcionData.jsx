import "../css/recepcionData.css";
import StatCard from "./StatCard.jsx";
import DonutCard from "./DonutCard.jsx";
import SalesDynamicsCard from "./SalesDynamicsCard.jsx";
import FinanceKpiCard from "./FinanceKpiCard.jsx";
import LineActivityCard from "./LineActivityCard.jsx";
import TopClientesCard from "./TopClientesCard.jsx";
import { Wallet, WalletCards } from "lucide-react";

function RecepcionData({
  ventas,
  compras,
  productos,
  reposiciones,
  cortesias,
}) {
  console.log(ventas)
  return (
    <div className="recepcion-data">

      {/* ── FILA 1 ────────────────────────────────────────────────── */}
      <div className="flex gap-4 w-full">

        {/* Cajón 1 — 4 KPI Stats */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex-1">
          <div className="grid grid-cols-2 gap-3 h-full">
            <StatCard
              title="Ventas del mes"
              value={87}
              change={+5.1}
              changeLabel="desde el mes pasado"
            />
            <StatCard
              title="Productos en stock"
              value={24}
              change={-2.6}
              changeLabel="desde el mes pasado"
            />
            <StatCard
              title="Unidades vendidas"
              value={143}
              change={+3.8}
              changeLabel="desde el mes pasado"
            />
            <StatCard
              title="Ingresos"
              value={612.00}
              change={+1.4}
              changeLabel="desde el mes pasado"
            />
          </div>
        </div>

        {/* Cajón 2 — Users & Subscriptions (donuts) */}
        <div className="flex-1 flex gap-3">
          <DonutCard
            title="Rotación de productos"
            value="100%"
            subtitle="since last month"
            segments={[
              { label: "Alta rotación", value: 58, color: "#FCD535" },
              { label: "Media rotación", value: 29, color: "#F0A500" },
              { label: "Baja rotación", value: 13, color: "#E8E8E8" },
            ]}
          />
          <DonutCard
            title="Tipo de movimiento"
            value="100%"
            subtitle="since last month"
            segments={[
              { label: "Venta regular", value: 78, color: "#4A90D9" },
              { label: "Cortesia", value: 13, color: "#B8D4F0" },
              { label: "Asignado a oficina", value: 9, color: "#E8E8E8" },
            ]}
          />
        </div>

      </div>
      {/* ── FIN FILA 1 ────────────────────────────────────────────── */}

      {/* ── FILA 2 ────────────────────────────────────────────────── */}
      <div className="flex gap-4 w-full">

        {/* Cajón 3 — Sales Dynamics (bar chart) */}
        <div className="flex-[3] min-h-[220px]">
          <SalesDynamicsCard
            targetData={[95, 88, 110, 92, 105, 78, 65, 89, 102, 118, 131, 143]}
            actualData={[407, 377, 471, 394, 450, 334, 279, 381, 437, 505, 561, 612]}
          />
        </div>

        {/* Cajón 4 — Paid Invoices & Funds received */}
        <div className="flex-[2] flex gap-3 min-h-[220px]">
          <FinanceKpiCard
            label="Valor del inventario actual"
            amount="S/1,840.00"
            subtitle="Valor total del inventario"
            percentage={15}
            color="#C084FC"
            icon={Wallet}
          />
          <FinanceKpiCard
            label="Total de ingresos por venta del año"
            amount="S/5,208.00"
            subtitle="Ingresos totales del año"
            percentage={59}
            color="#22C55E"
            icon={WalletCards}
          />
        </div>

      </div>
      {/* ── FIN FILA 2 ────────────────────────────────────────────── */}

      {/* ── FILA 3 ────────────────────────────────────────────────── */}
      <div className="flex gap-4 w-full">

        {/* Cajón 5 — Ingresos por mes (line chart) */}
        <div className="flex-1 min-h-[200px]">
          <LineActivityCard
            title="Ingresos por mes"
            year="2024"
            color="#C084FC"
          />
        </div>

        {/* Cajón 6 — Top Clientes (tabla) */}
        <div className="flex-1 min-h-[200px]">
          <TopClientesCard title="Top Clientes del Mes" />
        </div>

      </div>
      {/* ── FIN FILA 3 ────────────────────────────────────────────── */}

    </div>
  );
}

export default RecepcionData;
