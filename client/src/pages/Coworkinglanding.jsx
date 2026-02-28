import { useState, useEffect, useRef } from "react";
import axios from "../api/axios.js";

// ─────────────────────────────────────────────────────────────────────────────
// CULQI PAYMENT LINK
// ─────────────────────────────────────────────────────────────────────────────
const CULQI_PAYMENT_LINK = "https://express.culqi.com/pago/0444D7AC09";

// ─────────────────────────────────────────────────────────────────────────────
// API
// ─────────────────────────────────────────────────────────────────────────────
const fetchEspacios = (filtros = {}) => {
  const params = {};
  if (filtros.tipo) params.tipo = filtros.tipo;
  if (filtros.sede) params.sede = filtros.sede;
  return axios.get("/public/espacios", { params });
};

const fetchDisponibilidad = (espacioId, fecha) =>
  axios.get(`/public/disponibilidad/${espacioId}`, { params: { fecha } });

// ─────────────────────────────────────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────────────────────────────────────
const formatHour = (h) => `${String(h).padStart(2, "0")}:00`;

// Fix #7 — Fecha mínima en hora Lima (UTC-5), no en UTC puro
// Sin esto, después de las 7pm Lima el input mostraría mañana como mínimo
const todayLima = () => {
  const now = new Date();
  const limaOffset = -5 * 60; // UTC-5 en minutos
  const limaTime = new Date(
    now.getTime() + (limaOffset - now.getTimezoneOffset()) * 60000
  );
  return limaTime.toISOString().split("T")[0];
};

// Fix #4 — precio siempre como número para evitar crash en .toFixed()
// Si el backend devuelve "39" (string) en lugar de 39 (number), no crashea
const formatPrecio = (valor) => Number(valor || 0).toFixed(2);

