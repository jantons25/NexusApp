// pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import {
  FaShoppingCart,
  FaBoxOpen,
  FaTruckLoading,
  FaRedo,
  FaChartLine,
  FaCalendarAlt,
} from "react-icons/fa";
import { MdAttachMoney, MdInventory } from "react-icons/md";
import DashboardCard from "../components/DashboardCard";
import { useVenta } from "../context/VentaContext";
import { useCompra } from "../context/CompraContext";
import { useSalida } from "../context/SalidaContext";
import { useReposicion } from "../context/ReposicionContext";
import { useCortesia } from "../context/CortesiaContext";

const Dashboard = () => {
  const { ventas } = useVenta();
  const { compras } = useCompra();
  const { salidas } = useSalida();
  const { reposiciones } = useReposicion();
  const { cortesias } = useCortesia();

  const [stats, setStats] = useState({
    ventasHoy: { total: 0, cantidad: 0 },
    comprasHoy: { total: 0, cantidad: 0 },
    salidasHoy: { total: 0, cantidad: 0 },
    reposicionesHoy: { total: 0, cantidad: 0 },
    cortesiasHoy: { total: 0, cantidad: 0 },
  });

  // Función para filtrar registros del día actual
  const filtrarHoy = (registros) => {
    const hoy = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    return registros.filter((registro) => {
      const fechaRegistro = new Date(registro.createdAt)
        .toISOString()
        .split("T")[0];
      return fechaRegistro === hoy;
    });
  };

  // Calcular estadísticas del día
  useEffect(() => {
    // Ventas del día
    const ventasHoy = filtrarHoy(ventas);
    const totalVentas = ventasHoy.reduce(
      (sum, venta) => sum + (venta.importe_venta || 0),
      0,
    );

    // Compras del día
    const comprasHoy = filtrarHoy(compras);
    const totalCompras = comprasHoy.reduce(
      (sum, compra) => sum + (compra.importe_compra || 0),
      0,
    );

    // Salidas del día
    const salidasHoy = filtrarHoy(salidas);
    const totalSalidas = salidasHoy.reduce(
      (sum, salida) => sum + (salida.cantidad || 0),
      0,
    );

    // Reposiciones del día
    const reposicionesHoy = filtrarHoy(reposiciones);
    const totalReposiciones = reposicionesHoy.reduce(
      (sum, reposicion) => sum + (reposicion.cantidad || 0),
      0,
    );

    // Cortesías del día
    const cortesiasHoy = filtrarHoy(cortesias);
    const totalCortesias = cortesiasHoy.reduce(
      (sum, cortesia) => sum + (cortesia.cantidad || 0),
      0,
    );

    setStats({
      ventasHoy: {
        total: totalVentas,
        cantidad: ventasHoy.length,
      },
      comprasHoy: {
        total: totalCompras,
        cantidad: comprasHoy.length,
      },
      salidasHoy: {
        total: totalSalidas,
        cantidad: salidasHoy.length,
      },
      reposicionesHoy: {
        total: totalReposiciones,
        cantidad: reposicionesHoy.length,
      },
      cortesiasHoy: {
        total: totalCortesias,
        cantidad: cortesiasHoy.length,
      },
    });
  }, [ventas, compras, salidas, reposiciones, cortesias]);

  // Calcular total de ingresos netos (ventas - compras)
  const ingresosNetos = stats.ventasHoy.total - stats.comprasHoy.total;

  // Tarjetas del dashboard
  const cards = [
    {
      title: "Ventas",
      value: `S/${stats.ventasHoy.total.toFixed(2)}`,
      subtitle: `${stats.ventasHoy.cantidad} transacciones`,
      icon: FaShoppingCart,
      color: "green",
    },
    {
      title: "Compras",
      value: `S/${stats.comprasHoy.total.toFixed(2)}`,
      subtitle: `${stats.comprasHoy.cantidad} productos`,
      icon: FaBoxOpen,
      color: "orange",
    },
    {
      title: "Ingresos Netos",
      value: `S/${ingresosNetos.toFixed(2)}`,
      subtitle: ingresosNetos >= 0 ? "Ganancia del día" : "Pérdida del día",
      icon: MdAttachMoney,
      color: ingresosNetos >= 0 ? "green" : "red",
    },
    {
      title: "Salidas a Recepción",
      value: `${stats.salidasHoy.total} unid.`,
      subtitle: `${stats.salidasHoy.cantidad} registros`,
      icon: FaTruckLoading,
      color: "blue",
    },
    {
      title: "Reposiciones",
      value: `${stats.reposicionesHoy.total} unid.`,
      subtitle: `${stats.reposicionesHoy.cantidad} habitaciones`,
      icon: FaRedo,
      color: "purple",
    },
    {
      title: "Cortesías",
      value: `${stats.cortesiasHoy.total} unid.`,
      subtitle: `${stats.cortesiasHoy.cantidad} registros`,
      icon: MdInventory,
      color: "yellow",
    },
  ];

  // Calcular resumen general
  const totalMovimientos =
    stats.ventasHoy.cantidad +
    stats.comprasHoy.cantidad +
    stats.salidasHoy.cantidad +
    stats.reposicionesHoy.cantidad +
    stats.cortesiasHoy.cantidad;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Hotel</h1>
        <div className="flex items-center gap-2 mt-2">
          <FaCalendarAlt className="text-gray-400" />
          <p className="text-sm text-gray-500">
            {new Date().toLocaleDateString("es-ES", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Resumen rápido */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Movimientos Hoy</p>
              <p className="text-2xl font-bold text-gray-800">
                {totalMovimientos}
              </p>
            </div>
            <FaChartLine className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Ingresos Brutos</p>
              <p className="text-2xl font-bold text-green-600">
                S/{stats.ventasHoy.total.toFixed(2)}
              </p>
            </div>
            <MdAttachMoney className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Productos Movidos</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.salidasHoy.total +
                  stats.reposicionesHoy.total +
                  stats.cortesiasHoy.total}
              </p>
            </div>
            <FaTruckLoading className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Grid de tarjetas principales */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Estadísticas del Día
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, index) => (
            <DashboardCard
              key={index}
              title={card.title}
              value={card.value}
              subtitle={card.subtitle}
              icon={card.icon}
              color={card.color}
            />
          ))}
        </div>
      </div>

      {/* Sección de actividad reciente */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Actividad Reciente
        </h2>
        <div className="space-y-4">
          {/* Últimas ventas */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded">
                <FaShoppingCart className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-700">Última venta</p>
                <p className="text-sm text-gray-500">
                  {ventas.length > 0
                    ? `S/${ventas[ventas.length - 1]?.importe_venta?.toFixed(2) || "0.00"}`
                    : "Sin ventas hoy"}
                </p>
              </div>
            </div>
            <span className="text-sm text-gray-400">
              {ventas.length > 0
                ? new Date(
                    ventas[ventas.length - 1]?.createdAt,
                  ).toLocaleTimeString("es-ES", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "--:--"}
            </span>
          </div>

          {/* Última compra */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded">
                <FaBoxOpen className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="font-medium text-gray-700">Última compra</p>
                <p className="text-sm text-gray-500">
                  {compras.length > 0
                    ? `S/${compras[compras.length - 1]?.importe_compra?.toFixed(2) || "0.00"}`
                    : "Sin compras hoy"}
                </p>
              </div>
            </div>
            <span className="text-sm text-gray-400">
              {compras.length > 0
                ? new Date(
                    compras[compras.length - 1]?.createdAt,
                  ).toLocaleTimeString("es-ES", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "--:--"}
            </span>
          </div>

          {/* Última salida */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded">
                <FaTruckLoading className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-700">Última salida</p>
                <p className="text-sm text-gray-500">
                  {salidas.length > 0
                    ? `${salidas[salidas.length - 1]?.cantidad || 0} unidades`
                    : "Sin salidas hoy"}
                </p>
              </div>
            </div>
            <span className="text-sm text-gray-400">
              {salidas.length > 0
                ? new Date(
                    salidas[salidas.length - 1]?.createdAt,
                  ).toLocaleTimeString("es-ES", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "--:--"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
