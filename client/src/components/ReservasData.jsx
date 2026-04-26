import StatCard from "./StatCard.jsx";
import DonutCard from "./DonutCard.jsx";
import SalesDynamicsCard from "./SalesDynamicsCard.jsx";
import FinanceKpiCard from "./FinanceKpiCard.jsx";
import LineActivityCard from "./LineActivityCard.jsx";
import TopClientesCard from "./TopClientesCard.jsx";
import { Wallet, WalletCards } from "lucide-react";

function ReservasData() {
  return (
    <div className="recepcion-data">

      {/* ── FILA 1 ────────────────────────────────────────────────── */}
      <div className="flex gap-4 w-full">

        {/* Cajón 1 — 4 KPI Stats */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex-1">
          <div className="grid grid-cols-2 gap-3 h-full">
            <StatCard
              title="Reservas del mes"
              value={23}
              change={+8.2}
              changeLabel="desde el mes pasado"
            />
            <StatCard
              title="Reservas confirmadas"
              value={19}
              change={+3.4}
              changeLabel="desde el mes pasado"
            />
            <StatCard
              title="Ingresos del mes"
              value={3840.00}
              change={-0.2}
              changeLabel="desde el mes pasado"
            />
            <StatCard
              title="Ingreso promedio por reserva"
              value={167.00}
              change={-1.2}
              changeLabel="desde el mes pasado"
            />
          </div>
        </div>

        {/* Cajón 2 — Users & Subscriptions (donuts) */}
        <div className="flex-1 flex gap-3">
          <DonutCard
            title="Tipos de clientes"
            value="20"
            subtitle="desde el mes pasado"
            segments={[
              { label: "Nuevos", value: 9, color: "#FCD535" },
              { label: "Recurrentes", value: 8, color: "#F0A500" },
              { label: "Inactivos", value: 3, color: "#E8E8E8" },
            ]}
          />
          <DonutCard
            title="Estado de pago"
            value="23"
            subtitle="since last month"
            segments={[
              { label: "Pago completo", value: 15, color: "#4A90D9" },
              { label: "Con adelanto (50%)", value: 6, color: "#B8D4F0" },
              { label: "Pendiente", value: 2, color: "#E8E8E8" },
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
            targetData={[14, 16, 18, 15, 17, 12, 9, 13, 16, 20, 22, 22]}
            actualData={[8, 10, 12, 9, 11, 7, 5, 8, 10, 13, 15, 16]}
          />
        </div>

        {/* Cajón 4 — Paid Invoices & Funds received */}
        <div className="flex-[2] flex gap-3 min-h-[220px]">
          <FinanceKpiCard
            label="Ingresos cobrados"
            amount="S/28,450.00"
            subtitle="Current Financial Year"
            percentage={15}
            color="#C084FC"
            icon={Wallet}
          />
          <FinanceKpiCard
            label="Ingresos totales facturados"
            amount="S/31,200.00"
            subtitle="Current Financial Year"
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

export default ReservasData;
