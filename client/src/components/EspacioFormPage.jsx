import React, { useState, useEffect } from "react";
import { FaCheck } from "react-icons/fa";
import { useEspacio } from "../context/EspacioContext.jsx";

const tiposEspacio = [
  { value: "oficina", label: "Oficina Privada" },
  { value: "sala", label: "Sala de Reuniones" },
  { value: "compartido", label: "Escritorio Compartido" },
  { value: "auditorio", label: "Auditorio" },
  { value: "oficina_virtual", label: "Oficina Virtual" },
];

const serviciosPredefinidos = [
  "WiFi",
  "Aire acondicionado",
  "Agua",
  "Impresora",
  "Proyector",
  "Pantalla",
  "Pizarra",
  "Estacionamiento",
  "Lockers",
  "Recepción",
];

const estados = [
  { value: "disponible", label: "Disponible" },
  { value: "inactivo", label: "Inactivo" },
  { value: "mantenimiento", label: "Mantenimiento" },
  { value: "reservado", label: "Reservado" },
  { value: "no_disponible", label: "No Disponible" },
];

// Inicializa el estado del form a partir de un espacio existente o vacío
const buildInitialState = (espacio) => {
  if (!espacio) {
    return {
      nombre: "",
      sede: "Nexus Cowork",
      piso: "",
      tipo: "",
      capacidad: "",
      descripcion: "",
      precio_por_hora: "",
      tarifas: [
        { tipo: "hora", precio: "", activo: true },
        { tipo: "dia", precio: "", activo: true },
        { tipo: "mes", precio: "", activo: true },
      ],
      servicios: [],
      serviciosPersonalizados: [],
      nuevoServicio: "",
      equipamiento: [],
      nuevoEquipamiento: "",
      color_tag: "#FCD535",
      estado: "disponible",
      habilitado_reservas: true,
    };
  }

  // Modo edición: hidratar desde el espacio existente
  const tarifasBase = [
    { tipo: "hora", precio: "", activo: true },
    { tipo: "dia", precio: "", activo: true },
    { tipo: "mes", precio: "", activo: true },
  ];

  const tarifasHidratadas = tarifasBase.map((base) => {
    const encontrada = espacio.tarifas?.find((t) => t.tipo === base.tipo);
    return encontrada
      ? {
          tipo: base.tipo,
          precio: encontrada.precio ?? "",
          activo: encontrada.activo ?? true,
        }
      : base;
  });

  // Separar servicios predefinidos de personalizados
  const serviciosExistentes = espacio.servicios ?? [];
  const serviciosPersonalizados = serviciosExistentes.filter(
    (s) => !serviciosPredefinidos.includes(s)
  );

  return {
    nombre: espacio.nombre ?? "",
    sede: espacio.sede ?? "Nexus Cowork",
    piso: espacio.piso ?? "",
    tipo: espacio.tipo ?? "",
    capacidad: espacio.capacidad ?? "",
    descripcion: espacio.descripcion ?? "",
    precio_por_hora: espacio.precio_por_hora ?? "",
    tarifas: tarifasHidratadas,
    servicios: serviciosExistentes,
    serviciosPersonalizados,
    nuevoServicio: "",
    equipamiento: espacio.equipamiento ?? [],
    nuevoEquipamiento: "",
    color_tag: espacio.color_tag || "#FCD535",
    estado: espacio.estado ?? "disponible",
    habilitado_reservas: espacio.habilitado_reservas ?? true,
  };
};

