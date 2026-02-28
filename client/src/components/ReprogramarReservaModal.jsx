import { useState, useEffect } from "react";
import { useReserva } from "../context/ReservaContext.jsx";

// ── Helpers de fecha ──────────────────────────────────────────────────────────

// Convierte ISO UTC → { fecha: "YYYY-MM-DD", hora: "HH:MM" } en zona Lima.
// Usa aritmética UTC directa (UTC-5) en lugar de toLocaleDateString para
// evitar variaciones de formato entre navegadores/SO.
const isoAFormulario = (isoString) => {
  const limaDate = new Date(
    new Date(isoString).getTime() + -5 * 60 * 60 * 1000
  );
  const yyyy = limaDate.getUTCFullYear();
  const mm = String(limaDate.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(limaDate.getUTCDate()).padStart(2, "0");
  const hh = String(limaDate.getUTCHours()).padStart(2, "0");
  const min = String(limaDate.getUTCMinutes()).padStart(2, "0");
  return { fecha: `${yyyy}-${mm}-${dd}`, hora: `${hh}:${min}` };
};

// Convierte campos del formulario a ISO con offset Lima explícito.
const formularioAIso = (fecha, hora) => `${fecha}T${hora.slice(0, 5)}:00-05:00`;

// Convierte campos del formulario a Date UTC con offset Lima.
const formularioADate = (fecha, hora) =>
  new Date(`${fecha}T${hora.slice(0, 5)}:00-05:00`);

// Hoy en Lima para el atributo min del input date.
const hoyEnLima = () => {
  const { fecha } = isoAFormulario(new Date().toISOString());
  return fecha;
};

const formatearFechaHora = (isoString) =>
  new Date(isoString).toLocaleString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/Lima",
  });

// ── Cálculo de precio (misma lógica que WizardComponent.calcularPrecioTotal) ─
// precio_por_hora × horas del rango. Los servicios adicionales ya están
// fijos en observaciones_generales y no cambian al reprogramar.
const calcularNuevoImporte = (precioPorHora, fecha, horaInicio, horaFin) => {
  if (!precioPorHora || !fecha || !horaInicio || !horaFin) return null;
  const ini = formularioADate(fecha, horaInicio);
  const fin = formularioADate(fecha, horaFin);
  if (isNaN(ini) || isNaN(fin) || fin <= ini) return null;
  const horas = (fin - ini) / (1000 * 60 * 60);
  return parseFloat((precioPorHora * horas).toFixed(2));
};

// ── Componente ────────────────────────────────────────────────────────────────

