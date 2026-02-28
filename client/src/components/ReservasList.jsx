import { useState } from "react";
import { useReserva } from "../context/ReservaContext.jsx";
import ModalBigVarios from "./ModalBigVarios.jsx";
import ModalCancelarReserva from "./ModalCancelarReserva.jsx";
import ReservaFormPage from "./WizardComponent.jsx";
import ReprogramarReservaModal from "./ReprogramarReservaModal.jsx";
import ModalAgregarPago from "./ModalAgregarPago.jsx";

function ReservasList({ reservas, espacios, clientes, refreshPagina }) {
  reservas = reservas.data;
  const { cancelReserva } = useReserva();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReserva, setSelectedReserva] = useState(null);

  // ── Modal reprogramar ──────────────────────────────────────────────────────
  const [reservaAReprogramar, setReservaAReprogramar] = useState(null);
  const [isReprogramarOpen, setIsReprogramarOpen] = useState(false);

  // ── Modal cancelar ─────────────────────────────────────────────────────────
  const [reservaACancelar, setReservaACancelar] = useState(null);
  const [isCancelarOpen, setIsCancelarOpen] = useState(false);
  const [isCancelando, setIsCancelando] = useState(false);

  // ── Modal agregar pago ─────────────────────────────────────────────────────
  const [reservaParaPago, setReservaParaPago] = useState(null);
  const [isPagoOpen, setIsPagoOpen] = useState(false);

  const [filtros, setFiltros] = useState({
    fecha: "",
    fechaInicio: "",
    fechaFin: "",
    espacio: "",
    cliente: "",
    estado: "",
  });

  const estadoColors = {
    pendiente: "bg-amber-500",
    confirmada: "bg-emerald-500",
    rechazada: "bg-rose-500",
    cancelada: "bg-slate-500",
    finalizada: "bg-blue-500",
  };

  // Estados que NO pueden cancelarse ni reprogramarse
  const ESTADOS_NO_REPROGRAMABLES = ["cancelada", "finalizada", "rechazada"];
  const ESTADOS_NO_CANCELABLES = ["cancelada", "finalizada"];

  // ── Confirmar cancelación ──────────────────────────────────────────────────
  const confirmarCancelarReserva = async (motivo) => {
    if (!reservaACancelar) return;
    setIsCancelando(true);
    try {
      await cancelReserva(reservaACancelar.reserva._id, motivo);
      refreshPagina();
      setIsCancelarOpen(false);
      setReservaACancelar(null);
    } catch (error) {
      console.error("Error cancelando reserva:", error);
    } finally {
      setIsCancelando(false);
    }
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      fecha: "",
      fechaInicio: "",
      fechaFin: "",
      espacio: "",
      cliente: "",
      estado: "",
    });
  };

  const reservasFiltradas = () => {
    return reservas.filter((reserva) => {
      const fechaReserva = new Date(reserva.reserva.inicio);

      if (filtros.fecha) {
        const fechaSeleccionada = new Date(filtros.fecha);
        fechaSeleccionada.setHours(0, 0, 0, 0);
        fechaReserva.setHours(0, 0, 0, 0);
        if (fechaReserva.getTime() !== fechaSeleccionada.getTime())
          return false;
      }

      if (filtros.fechaInicio && filtros.fechaFin) {
        const fechaInicio = new Date(filtros.fechaInicio);
        const fechaFin = new Date(filtros.fechaFin);
        fechaInicio.setHours(0, 0, 0, 0);
        fechaFin.setHours(23, 59, 59, 999);
        const fechaReservaReset = new Date(reserva.reserva.inicio);
        if (fechaReservaReset < fechaInicio || fechaReservaReset > fechaFin)
          return false;
      }

      if (filtros.espacio && reserva.reserva.espacio._id !== filtros.espacio)
        return false;
      if (filtros.cliente && reserva.reserva.cliente._id !== filtros.cliente)
        return false;
      if (filtros.estado && reserva.reserva.estado !== filtros.estado)
        return false;

      return true;
    });
  };

  const reservasParaMostrar = reservasFiltradas();

  if (!reservas || reservas.length === 0) {
    return <h1 className="text-center text-gray-600">No hay reservas</h1>;
  }

  return (
    <div className="bg-white p-4 w-full descripcion__container">
      <h1 className="text-2xl bold font-medium">Lista de Reservas</h1>
      <p className="p_final">
        Administra y organiza tus reservas de salas y oficinas en un solo lugar.
        Aquí puedes revisar estados, editar detalles y mantener tu agenda al
        día.
      </p>

      {/* PANEL DE FILTROS */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">
            🔍 Filtros de Búsqueda
          </h3>
          <button
            onClick={limpiarFiltros}
            className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded transition"
          >
            Limpiar filtros
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Fecha exacta
            </label>
            <input
              type="date"
              value={filtros.fecha}
              onChange={(e) => {
                handleFiltroChange("fecha", e.target.value);
                if (e.target.value) {
                  handleFiltroChange("fechaInicio", "");
                  handleFiltroChange("fechaFin", "");
                }
              }}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Desde
            </label>
            <input
              type="date"
              value={filtros.fechaInicio}
              onChange={(e) => {
                handleFiltroChange("fechaInicio", e.target.value);
                if (e.target.value) handleFiltroChange("fecha", "");
              }}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Hasta
            </label>
            <input
              type="date"
              value={filtros.fechaFin}
              onChange={(e) => {
                handleFiltroChange("fechaFin", e.target.value);
                if (e.target.value) handleFiltroChange("fecha", "");
              }}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Espacio
            </label>
            <select
              value={filtros.espacio}
              onChange={(e) => handleFiltroChange("espacio", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los espacios</option>
              {espacios?.map((espacio) => (
                <option key={espacio._id} value={espacio._id}>
                  {espacio.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Cliente
            </label>
            <select
              value={filtros.cliente}
              onChange={(e) => handleFiltroChange("cliente", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los clientes</option>
              {clientes?.map((cliente) => (
                <option key={cliente._id} value={cliente._id}>
                  {cliente.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Estado
            </label>
            <select
              value={filtros.estado}
              onChange={(e) => handleFiltroChange("estado", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="confirmada">Confirmada</option>
              <option value="rechazada">Rechazada</option>
              <option value="cancelada">Cancelada</option>
              <option value="finalizada">Finalizada</option>
            </select>
          </div>
        </div>

        <div className="mt-3 text-xs text-gray-600">
          Mostrando{" "}
          <span className="font-semibold text-blue-600">
            {reservasParaMostrar.length}
          </span>{" "}
          de <span className="font-semibold">{reservas.length}</span> reservas
        </div>
      </div>

      {/* TABLA O MENSAJE VACÍO */}
      {reservasParaMostrar.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron reservas
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            No hay reservas que coincidan con los filtros seleccionados.
          </p>
          <button
            onClick={limpiarFiltros}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Limpiar filtros y ver todas las reservas
          </button>
        </div>
      ) : (
        <div className="mt-2 max-h-[60vh] overflow-y-auto border rounded-lg">
          <table className="w-full table-auto text-sm text-left text-gray-700">
            <thead className="bg-gray-100 text-xs uppercase text-gray-500 sticky top-0">
              <tr>
                <th className="px-6 py-2 text-center bg-amber-100">
                  F. Registro
                </th>
                <th className="px-6 py-2 text-center bg-amber-100">
                  F. Inicio
                </th>
                <th className="px-6 py-2 text-center bg-amber-100">F. Fin</th>
                <th className="px-6 py-2 text-center bg-emerald-200">
                  Espacio
                </th>
                <th className="px-6 py-2 text-center bg-emerald-200">
                  Cliente
                </th>
                <th className="px-6 py-2 text-center bg-emerald-200">Estado</th>
                <th className="px-6 py-2 text-center bg-emerald-200">
                  Pago Inicial
                </th>
                <th className="px-6 py-2 text-center bg-blue-100">
                  Total Pagado
                </th>
                <th className="px-6 py-2 text-center bg-emerald-200">
                  Importe Total
                </th>
                <th className="px-6 py-2 text-center bg-gray-100">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {reservasParaMostrar.map((reserva) => {
                const noCancelable = ESTADOS_NO_CANCELABLES.includes(
                  reserva.reserva.estado,
                );
                const noReprogramable = ESTADOS_NO_REPROGRAMABLES.includes(
                  reserva.reserva.estado,
                );

                return (
                  <tr
                    key={reserva.reserva._id}
                    className="border-b hover:bg-gray-50 transition duration-150"
                  >
                    {/* F. Registro */}
                    <td className="px-6 py-4 font-medium text-center">
                      {new Date(reserva.reserva.createdAt).toLocaleDateString(
                        "es-PE",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          timeZone: "America/Lima",
                        },
                      )}{" "}
                      {new Date(reserva.reserva.createdAt).toLocaleTimeString(
                        "es-PE",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                          timeZone: "America/Lima",
                        },
                      )}
                    </td>

                    {/* F. Inicio */}
                    <td className="px-6 py-4 font-medium text-center">
                      {new Date(reserva.reserva.inicio).toLocaleDateString(
                        "es-PE",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          timeZone: "America/Lima",
                        },
                      )}{" "}
                      {new Date(reserva.reserva.inicio).toLocaleTimeString(
                        "es-PE",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                          timeZone: "America/Lima",
                        },
                      )}
                    </td>

                    {/* F. Fin */}
                    <td className="px-6 py-4 font-medium text-center">
                      {new Date(reserva.reserva.fin).toLocaleDateString(
                        "es-PE",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          timeZone: "America/Lima",
                        },
                      )}{" "}
                      {new Date(reserva.reserva.fin).toLocaleTimeString(
                        "es-PE",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                          timeZone: "America/Lima",
                        },
                      )}
                    </td>

                    {/* Espacio */}
                    <td className="px-6 py-4 font-medium text-center">
                      {reserva.reserva.espacio.nombre.charAt(0).toUpperCase() +
                        reserva.reserva.espacio.nombre.slice(1)}
                    </td>

                    {/* Cliente */}
                    <td className="px-6 py-4 font-medium text-center">
                      {reserva.reserva.cliente.nombre.charAt(0).toUpperCase() +
                        reserva.reserva.cliente.nombre.slice(1)}
                    </td>

                    {/* Estado */}
                    <td className="px-6 py-4 font-medium text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${estadoColors[reserva.reserva.estado] || "bg-gray-500"}`}
                        />
                        <span className="font-medium">
                          {reserva.reserva.estado?.charAt(0).toUpperCase() +
                            reserva.reserva.estado?.slice(1)}
                        </span>
                      </div>
                    </td>

                    {/* Pago Inicial */}
                    <td className="px-6 py-4 font-medium text-center">
                      S/{" "}
                      {reserva.detalle?.pagos &&
                      reserva.detalle.pagos.length > 0
                        ? parseFloat(
                            reserva.detalle.pagos[0].monto_pago,
                          ).toFixed(2)
                        : reserva.reserva.detalle?.pagos?.length > 0
                          ? parseFloat(
                              reserva.reserva.detalle.pagos[0].monto_pago,
                            ).toFixed(2)
                          : "0.00"}
                    </td>
                    <td className="px-6 py-4 font-medium text-center">
                      {(() => {
                        // Sumamos todos los pagos del array con reduce()
                        // igual que hace el servicio en el backend
                        const pagos =
                          reserva.detalle?.pagos ??
                          reserva.reserva?.detalle?.pagos ??
                          [];

                        const totalPagado = pagos.reduce(
                          (acc, p) => acc + (p.monto_pago || 0),
                          0,
                        );

                        const importeTotal =
                          reserva.detalle?.importe_total ?? 0;
                        const completo =
                          totalPagado >= importeTotal && importeTotal > 0;

                        return (
                          <span
                            className={`font-semibold ${completo ? "text-emerald-600" : "text-amber-600"}`}
                          >
                            S/ {totalPagado.toFixed(2)}
                          </span>
                        );
                      })()}
                    </td>
                    {/* Importe Total */}
                    <td className="px-6 py-4 font-medium text-center">
                      S/ {parseFloat(reserva.detalle.importe_total).toFixed(2)}
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-center flex-wrap">
                        {/* Editar */}
                        <button
                          onClick={() => {
                            setSelectedReserva(reserva);
                            setIsModalOpen(true);
                          }}
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-xs cursor-pointer transition"
                        >
                          Editar
                        </button>

                        {/* Reprogramar */}
                        <button
                          onClick={() => {
                            setReservaAReprogramar(reserva);
                            setIsReprogramarOpen(true);
                          }}
                          disabled={noReprogramable}
                          title={
                            noReprogramable
                              ? `No se puede reprogramar una reserva ${reserva.reserva.estado}`
                              : "Cambiar fecha y hora"
                          }
                          className="bg-indigo-500 text-white px-3 py-1 rounded hover:bg-indigo-600 text-xs transition disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Reprogramar
                        </button>
                        {/* Agregar Pago — pégalo antes del botón Cancelar */}
                        <button
                          onClick={() => {
                            setReservaParaPago(reserva);
                            setIsPagoOpen(true);
                          }}
                          disabled={noCancelable} // misma lógica: cancelada/finalizada no permiten pagos
                          title={
                            noCancelable
                              ? `No se puede pagar una reserva ${reserva.reserva.estado}`
                              : "Registrar un nuevo pago"
                          }
                          className="bg-emerald-500 text-white px-3 py-1 rounded hover:bg-emerald-600 text-xs transition disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          + Pago
                        </button>
                        {/* Cancelar (renombrado desde Eliminar) */}
                        <button
                          onClick={() => {
                            setReservaACancelar(reserva);
                            setIsCancelarOpen(true);
                          }}
                          disabled={noCancelable}
                          title={
                            noCancelable
                              ? `La reserva ya está ${reserva.reserva.estado}`
                              : "Cancelar esta reserva"
                          }
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-xs transition disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Cancelar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Editar */}
      <ModalBigVarios
        isOpen={isModalOpen}
        closeModal={() => setIsModalOpen(false)}
        cliente={selectedReserva}
        component={
          selectedReserva ? (
            <ReservaFormPage
              modo="editar"
              closeModal={() => setIsModalOpen(false)}
              refreshPagina={refreshPagina}
              reserva={selectedReserva}
              reservaId={selectedReserva.reserva._id}
              reservaInicial={selectedReserva}
            />
          ) : null
        }
      />

      {/* Modal Reprogramar */}
      <ModalBigVarios
        isOpen={isReprogramarOpen}
        closeModal={() => {
          setIsReprogramarOpen(false);
          setReservaAReprogramar(null);
        }}
        vistaActiva="Reprogramar Reserva"
        component={
          reservaAReprogramar ? (
            <ReprogramarReservaModal
              reserva={reservaAReprogramar}
              closeModal={() => {
                setIsReprogramarOpen(false);
                setReservaAReprogramar(null);
              }}
              refreshPagina={refreshPagina}
            />
          ) : null
        }
      />

      {/* Modal Agregar Pago — pégalo junto a los demás modales al final */}
      <ModalAgregarPago
        isOpen={isPagoOpen}
        onClose={() => {
          setIsPagoOpen(false);
          setReservaParaPago(null);
          refreshPagina(); // recarga la lista para reflejar el nuevo pago
        }}
        reserva={reservaParaPago}
      />

      {/* Modal Cancelar (nuevo) */}
      <ModalCancelarReserva
        isOpen={isCancelarOpen}
        onClose={() => {
          setIsCancelarOpen(false);
          setReservaACancelar(null);
        }}
        onConfirm={confirmarCancelarReserva}
        reserva={reservaACancelar}
        isLoading={isCancelando}
      />
    </div>
  );
}

export default ReservasList;