// ─────────────────────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────────────────────
const IconUsers = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconFloor = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18M3 15h18M9 3v18" />
  </svg>
);
const IconSearch = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);
const IconX = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);
const IconChevron = ({ dir = "left" }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
  >
    {dir === "left" ? <path d="m15 18-6-6 6-6" /> : <path d="m9 18 6-6-6-6" />}
  </svg>
);
const IconCheck = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconLoader = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    style={{ animation: "spin 1s linear infinite" }}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// HOUR TIMELINE
// ─────────────────────────────────────────────────────────────────────────────
function HourTimeline({
  horasOcupadas = [],
  selectedHours = [],
  onHourClick,
  loadingDisponibilidad,
}) {
  const hours = Array.from({ length: 15 }, (_, i) => i + 7); // 07:00 – 21:00

  if (loadingDisponibilidad) {
    return (
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
          Disponibilidad del día
        </p>
        <div className="flex items-center gap-2 text-sm text-gray-400 py-4">
          <IconLoader /> Consultando disponibilidad...
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
        Disponibilidad del día
      </p>
      <div className="flex gap-0.5 flex-wrap">
        {hours.map((h) => {
          const ocupado = horasOcupadas.includes(h);
          const selected = selectedHours.includes(h);
          return (
            <button
              key={h}
              disabled={ocupado}
              onClick={() => !ocupado && onHourClick && onHourClick(h)}
              style={selected ? { background: "#FCD535", color: "#111" } : {}}
              className={`
                flex-1 min-w-[42px] py-2 rounded text-[10px] font-bold transition-all
                ${
                  ocupado
                    ? "bg-red-100 text-red-400 cursor-not-allowed"
                    : selected
                    ? ""
                    : "bg-gray-100 text-gray-500 hover:bg-yellow-100 hover:text-gray-700 cursor-pointer"
                }
              `}
            >
              {formatHour(h)}
            </button>
          );
        })}
      </div>
      <div className="flex gap-4 mt-2 text-[10px] text-gray-400">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-red-100 inline-block" /> Ocupado
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-yellow-300 inline-block" />{" "}
          Seleccionado
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-gray-100 inline-block" />{" "}
          Disponible
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RESERVATION MODAL
// ─────────────────────────────────────────────────────────────────────────────
function ReservaModal({ espacio, onClose }) {
  const [photoIdx, setPhotoIdx] = useState(0);
  const [fecha, setFecha] = useState(todayLima()); // Fix #7
  const [horaInicio, setHoraInicio] = useState(null);
  const [horaFin, setHoraFin] = useState(null);
  const [step, setStep] = useState("select");
  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    dni: "",
  });
  const [selectedHours, setSelectedHours] = useState([]);

  // Fix #3 — estado para mostrar aviso de horas no contiguas
  const [horasNoContiguas, setHorasNoContiguas] = useState(false);

  // Fix #6 — clave para forzar recarga de disponibilidad al volver a "select"
  const [disponibilidadKey, setDisponibilidadKey] = useState(0);

  // ── Estado de disponibilidad ───────────────────────────────────────────────
  const [horasOcupadas, setHorasOcupadas] = useState([]);
  const [loadingDisponibilidad, setLoadingDisponibilidad] = useState(false);
  const [errorDisponibilidad, setErrorDisponibilidad] = useState(null);

  // ── Cargar disponibilidad ──────────────────────────────────────────────────
  useEffect(() => {
    if (!fecha || !espacio._id) return;

    let cancelado = false;

    const cargarDisponibilidad = async () => {
      setLoadingDisponibilidad(true);
      setErrorDisponibilidad(null);
      setSelectedHours([]);
      setHorasNoContiguas(false);

      try {
        const res = await fetchDisponibilidad(espacio._id, fecha);
        if (!cancelado) setHorasOcupadas(res.data.horasOcupadas || []);
      } catch (err) {
        // Fix #1 — capturar error con nombre
        if (!cancelado) {
          setErrorDisponibilidad(
            "No se pudo cargar la disponibilidad. Intenta de nuevo."
          );
          setHorasOcupadas([]);
        }
      } finally {
        if (!cancelado) setLoadingDisponibilidad(false);
      }
    };

    cargarDisponibilidad();
    return () => {
      cancelado = true;
    };
  }, [fecha, espacio._id, disponibilidadKey]); // Fix #6 — disponibilidadKey como dependencia

  // ── Sincronizar horaInicio / horaFin ──────────────────────────────────────
  useEffect(() => {
    if (selectedHours.length > 0) {
      setHoraInicio(Math.min(...selectedHours));
      setHoraFin(Math.max(...selectedHours) + 1);
    } else {
      setHoraInicio(null);
      setHoraFin(null);
    }
  }, [selectedHours]);

  // Fix #3 — Validar contigüidad al hacer clic en una hora
  const handleHourClick = (h) => {
    setHorasNoContiguas(false);
    setSelectedHours((prev) => {
      if (prev.includes(h)) {
        // Deseleccionar — siempre válido
        return prev.filter((x) => x !== h).sort((a, b) => a - b);
      }
      const nueva = [...prev, h].sort((a, b) => a - b);
      // Verificar que todas las horas formen un bloque continuo sin saltos
      const esContigua = nueva.every(
        (hora, idx) => idx === 0 || hora === nueva[idx - 1] + 1
      );
      if (!esContigua) {
        setHorasNoContiguas(true);
        // Resetear selección y empezar nuevo bloque desde la hora clicada
        return [h];
      }
      return nueva;
    });
  };

  // Fix #6 — Volver a "select" y refrescar disponibilidad
  // Protege contra el caso de que alguien reserve el mismo horario
  // mientras el cliente llenaba el formulario
  const handleVolverASelect = () => {
    setStep("select");
    setDisponibilidadKey((k) => k + 1);
  };

  const horas_reservadas =
    horaFin !== null && horaInicio !== null ? horaFin - horaInicio : 0;
  const precio = Number(espacio.precio_por_hora || 0); // Fix #4
  const total = horas_reservadas * precio;
  const mitad = total / 2;
  const canReserve = fecha && selectedHours.length > 0;

  const fotos = espacio.imagenes?.length
    ? espacio.imagenes
    : [
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
      ];

  // Fix #2 — culqiUrl solo se construye cuando horaInicio y horaFin son números válidos
  // Si son null (sin selección), el href queda como "#" — el botón no navega a ningún lado
  const culqiUrl =
    horaInicio !== null && horaFin !== null
      ? `${CULQI_PAYMENT_LINK}?${new URLSearchParams({
          metadata_espacio_id: espacio._id,
          metadata_espacio: espacio.nombre,
          metadata_fecha: fecha,
          metadata_hora_inicio: String(horaInicio), // número garantizado, no string vacío
          metadata_hora_fin: String(horaFin), // número garantizado, no string vacío
          metadata_cliente_nombre: form.nombre,
          metadata_cliente_correo: form.correo,
          metadata_cliente_telefono: form.telefono || "",
          metadata_cliente_dni: form.dni || "",
          metadata_importe_total: String(total),
          metadata_pago_inicial: String(mitad),
        }).toString()}`
      : "#";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-5xl max-h-[92vh] overflow-y-auto shadow-2xl"
        style={{ animation: "slideUp .3s ease" }}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 pt-5 pb-0">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
              {espacio.tipo}
            </span>
            <h2 className="text-2xl font-black text-gray-900 mt-0.5">
              {espacio.nombre}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition cursor-pointer"
          >
            <IconX />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* ── PANEL IZQUIERDO ── */}
          <div className="p-6 border-r border-gray-100">
            {/* Carrusel */}
            <div
              className="relative rounded-xl overflow-hidden mb-4"
              style={{ height: 220 }}
            >
              <img
                src={fotos[photoIdx]}
                alt={espacio.nombre}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src =
                    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80";
                }}
              />
              {fotos.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setPhotoIdx((i) => (i - 1 + fotos.length) % fotos.length)
                    }
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-1.5 shadow hover:bg-white transition cursor-pointer"
                  >
                    <IconChevron dir="left" />
                  </button>
                  <button
                    onClick={() => setPhotoIdx((i) => (i + 1) % fotos.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-1.5 shadow hover:bg-white transition cursor-pointer"
                  >
                    <IconChevron dir="right" />
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {fotos.map((_, i) => (
                      <span
                        key={i}
                        onClick={() => setPhotoIdx(i)}
                        className="w-2 h-2 rounded-full cursor-pointer transition-all"
                        style={{
                          background:
                            i === photoIdx
                              ? "#FCD535"
                              : "rgba(255,255,255,0.7)",
                        }}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Miniaturas */}
            <div className="flex gap-2 mb-5">
              {fotos.map((f, i) => (
                <img
                  key={i}
                  src={f}
                  alt=""
                  onClick={() => setPhotoIdx(i)}
                  className="w-16 h-12 rounded-lg object-cover cursor-pointer transition-all"
                  style={{
                    outline:
                      i === photoIdx
                        ? "2.5px solid #FCD535"
                        : "2.5px solid transparent",
                  }}
                />
              ))}
            </div>

            {/* Fix #3 — Aviso de selección no contigua */}
            {horasNoContiguas && (
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-2">
                Las horas deben ser contiguas. Se reinició la selección desde la
                hora elegida.
              </p>
            )}

            {/* Error disponibilidad */}
            {errorDisponibilidad && (
              <p className="text-xs text-red-500 mb-2">{errorDisponibilidad}</p>
            )}

            <HourTimeline
              horasOcupadas={horasOcupadas}
              selectedHours={selectedHours}
              onHourClick={handleHourClick}
              loadingDisponibilidad={loadingDisponibilidad}
            />

            {/* Servicios */}
            {espacio.servicios?.length > 0 && (
              <div className="mt-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                  Incluye
                </p>
                <div className="flex flex-wrap gap-2">
                  {espacio.servicios.map((s) => (
                    <span
                      key={s}
                      className="flex items-center gap-1 text-xs bg-gray-50 border border-gray-200 rounded-full px-3 py-1 text-gray-600"
                    >
                      <span style={{ color: "#b89c00" }}>
                        <IconCheck />
                      </span>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── PANEL DERECHO ── */}
          <div className="p-6 flex flex-col gap-5">
            {/* ── STEP 1 — Selección de fecha y horas ── */}
            {step === "select" && (
              <>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                    Fecha de reserva
                  </p>
                  <input
                    type="date"
                    min={todayLima()} // Fix #7 — mínimo calculado en hora Lima
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-yellow-400 transition"
                  />
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                    Horas seleccionadas
                  </p>
                  {selectedHours.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">
                      Selecciona las horas disponibles en el panel izquierdo
                    </p>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm font-semibold text-gray-800">
                      {formatHour(horaInicio)} – {formatHour(horaFin)} ·{" "}
                      {horas_reservadas}h
                    </div>
                  )}
                </div>

                {/* Resumen de precio */}
                <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Precio / hora</span>
                    {/* Fix #4 — formatPrecio castea a Number antes de toFixed */}
                    <span className="font-semibold">
                      S/ {formatPrecio(espacio.precio_por_hora)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Duración</span>
                    <span className="font-semibold">
                      {horas_reservadas || "—"} h
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-1 flex justify-between text-base font-bold text-gray-900">
                    <span>Total</span>
                    <span>S/ {total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Pago ahora (50%)</span>
                    <span className="font-semibold text-yellow-600">
                      S/ {mitad.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  disabled={!canReserve}
                  onClick={() => setStep("form")}
                  className="w-full py-4 rounded-xl font-black text-base transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: canReserve ? "#FCD535" : "#e5e7eb",
                    color: "#111",
                  }}
                >
                  Continuar con la reserva →
                </button>
                <p className="text-center text-xs text-gray-400">
                  Sin cargos adicionales · Cancela con 24h de anticipación
                </p>
              </>
            )}

            {/* ── STEP 2 — Datos del cliente ── */}
            {step === "form" && (
              <>
                {/* Fix #6 — handleVolverASelect refresca disponibilidad */}
                <button
                  onClick={handleVolverASelect}
                  className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 transition cursor-pointer w-fit"
                >
                  <IconChevron dir="left" /> Volver
                </button>

                <div>
                  <h3 className="text-lg font-black text-gray-900 mb-1">
                    Tus datos
                  </h3>
                  <p className="text-xs text-gray-400">
                    Para confirmar la reserva necesitamos tu información de
                    contacto.
                  </p>
                </div>

                {[
                  {
                    key: "nombre",
                    label: "Nombre completo",
                    type: "text",
                    placeholder: "Ej: María Pérez",
                    required: true,
                  },
                  {
                    key: "correo",
                    label: "Correo electrónico",
                    type: "email",
                    placeholder: "tu@correo.com",
                    required: true,
                  },
                  {
                    key: "telefono",
                    label: "Teléfono (opcional)",
                    type: "tel",
                    placeholder: "+51 999 000 000",
                    required: false,
                  },
                  {
                    key: "dni",
                    label: "DNI (opcional)",
                    type: "text",
                    placeholder: "12345678",
                    required: false,
                  },
                ].map(({ key, label, type, placeholder, required }) => (
                  <div key={key} className="mb-3">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      {label}{" "}
                      {required && <span className="text-red-400">*</span>}
                    </label>
                    <input
                      type={type}
                      placeholder={placeholder}
                      value={form[key]}
                      onChange={(e) =>
                        setForm({ ...form, [key]: e.target.value })
                      }
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-yellow-400 transition"
                    />
                  </div>
                ))}

                {/* Mini resumen */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm text-gray-700 space-y-1">
                  <p>
                    <span className="font-bold">Espacio:</span> {espacio.nombre}
                  </p>
                  <p>
                    <span className="font-bold">Fecha:</span> {fecha}
                  </p>
                  <p>
                    <span className="font-bold">Horario:</span>{" "}
                    {formatHour(horaInicio)} – {formatHour(horaFin)}
                  </p>
                  <p>
                    <span className="font-bold">A pagar ahora:</span> S/{" "}
                    {mitad.toFixed(2)}
                  </p>
                </div>

                <button
                  disabled={!form.nombre || !form.correo}
                  onClick={() => setStep("confirm")}
                  className="w-full py-4 rounded-xl font-black text-base transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: "#FCD535", color: "#111" }}
                >
                  Ir al pago → S/ {mitad.toFixed(2)}
                </button>
              </>
            )}

            {/* ── STEP 3 — Confirmación y pago ── */}
            {step === "confirm" && (
              <div className="flex flex-col items-center justify-center h-full gap-5 py-10">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{ background: "#FCD535" }}
                >
                  <svg
                    width="36"
                    height="36"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#111"
                    strokeWidth="2.5"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>

                <div className="text-center">
                  <h3 className="text-2xl font-black text-gray-900">
                    ¡Todo listo!
                  </h3>
                  <p className="text-gray-500 text-sm mt-1">
                    Serás redirigido a Culqi para completar tu pago de forma
                    segura.
                  </p>
                </div>

                <div className="w-full bg-gray-50 rounded-xl p-4 text-sm space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Reserva</span>
                    <span className="font-semibold">{espacio.nombre}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Fecha</span>
                    <span className="font-semibold">{fecha}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Horario</span>
                    <span className="font-semibold">
                      {formatHour(horaInicio)} – {formatHour(horaFin)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Cliente</span>
                    <span className="font-semibold">{form.nombre}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-1">
                    <span className="font-bold">Pago ahora (50%)</span>
                    <span className="font-black text-lg">
                      S/ {mitad.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Fix #2 — culqiUrl con horas garantizadas como números */}
                <a
                  href={culqiUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 rounded-xl font-black text-base transition-all hover:opacity-90 text-center block"
                  style={{
                    background: "#FCD535",
                    color: "#111",
                    textDecoration: "none",
                  }}
                >
                  Pagar S/ {mitad.toFixed(2)} con Culqi →
                </a>

                {/* Fix #6 — al editar datos también se refresca disponibilidad */}
                <button
                  onClick={handleVolverASelect}
                  className="text-sm text-gray-400 hover:text-gray-600 cursor-pointer transition"
                >
                  ← Editar datos
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SPACE CARD 
// ─────────────────────────────────────────────────────────────────────────────
function EspacioCard({ espacio, onReservar }) {
  const foto =
    espacio.imagenes?.[0] ||
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80";

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group border border-gray-100">
      <div className="relative overflow-hidden" style={{ height: 200 }}>
        <img
          src={foto}
          alt={espacio.nombre}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src =
              "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80";
          }}
        />
        <div className="absolute top-3 left-3">
          <span
            className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full"
            style={{ background: "#FCD535", color: "#111" }}
          >
            {espacio.tipo}
          </span>
        </div>
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1">
          {/* Fix #4 — formatPrecio evita crash si precio viene como string */}
          <span className="text-sm font-black text-gray-900">
            S/ {formatPrecio(espacio.precio_por_hora)}
          </span>
          <span className="text-xs text-gray-500">/hr</span>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-black text-gray-900 mb-1">
          {espacio.nombre}
        </h3>
        <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1">
          {espacio.descripcion}
        </p>

        <div className="flex gap-4 text-xs text-gray-500 mb-4">
          <span className="flex items-center gap-1">
            <IconUsers />
            {espacio.capacidad} personas
          </span>
          <span className="flex items-center gap-1">
            <IconFloor />
            Piso {espacio.piso}
          </span>
        </div>

        {espacio.servicios?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {espacio.servicios.slice(0, 3).map((s) => (
              <span
                key={s}
                className="text-[11px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full"
              >
                {s}
              </span>
            ))}
            {espacio.servicios.length > 3 && (
              <span className="text-[11px] text-gray-400 px-2 py-0.5">
                +{espacio.servicios.length - 3} más
              </span>
            )}
          </div>
        )}

        <button
          onClick={() => onReservar(espacio)}
          className="w-full py-3 rounded-xl font-black text-sm transition-all cursor-pointer hover:opacity-90 hover:-translate-y-0.5 active:scale-95"
          style={{ background: "#FCD535", color: "#111" }}
        >
          Reservar espacio
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SKELETON
// ─────────────────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div
      className="bg-white rounded-2xl overflow-hidden border border-gray-100"
      style={{ animation: "pulse 1.5s ease-in-out infinite" }}
    >
      <div className="bg-gray-200" style={{ height: 200 }} />
      <div className="p-5 space-y-3">
        <div className="bg-gray-200 rounded h-5 w-2/3" />
        <div className="bg-gray-100 rounded h-4 w-full" />
        <div className="bg-gray-100 rounded h-4 w-4/5" />
        <div className="bg-gray-200 rounded-xl h-10 w-full mt-4" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN LANDING
// ─────────────────────────────────────────────────────────────────────────────
export default function CoworkingLanding() {
  const [filtros, setFiltros] = useState({ tipo: "", busqueda: "" });
  const [espacioModal, setEspacioModal] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const espaciosRef = useRef(null);

  const [espacios, setEspacios] = useState([]);
  const [loadingEspacios, setLoadingEspacios] = useState(true);
  const [errorEspacios, setErrorEspacios] = useState(null);

  // Fix #5 — contador dedicado para reintentar la carga de espacios
  const [retryCount, setRetryCount] = useState(0);

  // ── Scroll listener ────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // ── Carga de espacios ──────────────────────────────────────────────────────
  useEffect(() => {
    let cancelado = false;

    const cargarEspacios = async () => {
      setLoadingEspacios(true);
      setErrorEspacios(null);

      try {
        const res = await fetchEspacios({ tipo: filtros.tipo || undefined });
        // Fix #8 — console.log de debug eliminados para producción
        if (!cancelado) setEspacios(res.data.data || []);
      } catch (err) {
        // Fix #1 — capturar error con nombre
        if (!cancelado)
          setErrorEspacios(
            "No se pudieron cargar los espacios. Verifica tu conexión e intenta de nuevo."
          );
      } finally {
        if (!cancelado) setLoadingEspacios(false);
      }
    };

    cargarEspacios();
    return () => {
      cancelado = true;
    };
  }, [filtros.tipo, retryCount]); // Fix #5 — retryCount como dependencia

  // ── Filtrado en cliente ────────────────────────────────────────────────────
  const espaciosFiltrados = espacios.filter((e) => {
    if (!filtros.busqueda) return true;
    return e.nombre.toLowerCase().includes(filtros.busqueda.toLowerCase());
  });

  return (
    <div
      style={{
        fontFamily: "'DM Sans', 'Helvetica Neue', Arial, sans-serif",
        background: "#fafaf9",
        minHeight: "100vh",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700;900&family=DM+Serif+Display&display=swap');
        @keyframes slideUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes pulse   { 0%,100% { opacity:1; } 50% { opacity:.5; } }
        .line-clamp-2 { display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
        * { box-sizing: border-box; }
        body { margin: 0; }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-40 transition-all duration-300"
        style={{
          background: scrolled ? "rgba(255,255,255,0.95)" : "transparent",
          backdropFilter: scrolled ? "blur(10px)" : "none",
          borderBottom: scrolled ? "1px solid #f0f0f0" : "none",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm"
              style={{ background: "#FCD535" }}
            >
              N
            </div>
            <span className="font-black text-lg text-gray-900">
              Nexus<span style={{ color: "#FCD535" }}>App</span>
            </span>
          </div>
          <button
            onClick={() =>
              espaciosRef.current?.scrollIntoView({ behavior: "smooth" })
            }
            className="text-sm font-bold px-5 py-2 rounded-full transition-all cursor-pointer hover:opacity-80"
            style={{ background: "#FCD535", color: "#111" }}
          >
            Ver espacios
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        className="relative overflow-hidden"
        style={{ minHeight: "100vh", display: "flex", alignItems: "center" }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #e5e5e0 1px, transparent 0)",
            backgroundSize: "32px 32px",
            opacity: 0.6,
          }}
        />
        <div
          className="absolute"
          style={{
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "#FCD535",
            opacity: 0.12,
            top: -100,
            right: -100,
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute"
          style={{
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "#FCD535",
            opacity: 0.08,
            bottom: -50,
            left: -50,
            filter: "blur(60px)",
          }}
        />

        <div className="max-w-6xl mx-auto px-6 pt-24 pb-16 relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm text-sm text-gray-600">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
              {loadingEspacios
                ? "Cargando espacios..."
                : `${espacios.length} espacios disponibles`}
            </div>
            <h1
              className="font-black text-gray-900 leading-none mb-6"
              style={{
                fontSize: "clamp(3rem, 7vw, 5rem)",
                fontFamily: "'DM Serif Display', serif",
              }}
            >
              Tu espacio
              <br />
              <span
                style={{ color: "#FCD535", WebkitTextStroke: "2px #b89c00" }}
              >
                ideal
              </span>
              <br />
              te espera.
            </h1>
            <p
              className="text-xl text-gray-500 mb-8 leading-relaxed"
              style={{ fontWeight: 300 }}
            >
              Reserva salas y oficinas premium al instante. Sin papeleos, sin
              complicaciones.
            </p>
            <button
              onClick={() =>
                espaciosRef.current?.scrollIntoView({ behavior: "smooth" })
              }
              className="px-8 py-4 rounded-2xl font-black text-base transition-all cursor-pointer hover:-translate-y-1 hover:shadow-lg"
              style={{ background: "#FCD535", color: "#111" }}
            >
              Explorar espacios
            </button>
          </div>

          <div className="flex gap-10 mt-16 flex-wrap">
            {[
              [loadingEspacios ? "..." : `${espacios.length}+`, "Espacios"],
              ["500+", "Reservas"],
              ["98%", "Satisfacción"],
            ].map(([n, l]) => (
              <div key={l}>
                <div className="text-3xl font-black text-gray-900">{n}</div>
                <div className="text-sm text-gray-400 font-medium">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FILTROS + GRID ── */}
      <section ref={espaciosRef} className="max-w-6xl mx-auto px-6 pb-24">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8 flex flex-wrap gap-3 items-center sticky top-20 z-30">
          <div className="flex items-center gap-2 flex-1 min-w-48 border-2 border-gray-200 rounded-xl px-3 py-2 focus-within:border-yellow-400 transition">
            <IconSearch />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={filtros.busqueda}
              onChange={(e) =>
                setFiltros({ ...filtros, busqueda: e.target.value })
              }
              className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400"
            />
          </div>

          <div className="flex gap-2">
            {[
              { value: "", label: "Todos" },
              { value: "sala", label: "Salas" },
              { value: "oficina", label: "Oficinas" },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setFiltros({ ...filtros, tipo: value })}
                className="px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer"
                style={{
                  background: filtros.tipo === value ? "#FCD535" : "#f3f4f6",
                  color: filtros.tipo === value ? "#111" : "#6b7280",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <span className="text-xs text-gray-400 ml-auto">
            {loadingEspacios
              ? "Cargando..."
              : `${espaciosFiltrados.length} resultado${
                  espaciosFiltrados.length !== 1 ? "s" : ""
                }`}
          </span>
        </div>

        {/* Error */}
        {errorEspacios && (
          <div className="text-center py-16">
            <p className="text-red-500 font-bold mb-3">{errorEspacios}</p>
            {/* Fix #5 — retryCount incrementa → useEffect se re-ejecuta */}
            <button
              onClick={() => setRetryCount((c) => c + 1)}
              className="text-sm underline text-gray-500 hover:text-gray-800 cursor-pointer"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Skeletons */}
        {loadingEspacios && !errorEspacios && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <SkeletonCard key={n} />
            ))}
          </div>
        )}

        {/* Grid de espacios */}
        {!loadingEspacios &&
          !errorEspacios &&
          (espaciosFiltrados.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg font-bold">Sin resultados</p>
              <p className="text-sm mt-1">
                Intenta con otros filtros o busca por otro nombre
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {espaciosFiltrados.map((e) => (
                <EspacioCard
                  key={e._id}
                  espacio={e}
                  onReservar={setEspacioModal}
                />
              ))}
            </div>
          ))}
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center font-black text-xs"
              style={{ background: "#FCD535" }}
            >
              N
            </div>
            <span className="font-black text-lg text-gray-900">
              Nexus<span style={{ color: "#FCD535" }}>App</span>
            </span>
          </div>
          <p className="text-xs text-gray-400">
            © 2026 NexusApp. Todos los derechos reservados.
          </p>
        </div>
      </footer>

      {/* ── MODAL ── */}
      {espacioModal && (
        <ReservaModal
          espacio={espacioModal}
          onClose={() => setEspacioModal(null)}
        />
      )}
    </div>
  );
}
