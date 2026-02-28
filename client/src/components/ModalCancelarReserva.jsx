import { useState } from "react";

/**
 * ModalCancelarReserva
 *
 * Props:
 *  - isOpen        {boolean}   Controla visibilidad
 *  - onClose       {function}  Cierra el modal sin hacer nada
 *  - onConfirm     {function}  Recibe (motivo: string) → llama al servicio
 *  - reserva       {object}    Item completo { reserva, detalle }
 *  - isLoading     {boolean}   Mientras se procesa la petición
 */
function ModalCancelarReserva({
  isOpen,
  onClose,
  onConfirm,
  reserva,
  isLoading,
}) {
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState("");

  if (!isOpen || !reserva) return null;

  // ── Datos para el resumen previo ────────────────────────────────────────────
  const fechaInicio = new Date(reserva.reserva.inicio);
  const hoy = new Date();

  // Días calendario completos de anticipación (misma lógica que el backend)
  const hoyNorm = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const inicioNorm = new Date(
    fechaInicio.getFullYear(),
    fechaInicio.getMonth(),
    fechaInicio.getDate(),
  );
  const diasAnticipacion = Math.floor(
    (inicioNorm - hoyNorm) / (1000 * 60 * 60 * 24),
  );

  const importeTotal =
    reserva.detalle?.importe_total ??
    reserva.reserva.detalle?.importe_total ??
    0;
  const pagos = reserva.detalle?.pagos ?? reserva.reserva.detalle?.pagos ?? [];
  const montoTotalPagado = pagos.reduce(
    (sum, p) => sum + (p.monto_pago || 0),
    0,
  );
  const pagoEsCompleto = importeTotal > 0 && montoTotalPagado >= importeTotal;

  // Calcular política (espejo del backend para mostrar al usuario antes de confirmar)
  let porcentajeDevolucion = 0;
  let labelPolitica = "";
  let colorPolitica = "";

  if (montoTotalPagado === 0) {
    labelPolitica = "Sin pagos registrados. No hay monto a devolver.";
    colorPolitica = "text-gray-500";
  } else if (diasAnticipacion <= 0) {
    porcentajeDevolucion = 0;
    labelPolitica =
      "Cancelación el mismo día o posterior al inicio. Sin devolución.";
    colorPolitica = "text-red-600";
  } else if (diasAnticipacion >= 2) {
    porcentajeDevolucion = 100;
    labelPolitica = `${diasAnticipacion} días de anticipación. Devolución total (100%).`;
    colorPolitica = "text-emerald-600";
  } else {
    // 1 día antes
    if (pagoEsCompleto) {
      porcentajeDevolucion = 25;
      labelPolitica =
        "1 día de anticipación con pago completo. Se devuelve el 25%.";
      colorPolitica = "text-amber-600";
    } else {
      porcentajeDevolucion = 50;
      labelPolitica =
        "1 día de anticipación con pago parcial. Se devuelve el 50%.";
      colorPolitica = "text-amber-600";
    }
  }

  const montoDevolucion = parseFloat(
    ((montoTotalPagado * porcentajeDevolucion) / 100).toFixed(2),
  );
  const montoRetenido = parseFloat(
    (montoTotalPagado - montoDevolucion).toFixed(2),
  );

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleConfirm = () => {
    if (!motivo.trim()) {
      setError("El motivo de cancelación es obligatorio.");
      return;
    }
    setError("");
    onConfirm(motivo.trim());
  };

  const handleClose = () => {
    setMotivo("");
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-red-50 border-b border-red-100 px-6 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-5 h-5 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Cancelar Reserva
            </h2>
            <p className="text-xs text-gray-500">
              {reserva.reserva.espacio?.nombre} —{" "}
              {new Date(reserva.reserva.inicio).toLocaleDateString("es-PE", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                timeZone: "America/Lima",
              })}{" "}
              {new Date(reserva.reserva.inicio).toLocaleTimeString("es-PE", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
                timeZone: "America/Lima",
              })}
            </p>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Resumen de política de devolución */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-2 text-sm">
            <p className="font-semibold text-gray-700 text-xs uppercase tracking-wide">
              Resumen de devolución
            </p>

            <div className="flex justify-between text-gray-600">
              <span>Total pagado</span>
              <span className="font-medium">
                S/ {montoTotalPagado.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between text-gray-600">
              <span>Anticipación</span>
              <span className="font-medium">
                {diasAnticipacion <= 0
                  ? "Mismo día o ya inició"
                  : `${diasAnticipacion} día${diasAnticipacion !== 1 ? "s" : ""}`}
              </span>
            </div>

            <div
              className={`flex justify-between font-semibold ${colorPolitica}`}
            >
              <span>Monto a devolver ({porcentajeDevolucion}%)</span>
              <span>S/ {montoDevolucion.toFixed(2)}</span>
            </div>

            {montoRetenido > 0 && (
              <div className="flex justify-between text-red-500 text-xs">
                <span>Monto retenido</span>
                <span>S/ {montoRetenido.toFixed(2)}</span>
              </div>
            )}

            <p className={`text-xs mt-1 ${colorPolitica}`}>{labelPolitica}</p>
          </div>

          {/* Campo motivo obligatorio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Motivo de cancelación <span className="text-red-500">*</span>
            </label>
            <textarea
              value={motivo}
              onChange={(e) => {
                setMotivo(e.target.value);
                if (e.target.value.trim()) setError("");
              }}
              placeholder="Ej: El cliente solicitó cancelar por cambio de planes..."
              rows={3}
              className={`w-full px-3 py-2 text-sm border rounded-lg resize-none focus:outline-none focus:ring-2 transition ${
                error
                  ? "border-red-400 focus:ring-red-300"
                  : "border-gray-300 focus:ring-red-400"
              }`}
            />
            {error && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex gap-3 justify-end">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition disabled:opacity-50"
          >
            Volver
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition disabled:opacity-60 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin w-4 h-4"
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
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Cancelando...
              </>
            ) : (
              "Confirmar cancelación"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalCancelarReserva;