function EspacioFormPage({ closeModal, refreshPagina, espacio }) {
  const { createEspacio, updateEspacio } = useEspacio();
  const modoEditar = !!espacio;

  const [currentStep, setCurrentStep] = useState(1);
  const [espacioData, setEspacioData] = useState(() =>
    buildInitialState(espacio)
  );
  const [loading, setLoading] = useState(false);

  // Si cambia el espacio que se pasa (ej. abrir otro modal), re-inicializar
  useEffect(() => {
    setEspacioData(buildInitialState(espacio));
    setCurrentStep(1);
  }, [espacio?._id]);

  const handleInputChange = (field, value) => {
    setEspacioData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTarifaChange = (index, field, value) => {
    setEspacioData((prev) => {
      const updated = [...prev.tarifas];
      updated[index] = {
        ...updated[index],
        [field]: field === "precio" ? parseFloat(value) || "" : value,
      };
      return { ...prev, tarifas: updated };
    });
  };

  const handleServicioToggle = (servicio) => {
    setEspacioData((prev) => {
      const tiene = prev.servicios.includes(servicio);
      return {
        ...prev,
        servicios: tiene
          ? prev.servicios.filter((s) => s !== servicio)
          : [...prev.servicios, servicio],
      };
    });
  };

  const handleAddServicioPersonalizado = () => {
    const nuevo = espacioData.nuevoServicio.trim();
    if (!nuevo) return;
    setEspacioData((prev) => ({
      ...prev,
      serviciosPersonalizados: [...prev.serviciosPersonalizados, nuevo],
      servicios: [...prev.servicios, nuevo],
      nuevoServicio: "",
    }));
  };

  const handleAddEquipamiento = () => {
    const nuevo = espacioData.nuevoEquipamiento.trim();
    if (!nuevo) return;
    setEspacioData((prev) => ({
      ...prev,
      equipamiento: [...prev.equipamiento, nuevo],
      nuevoEquipamiento: "",
    }));
  };

  const handleRemoveEquipamiento = (index) => {
    setEspacioData((prev) => {
      const updated = [...prev.equipamiento];
      updated.splice(index, 1);
      return { ...prev, equipamiento: updated };
    });
  };

  const calcularTarifasAutomaticamente = () => {
    const precioHora = parseFloat(espacioData.precio_por_hora) || 0;
    setEspacioData((prev) => ({
      ...prev,
      tarifas: [
        {
          tipo: "hora",
          precio: parseFloat(precioHora.toFixed(2)),
          activo: true,
        },
        {
          tipo: "dia",
          precio: parseFloat((precioHora * 8 * 0.9).toFixed(2)),
          activo: true,
        },
        {
          tipo: "mes",
          precio: parseFloat((precioHora * 8 * 22 * 0.8).toFixed(2)),
          activo: true,
        },
      ],
    }));
  };

  const handleSubmit = async () => {
    if (!espacioData.nombre.trim()) {
      alert("El nombre del espacio es obligatorio");
      return;
    }
    if (!espacioData.tipo) {
      alert("Debe seleccionar un tipo de espacio");
      return;
    }
    if (!espacioData.capacidad || Number(espacioData.capacidad) < 1) {
      alert("La capacidad debe ser al menos 1");
      return;
    }

    const payload = {
      nombre: espacioData.nombre.trim(),
      sede: espacioData.sede?.trim() || "Nexus Cowork",
      piso: parseInt(espacioData.piso) || null,
      tipo: espacioData.tipo,
      capacidad: parseInt(espacioData.capacidad),
      precio_por_hora: parseFloat(espacioData.precio_por_hora) || 0,
      tarifas: espacioData.tarifas.map((t) => ({
        tipo: t.tipo,
        precio: parseFloat(t.precio) || 0,
        activo: t.activo,
      })),
      descripcion: espacioData.descripcion,
      servicios: espacioData.servicios,
      equipamiento: espacioData.equipamiento,
      color_tag: espacioData.color_tag,
      estado: espacioData.estado,
      habilitado_reservas: espacioData.habilitado_reservas,
    };

    try {
      setLoading(true);
      if (modoEditar) {
        await updateEspacio(espacio._id, payload);
      } else {
        await createEspacio(payload);
      }
      refreshPagina?.();
      closeModal?.();
    } catch (error) {
      console.error("Error al guardar espacio:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <h2 className="font-bold">Información Básica</h2>

            <div className="form-group">
              <label>Nombre del Espacio *:</label>
              <input
                type="text"
                placeholder="Ej: Oficina Privada 2A"
                value={espacioData.nombre}
                onChange={(e) => handleInputChange("nombre", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Sede:</label>
              <input
                type="text"
                placeholder="Nexus Cowork"
                value={espacioData.sede}
                onChange={(e) => handleInputChange("sede", e.target.value)}
              />
            </div>

            <div className="time-group">
              <div className="form-group">
                <label>Piso:</label>
                <input
                  type="number"
                  placeholder="Número de piso"
                  min="0"
                  value={espacioData.piso}
                  onChange={(e) => handleInputChange("piso", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Tipo de Espacio *:</label>
                <select
                  value={espacioData.tipo}
                  onChange={(e) => handleInputChange("tipo", e.target.value)}
                >
                  <option value="">Seleccionar tipo</option>
                  {tiposEspacio.map((tipo) => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Capacidad (personas) *:</label>
              <input
                type="number"
                placeholder="Ej: 5"
                min="1"
                value={espacioData.capacidad}
                onChange={(e) => handleInputChange("capacidad", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Descripción:</label>
              <textarea
                placeholder="Describa el espacio, características principales..."
                value={espacioData.descripcion}
                onChange={(e) =>
                  handleInputChange("descripcion", e.target.value)
                }
                rows="3"
              />
            </div>

            <div className="button-group">
              <button className="btn-next" onClick={() => setCurrentStep(2)}>
                Siguiente
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <h2>Precios y Tarifas</h2>

            <div className="form-group">
              <label>Precio por Hora (S/) *:</label>
              <input
                type="number"
                placeholder="0.00"
                min="0"
                step="0.01"
                value={espacioData.precio_por_hora}
                onChange={(e) =>
                  handleInputChange("precio_por_hora", e.target.value)
                }
              />
            </div>

            <div className="button-container" style={{ marginBottom: "20px" }}>
              <button
                type="button"
                onClick={calcularTarifasAutomaticamente}
                className="btn-secondary"
                style={{ padding: "8px 16px", fontSize: "14px" }}
              >
                Calcular Tarifas Automáticamente
              </button>
            </div>

            <h3>Tarifas</h3>
            <div className="tarifas-grid">
              {espacioData.tarifas.map((tarifa, index) => (
                <div key={tarifa.tipo} className="tarifa-card">
                  <div className="tarifa-header">
                    <h4>
                      {tarifa.tipo.charAt(0).toUpperCase() +
                        tarifa.tipo.slice(1)}
                    </h4>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={tarifa.activo}
                        onChange={(e) =>
                          handleTarifaChange(index, "activo", e.target.checked)
                        }
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>
                  <div className="form-group">
                    <label>Precio (S/):</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      value={tarifa.precio}
                      onChange={(e) =>
                        handleTarifaChange(index, "precio", e.target.value)
                      }
                      disabled={!tarifa.activo}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="button-group">
              <button className="btn-prev" onClick={() => setCurrentStep(1)}>
                Anterior
              </button>
              <button className="btn-next" onClick={() => setCurrentStep(3)}>
                Siguiente
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="step-content">
            <h2 className="font-bold">Servicios</h2>

            <div className="services-grid">
              {serviciosPredefinidos.map((servicio, index) => (
                <div
                  key={index}
                  className={`service-card ${
                    espacioData.servicios.includes(servicio) ? "selected" : ""
                  }`}
                  onClick={() => handleServicioToggle(servicio)}
                >
                  {servicio}
                </div>
              ))}
            </div>

            <div className="form-group" style={{ marginTop: "20px" }}>
              <label>Agregar servicio personalizado:</label>
              <div className="input-with-button">
                <input
                  type="text"
                  placeholder="Ej: Conserjería, Recepción 24h..."
                  value={espacioData.nuevoServicio}
                  onChange={(e) =>
                    handleInputChange("nuevoServicio", e.target.value)
                  }
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleAddServicioPersonalizado()
                  }
                />
                <button
                  type="button"
                  onClick={handleAddServicioPersonalizado}
                  className="btn-add"
                >
                  Agregar
                </button>
              </div>
            </div>

            {espacioData.serviciosPersonalizados.length > 0 && (
              <div className="selected-items">
                <h4>Servicios personalizados:</h4>
                <div className="tags-container">
                  {espacioData.serviciosPersonalizados.map(
                    (servicio, index) => (
                      <span key={index} className="tag">
                        {servicio}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}

            <div className="button-group">
              <button className="btn-prev" onClick={() => setCurrentStep(2)}>
                Anterior
              </button>
              <button className="btn-next" onClick={() => setCurrentStep(4)}>
                Siguiente
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="step-content">
            <h2>Equipamiento</h2>

            <div className="form-group">
              <label>Agregar equipamiento:</label>
              <div className="input-with-button">
                <input
                  type="text"
                  placeholder="Ej: Mesa ejecutiva, 5 sillas ergonómicas..."
                  value={espacioData.nuevoEquipamiento}
                  onChange={(e) =>
                    handleInputChange("nuevoEquipamiento", e.target.value)
                  }
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleAddEquipamiento()
                  }
                />
                <button
                  type="button"
                  onClick={handleAddEquipamiento}
                  className="btn-add"
                >
                  Agregar
                </button>
              </div>
            </div>

            {espacioData.equipamiento.length > 0 && (
              <div className="equipamiento-list">
                <h4>Equipamiento:</h4>
                <ul className="equipamiento-items">
                  {espacioData.equipamiento.map((item, index) => (
                    <li key={index} className="equipamiento-item">
                      <span>{item}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveEquipamiento(index)}
                        className="btn-remove"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="form-group" style={{ marginTop: "16px" }}>
              <label>Color de etiqueta:</label>
              <div className="color-picker-container">
                <input
                  type="color"
                  value={espacioData.color_tag}
                  onChange={(e) =>
                    handleInputChange("color_tag", e.target.value)
                  }
                />
                <span
                  style={{
                    backgroundColor: espacioData.color_tag,
                    width: "30px",
                    height: "30px",
                    borderRadius: "4px",
                    marginLeft: "10px",
                    display: "inline-block",
                  }}
                />
                <span style={{ marginLeft: "10px" }}>
                  {espacioData.color_tag}
                </span>
              </div>
            </div>

            <div className="button-group">
              <button className="btn-prev" onClick={() => setCurrentStep(3)}>
                Anterior
              </button>
              <button className="btn-next" onClick={() => setCurrentStep(5)}>
                Siguiente
              </button>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="step-content">
            <div className="resumen">
              <h3>Resumen del Espacio</h3>
              <div className="resumen-grid">
                <div className="resumen-item">
                  <strong>Nombre:</strong>
                  <p>{espacioData.nombre || "No ingresado"}</p>
                </div>
                <div className="resumen-item">
                  <strong>Tipo:</strong>
                  <p>
                    {tiposEspacio.find((t) => t.value === espacioData.tipo)
                      ?.label || "No seleccionado"}
                  </p>
                </div>
                <div className="resumen-item">
                  <strong>Piso:</strong>
                  <p>{espacioData.piso || "No especificado"}</p>
                </div>
                <div className="resumen-item">
                  <strong>Capacidad:</strong>
                  <p>{espacioData.capacidad || "0"} personas</p>
                </div>
              </div>

              <div className="form-group">
                <label>Estado del espacio:</label>
                <select
                  value={espacioData.estado}
                  onChange={(e) => handleInputChange("estado", e.target.value)}
                >
                  {estados.map((estado) => (
                    <option key={estado.value} value={estado.value}>
                      {estado.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={espacioData.habilitado_reservas}
                    onChange={(e) =>
                      handleInputChange("habilitado_reservas", e.target.checked)
                    }
                    style={{ width: "16px", height: "16px" }}
                  />
                  Habilitado para reservas
                </label>
              </div>

              <div className="summary-details">
                <div className="summary-section">
                  <h4>Servicios ({espacioData.servicios.length}):</h4>
                  <div className="tags-container">
                    {espacioData.servicios.length > 0 ? (
                      espacioData.servicios.map((s, i) => (
                        <span key={i} className="tag">
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-sm italic">
                        Sin servicios
                      </span>
                    )}
                  </div>
                </div>

                <div className="summary-section">
                  <h4>Equipamiento ({espacioData.equipamiento.length}):</h4>
                  <div className="tags-container">
                    {espacioData.equipamiento.length > 0 ? (
                      espacioData.equipamiento.map((item, i) => (
                        <span key={i} className="tag">
                          {item}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-sm italic">
                        Sin equipamiento
                      </span>
                    )}
                  </div>
                </div>

                <div className="summary-section">
                  <h4>Tarifas:</h4>
                  <div className="tarifas-resumen">
                    {espacioData.tarifas
                      .filter((t) => t.activo)
                      .map((tarifa, i) => (
                        <div key={i} className="tarifa-resumen-item">
                          <span>
                            {tarifa.tipo.charAt(0).toUpperCase() +
                              tarifa.tipo.slice(1)}
                            :
                          </span>
                          <strong>S/ {tarifa.precio || "0.00"}</strong>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="button-group">
              <button className="btn-prev" onClick={() => setCurrentStep(4)}>
                Anterior
              </button>
              <button
                className="btn-submit"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading
                  ? "Guardando..."
                  : modoEditar
                  ? "Guardar Cambios"
                  : "Crear Espacio"}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="wizard-component">
      <div className="container">
        <div className="page__one">
          <section className="title">
            <h1>{modoEditar ? "Editar Espacio" : "Nuevo Espacio"}</h1>
          </section>
          <section className="steps">
            {[1, 2, 3, 4, 5].map((step) => (
              <React.Fragment key={step}>
                <div className={`step ${currentStep >= step ? "active" : ""}`}>
                  <span>{currentStep > step ? <FaCheck /> : step}</span>
                  <p>
                    {step === 1 && "Información Básica"}
                    {step === 2 && "Precios y Tarifas"}
                    {step === 3 && "Servicios"}
                    {step === 4 && "Equipamiento"}
                    {step === 5 && "Configuración"}
                  </p>
                </div>
                {step < 5 && (
                  <div className="separator">
                    <span></span>
                  </div>
                )}
              </React.Fragment>
            ))}
          </section>
        </div>
        <div className="page__two">{renderStepContent()}</div>
      </div>
    </div>
  );
}

export default EspacioFormPage;