function ReprogramarReservaModal({ reserva, closeModal, refreshPagina }) {
  const { reprogramarReserva, reservas } = useReserva();

  const [fecha, setFecha] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [conflicto, setConflicto] = useState(null);
  const [cargando, setCargando] = useState(false);

  // Precio por hora del espacio (para el preview)
  const precioPorHora = reserva?.reserva?.espacio?.precio_por_hora ?? 0;

  // Importe actual de la reserva
  const importeActual =
    reserva?.detalle?.importe_total ??
    reserva?.reserva?.detalle?.importe_total ??
    0;

  // Precarga las fechas actuales al abrir el modal
  useEffect(() => {
    if (!reserva) return;
    const { fecha: f, hora: hI } = isoAFormulario(reserva.reserva.inicio);
    const { hora: hF } = isoAFormulario(reserva.reserva.fin);
    setFecha(f);
    setHoraInicio(hI);
    setHoraFin(hF);
    setConflicto(null);
  }, [reserva]);

  // Nuevo importe calculado en tiempo real a partir del formulario
  const nuevoImporte = calcularNuevoImporte(
    precioPorHora,
    fecha,
    horaInicio,
    horaFin
  );

  // ¿El precio cambió respecto al actual?
  const precioModificado =
    nuevoImporte !== null && nuevoImporte !== importeActual;

  // ── Detección de conflictos (función pura → retorna, no hace setState) ──
  const calcularConflicto = (nuevaFecha, nuevaHoraInicio, nuevaHoraFin) => {
    if (!nuevaFecha || !nuevaHoraInicio || !nuevaHoraFin) return null;
    const inicioNueva = formularioADate(nuevaFecha, nuevaHoraInicio);
    const finNueva = formularioADate(nuevaFecha, nuevaHoraFin);
    if (isNaN(inicioNueva) || isNaN(finNueva) || finNueva <= inicioNueva)
      return null;

    const reservasDelEspacio = reservas.data.filter((r) => {
      if (r.reserva._id === reserva.reserva._id) return false;
      if (!["pendiente", "confirmada"].includes(r.reserva.estado)) return false;
      return r.reserva.espacio._id === reserva.reserva.espacio._id;
    });

    return (
      reservasDelEspacio.find((r) => {
        const ini = new Date(r.reserva.inicio);
        const fin = new Date(r.reserva.fin);
        return (
          (inicioNueva >= ini && inicioNueva < fin) ||
          (finNueva > ini && finNueva <= fin) ||
          (inicioNueva <= ini && finNueva >= fin)
        );
      }) || null
    );
  };

  const handleFechaChange = (v) => {
    setFecha(v);
    setConflicto(calcularConflicto(v, horaInicio, horaFin));
  };
  const handleHoraInicioChange = (v) => {
    setHoraInicio(v);
    setConflicto(calcularConflicto(fecha, v, horaFin));
  };
  const handleHoraFinChange = (v) => {
    setHoraFin(v);
    setConflicto(calcularConflicto(fecha, horaInicio, v));
  };

  const hayErrorHoras =
    horaInicio &&
    horaFin &&
    formularioADate("2000-01-01", horaFin) <=
      formularioADate("2000-01-01", horaInicio);

  const puedeGuardar =
    Boolean(fecha) &&
    Boolean(horaInicio) &&
    Boolean(horaFin) &&
    !hayErrorHoras &&
    !conflicto &&
    !cargando;

  const handleSubmit = async () => {
    if (!puedeGuardar) return;
    setCargando(true);
    try {
      const exito = await reprogramarReserva(
        reserva.reserva._id,
        formularioAIso(fecha, horaInicio),
        formularioAIso(fecha, horaFin)
      );
      if (exito) {
        await refreshPagina();
        closeModal();
      }
    } finally {
      setCargando(false);
    }
  };

  if (!reserva) return null;

  return (
    <div className="p-6 space-y-5">
      {/* Info actual de la reserva */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-600 space-y-1">
        <p className="font-medium text-gray-700 mb-2">
          {reserva.reserva.espacio.nombre} — {reserva.reserva.cliente.nombre}
        </p>
        <p>
          <span className="font-medium text-gray-700">Inicio actual:</span>{" "}
          {formatearFechaHora(reserva.reserva.inicio)}
        </p>
        <p>
          <span className="font-medium text-gray-700">Fin actual:</span>{" "}
          {formatearFechaHora(reserva.reserva.fin)}
        </p>
        <p>
          <span className="font-medium text-gray-700">Precio actual:</span> S/{" "}
          {importeActual.toFixed(2)}
          {precioPorHora > 0 && (
            <span className="text-gray-400 ml-1">(S/ {precioPorHora}/hr)</span>
          )}
        </p>
      </div>

      {/* Nueva fecha */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nueva fecha
        </label>
        <input
          type="date"
          value={fecha}
          min={hoyEnLima()}
          onChange={(e) => handleFechaChange(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Horas */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hora inicio
          </label>
          <input
            type="time"
            value={horaInicio}
            onChange={(e) => handleHoraInicioChange(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hora fin
          </label>
          <input
            type="time"
            value={horaFin}
            onChange={(e) => handleHoraFinChange(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Preview del nuevo precio — se muestra apenas hay horas válidas */}
      {nuevoImporte !== null && !hayErrorHoras && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm space-y-1 ${
            precioModificado
              ? "bg-blue-50 border-blue-200 text-blue-800"
              : "bg-gray-50 border-gray-200 text-gray-600"
          }`}
        >
          <p className="font-semibold">
            {precioModificado
              ? "💰 Nuevo precio calculado"
              : "💰 Precio sin cambios"}
          </p>
          {precioModificado && (
            <p>
              <span className="font-medium">Antes:</span>{" "}
              <span className="line-through text-gray-400">
                S/ {importeActual.toFixed(2)}
              </span>
            </p>
          )}
          <p>
            <span className="font-medium">
              {precioModificado ? "Nuevo total:" : "Total:"}
            </span>{" "}
            <span className="font-bold text-base">
              S/ {nuevoImporte.toFixed(2)}
            </span>
          </p>
          {precioPorHora > 0 && (
            <p className="text-xs text-gray-500">
              {(
                (formularioADate(fecha, horaFin) -
                  formularioADate(fecha, horaInicio)) /
                (1000 * 60 * 60)
              ).toFixed(1)}{" "}
              hr × S/ {precioPorHora}/hr
            </p>
          )}
        </div>
      )}

      {/* Aviso: fin <= inicio */}
      {hayErrorHoras && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-300 rounded-lg px-4 py-3 text-sm text-amber-800">
          <span className="mt-0.5">⚠️</span>
          <p>La hora de fin debe ser mayor que la hora de inicio.</p>
        </div>
      )}

      {/* Aviso: conflicto */}
      {conflicto && (
        <div className="bg-red-50 border border-red-300 rounded-lg px-4 py-3 text-sm text-red-800 space-y-1">
          <p className="font-semibold">⚠️ Conflicto de horario detectado</p>
          <p>
            <span className="font-medium">Cliente:</span>{" "}
            {conflicto.reserva.cliente.nombre}
          </p>
          <p>
            <span className="font-medium">Inicio:</span>{" "}
            {formatearFechaHora(conflicto.reserva.inicio)}
          </p>
          <p>
            <span className="font-medium">Fin:</span>{" "}
            {formatearFechaHora(conflicto.reserva.fin)}
          </p>
          <p>
            <span className="font-medium">Estado:</span>{" "}
            {conflicto.reserva.estado.charAt(0).toUpperCase() +
              conflicto.reserva.estado.slice(1)}
          </p>
          <p className="mt-1 text-red-700">
            Selecciona otro horario o fecha para continuar.
          </p>
        </div>
      )}

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          onClick={closeModal}
          disabled={cargando}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={!puedeGuardar}
          className="px-4 py-2 text-sm font-medium text-black bg-[#FCD535] rounded-lg hover:bg-[#FCD585] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {cargando ? (
            <>
              <svg
                className="animate-spin h-4 w-4 text-black"
                viewBox="0 0 24 24"
                fill="none"
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
              Guardando…
            </>
          ) : (
            "Guardar nueva fecha"
          )}
        </button>
      </div>
    </div>
  );
}

export default ReprogramarReservaModal;
