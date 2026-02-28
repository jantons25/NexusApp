import { useState } from "react";
import { useReserva } from "../context/ReservaContext.jsx";

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatMoneda = (valor) => `S/ ${parseFloat(valor || 0).toFixed(2)}`;

const formatFecha = (fecha) =>
  new Date(fecha).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/Lima",
  });

const METODOS_PAGO = [
  "efectivo",
  "transferencia",
  "tarjeta",
  "yape",
  "plin",
  "otro",
];

const METODO_ICONS = {
  efectivo: "💵",
  transferencia: "🏦",
  tarjeta: "💳",
  yape: "📱",
  plin: "📲",
  otro: "🔖",
};

// ─── Subcomponente: barra de progreso de pago ────────────────────────────────

function BarraPago({ totalPagado, importeTotal }) {
  const porcentaje =
    importeTotal > 0 ? Math.min((totalPagado / importeTotal) * 100, 100) : 0;

  const colorBarra =
    porcentaje >= 100
      ? "bg-emerald-500"
      : porcentaje > 0
        ? "bg-amber-400"
        : "bg-gray-200";

  return (
    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
      <div
        className={`h-2 rounded-full transition-all duration-500 ${colorBarra}`}
        style={{ width: `${porcentaje}%` }}
      />
    </div>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────

function ModalAgregarPago({ isOpen, onClose, reserva }) {
  const { agregarPago } = useReserva();

  const [form, setForm] = useState({
    monto_pago: "",
    metodo_pago: "efectivo",
    observacion_pago: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !reserva) return null;

  // ── Calcular datos financieros desde la reserva recibida ──────────────────
  const pagos = reserva.detalle?.pagos ?? reserva.reserva?.detalle?.pagos ?? [];

  const importeTotal =
    reserva.detalle?.importe_total ??
    reserva.reserva?.detalle?.importe_total ??
    0;

  const totalPagado = pagos.reduce((acc, p) => acc + (p.monto_pago || 0), 0);
  const saldoPendiente = Math.max(importeTotal - totalPagado, 0);
  const porcentajePagado =
    importeTotal > 0 ? Math.min((totalPagado / importeTotal) * 100, 100) : 0;

  const estadoPago =
    totalPagado >= importeTotal && importeTotal > 0
      ? "completo"
      : totalPagado > 0
        ? "parcial"
        : "pendiente";

  const estaPagadoCompleto = estadoPago === "completo";

  // ── Datos de la reserva para el encabezado ────────────────────────────────
  const nombreCliente = reserva.reserva?.cliente?.nombre ?? "—";
  const nombreEspacio = reserva.reserva?.espacio?.nombre ?? "—";
  const reservaId = reserva.reserva?._id;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async () => {
    setError("");

    // Validación rápida en el frontend antes de enviar
    const monto = Number(form.monto_pago);
    if (!form.monto_pago || isNaN(monto)) {
      setError("Ingresa un monto válido.");
      return;
    }
    if (monto <= 0) {
      setError("El monto debe ser mayor a cero.");
      return;
    }
    if (monto > saldoPendiente) {
      setError(
        `El monto no puede superar el saldo pendiente (${formatMoneda(saldoPendiente)}).`,
      );
      return;
    }

    setIsLoading(true);
    try {
      await agregarPago(reservaId, {
        monto_pago: monto,
        metodo_pago: form.metodo_pago,
        observacion_pago: form.observacion_pago.trim(),
      });

      // Limpiar y cerrar al éxito
      setForm({
        monto_pago: "",
        metodo_pago: "efectivo",
        observacion_pago: "",
      });
      onClose();
    } catch {
      setError("No se pudo registrar el pago. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCerrar = () => {
    if (isLoading) return;
    setForm({ monto_pago: "", metodo_pago: "efectivo", observacion_pago: "" });
    setError("");
    onClose();
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && handleCerrar()}
    >
      {/* Panel */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden max-h-[90vh]">
        {/* ── Cabecera ── */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-500 px-6 py-5 flex items-start justify-between shrink-0">
          <div>
            <h2 className="text-white text-lg font-semibold leading-tight">
              💳 Agregar Pago
            </h2>
            <p className="text-emerald-100 text-xs mt-1 leading-snug">
              <span className="font-medium">{nombreCliente}</span>
              {" · "}
              {nombreEspacio}
            </p>
          </div>
          <button
            onClick={handleCerrar}
            disabled={isLoading}
            className="text-white/70 hover:text-white text-xl leading-none mt-0.5 transition disabled:opacity-40"
          >
            ✕
          </button>
        </div>

        {/* ── Cuerpo scrollable ── */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* Resumen financiero */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Resumen de pago
              </span>
              {/* Pill de estado */}
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  estadoPago === "completo"
                    ? "bg-emerald-100 text-emerald-700"
                    : estadoPago === "parcial"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-gray-100 text-gray-600"
                }`}
              >
                {estadoPago === "completo"
                  ? "✅ Pagado"
                  : estadoPago === "parcial"
                    ? "⏳ Parcial"
                    : "🔴 Pendiente"}
              </span>
            </div>

            {/* Barra de progreso */}
            <BarraPago totalPagado={totalPagado} importeTotal={importeTotal} />
            <p className="text-right text-xs text-gray-400">
              {porcentajePagado.toFixed(0)}% pagado
            </p>

            {/* Cuadrícula de montos */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="text-center">
                <p className="text-xs text-gray-400 mb-0.5">Importe total</p>
                <p className="text-sm font-bold text-gray-800">
                  {formatMoneda(importeTotal)}
                </p>
              </div>
              <div className="text-center border-x border-gray-200">
                <p className="text-xs text-gray-400 mb-0.5">Pagado</p>
                <p className="text-sm font-bold text-emerald-600">
                  {formatMoneda(totalPagado)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400 mb-0.5">Saldo</p>
                <p
                  className={`text-sm font-bold ${
                    saldoPendiente <= 0 ? "text-gray-400" : "text-rose-500"
                  }`}
                >
                  {formatMoneda(saldoPendiente)}
                </p>
              </div>
            </div>
          </div>

          {/* Historial de pagos */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Historial de pagos ({pagos.length})
            </h3>

            {pagos.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-sm text-gray-400">Sin pagos registrados</p>
              </div>
            ) : (
              <ul className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {pagos.map((pago, index) => (
                  <li
                    key={pago._id ?? index}
                    className="flex items-center justify-between bg-white border border-gray-100 rounded-lg px-3 py-2.5 shadow-sm"
                  >
                    <div className="flex items-center gap-2.5">
                      {/* Ícono del método */}
                      <span className="text-lg">
                        {METODO_ICONS[pago.metodo_pago] ?? "🔖"}
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-gray-700 capitalize">
                          {pago.metodo_pago}
                          {pago.observacion_pago && (
                            <span className="font-normal text-gray-400">
                              {" "}
                              · {pago.observacion_pago}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-400">
                          {pago.fecha_pago ? formatFecha(pago.fecha_pago) : "—"}
                        </p>
                      </div>
                    </div>
                    {/* Monto */}
                    <span className="text-sm font-bold text-emerald-600 whitespace-nowrap">
                      {formatMoneda(pago.monto_pago)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Formulario nuevo pago */}
          {estaPagadoCompleto ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
              <p className="text-emerald-700 text-sm font-medium">
                ✅ Esta reserva ya está completamente pagada.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Nuevo pago
              </h3>

              {/* Monto */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Monto <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                    S/
                  </span>
                  <input
                    type="number"
                    name="monto_pago"
                    value={form.monto_pago}
                    onChange={handleChange}
                    min="0.01"
                    step="0.01"
                    max={saldoPendiente}
                    placeholder={`Máx. ${formatMoneda(saldoPendiente)}`}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Método de pago */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Método de pago
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {METODOS_PAGO.map((metodo) => (
                    <button
                      key={metodo}
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({ ...prev, metodo_pago: metodo }))
                      }
                      className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg border text-xs font-medium transition
                        ${
                          form.metodo_pago === metodo
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                            : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                    >
                      <span className="text-base">{METODO_ICONS[metodo]}</span>
                      <span className="capitalize">{metodo}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Observación */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Observación{" "}
                  <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <input
                  type="text"
                  name="observacion_pago"
                  value={form.observacion_pago}
                  onChange={handleChange}
                  placeholder="Ej: Segundo abono, voucher #123..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-lg px-3 py-2">
                  <span className="mt-0.5">⚠️</span>
                  <span>{error}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 shrink-0 bg-white">
          <button
            onClick={handleCerrar}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition disabled:opacity-40"
          >
            {estaPagadoCompleto ? "Cerrar" : "Cancelar"}
          </button>

          {!estaPagadoCompleto && (
            <button
              onClick={handleSubmit}
              disabled={isLoading || !form.monto_pago}
              className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-3.5 w-3.5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Registrando...
                </>
              ) : (
                "Registrar pago"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ModalAgregarPago;
