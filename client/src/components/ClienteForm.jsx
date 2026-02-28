import React, { useState } from "react";
import "../css/Clientes/clienteForm.css";
import { useCliente } from "../context/ClienteContext.jsx";
import { toast } from "react-hot-toast";

function ClienteForm({ closeModal, refreshPagina, cliente = null }) {
  const { createCliente, updateCliente } = useCliente();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Al editar, los campos opcionales se pre-rellenan con los datos actuales
  const [clienteData, setClienteData] = useState({
    nombre: cliente?.nombre || "",
    correo: cliente?.correo || "",
    password: "",
    confirmPassword: "",
    rol: cliente?.rol || "cliente",
    telefono: cliente?.telefono || "",
    dni: cliente?.dni || "",
    estado: cliente?.estado || "activo",
  });

  const [errors, setErrors] = useState({});

  const roles = [
    { value: "cliente", label: "Cliente" },
    { value: "admin", label: "Administrador" },
    { value: "superadmin", label: "Super Administrador" },
  ];

  // El backend solo acepta activo / inactivo
  const estados = [
    { value: "activo", label: "Activo" },
    { value: "inactivo", label: "Inactivo" },
  ];

  /* ────────────── helpers ────────────── */

  const handleInputChange = (field, value) => {
    setClienteData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  /* ────────────── validaciones ────────────── */

  const validateStep1 = () => {
    const newErrors = {};

    if (!clienteData.nombre.trim())
      newErrors.nombre = "El nombre es obligatorio";

    if (!clienteData.correo.trim() && !clienteData.telefono.trim())
      newErrors.correo = "Ingresa al menos un correo o teléfono";

    if (
      clienteData.correo.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clienteData.correo)
    )
      newErrors.correo = "Correo electrónico inválido";

    if (clienteData.telefono && !/^[\d\s+()-]+$/.test(clienteData.telefono))
      newErrors.telefono = "Teléfono inválido";

    if (clienteData.dni && !/^\d{8}$/.test(clienteData.dni))
      newErrors.dni = "DNI debe tener 8 dígitos";

    // Contraseña solo obligatoria en creación
    if (!cliente) {
      if (!clienteData.password.trim())
        newErrors.password = "La contraseña es obligatoria";
      else if (clienteData.password.length < 8)
        newErrors.password = "Mínimo 8 caracteres";
      else if (
        !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(
          clienteData.password
        )
      )
        newErrors.password =
          "Debe contener mayúsculas, minúsculas, números y caracteres especiales";

      if (!clienteData.confirmPassword.trim())
        newErrors.confirmPassword = "Confirme la contraseña";
      else if (clienteData.password !== clienteData.confirmPassword)
        newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    return newErrors;
  };

  /* ────────────── navegación entre pasos ────────────── */

  const handleNext = () => {
    const stepErrors = validateStep1();
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setCurrentStep(2);
  };

  const handlePrev = () => {
    setErrors({});
    setCurrentStep(1);
  };

  /* ────────────── submit final ────────────── */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Solo enviamos los campos que el backend de updateCliente acepta
      const datosEnviar = {
        nombre: clienteData.nombre.trim(),
        correo: clienteData.correo.trim() || undefined,
        telefono: clienteData.telefono.trim() || undefined,
        dni: clienteData.dni.trim() || undefined,
        rol: clienteData.rol,
        estado: clienteData.estado,
      };

      if (!cliente) {
        // Creación: incluir password
        datosEnviar.password = clienteData.password;
      }

      if (cliente) {
        // ── ACTUALIZACIÓN ──
        await updateCliente(cliente._id, datosEnviar);
        // updateCliente del context ya lanza toast.success
      } else {
        // ── CREACIÓN ──
        await createCliente(datosEnviar);
        // createCliente del context ya lanza toast.success
      }

      if (closeModal) closeModal();
      if (refreshPagina) refreshPagina();

      // Limpiar solo si es creación
      if (!cliente) {
        setClienteData({
          nombre: "",
          correo: "",
          password: "",
          confirmPassword: "",
          rol: "cliente",
          telefono: "",
          dni: "",
          estado: "activo",
        });
        setCurrentStep(1);
      }
    } catch (error) {
      console.error("Error al guardar cliente:", error);
      toast.error(
        error.response?.data?.error ||
          error.message ||
          "Error al guardar cliente"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ────────────── render ────────────── */

  return (
    <div className="cliente-form-container">
      <div className="container">
        {/* ── Panel lateral izquierdo ── */}
        <div className="page__one">
          <section className="title">
            <h1>{cliente ? "Editar Cliente" : "Nuevo Cliente"}</h1>
          </section>
          <section className="steps">
            <div
              className={`step ${currentStep === 1 ? "active" : "completed"}`}
            >
              <span>{currentStep > 1 ? "✓" : "1"}</span>
              <p>Datos Personales</p>
            </div>
            <div className={`step ${currentStep === 2 ? "active" : ""}`}>
              <span>2</span>
              <p>Rol y Estado</p>
            </div>
          </section>
        </div>

        {/* ── Panel derecho ── */}
        <div className="page__two">
          <div className="step-content">
            <form onSubmit={handleSubmit}>
              {/* ══════════════ PASO 1: Datos Personales ══════════════ */}
              {currentStep === 1 && (
                <>
                  <h2>
                    {cliente ? "Editar Datos Personales" : "Datos Personales"}
                  </h2>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Nombre completo *</label>
                      <input
                        type="text"
                        placeholder="Ingrese nombre completo"
                        value={clienteData.nombre}
                        onChange={(e) =>
                          handleInputChange("nombre", e.target.value)
                        }
                        className={errors.nombre ? "error" : ""}
                      />
                      {errors.nombre && (
                        <span className="error-message">{errors.nombre}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label>
                        Correo electrónico {!clienteData.telefono && "*"}
                      </label>
                      <input
                        type="email"
                        placeholder="correo@ejemplo.com"
                        value={clienteData.correo}
                        onChange={(e) =>
                          handleInputChange("correo", e.target.value)
                        }
                        className={errors.correo ? "error" : ""}
                      />
                      {errors.correo && (
                        <span className="error-message">{errors.correo}</span>
                      )}
                    </div>
                  </div>

                  {/* Contraseña: solo en creación */}
                  {!cliente && (
                    <div className="form-row">
                      <div className="form-group">
                        <label>Contraseña *</label>
                        <input
                          type="password"
                          placeholder="Ingrese contraseña segura"
                          value={clienteData.password}
                          onChange={(e) =>
                            handleInputChange("password", e.target.value)
                          }
                          className={errors.password ? "error" : ""}
                        />
                        {errors.password && (
                          <span className="error-message">
                            {errors.password}
                          </span>
                        )}
                        <small className="hint">
                          Mínimo 8 caracteres con mayúsculas, minúsculas,
                          números y caracteres especiales
                        </small>
                      </div>

                      <div className="form-group">
                        <label>Confirmar contraseña *</label>
                        <input
                          type="password"
                          placeholder="Confirme la contraseña"
                          value={clienteData.confirmPassword}
                          onChange={(e) =>
                            handleInputChange("confirmPassword", e.target.value)
                          }
                          className={errors.confirmPassword ? "error" : ""}
                        />
                        {errors.confirmPassword && (
                          <span className="error-message">
                            {errors.confirmPassword}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="form-row">
                    <div className="form-group">
                      <label>Teléfono {!clienteData.correo && "*"}</label>
                      <input
                        type="tel"
                        placeholder="+51 999 999 999"
                        value={clienteData.telefono}
                        onChange={(e) =>
                          handleInputChange("telefono", e.target.value)
                        }
                        className={errors.telefono ? "error" : ""}
                      />
                      {errors.telefono && (
                        <span className="error-message">{errors.telefono}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label>DNI</label>
                      <input
                        type="text"
                        placeholder="Número de DNI (8 dígitos)"
                        value={clienteData.dni}
                        onChange={(e) =>
                          handleInputChange("dni", e.target.value)
                        }
                        className={errors.dni ? "error" : ""}
                        maxLength="8"
                      />
                      {errors.dni && (
                        <span className="error-message">{errors.dni}</span>
                      )}
                    </div>
                  </div>

                  <div className="button-group">
                    <button
                      type="button"
                      className="btn-prev"
                      onClick={closeModal}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="btn-next"
                      onClick={handleNext}
                    >
                      Siguiente →
                    </button>
                  </div>
                </>
              )}

              {/* ══════════════ PASO 2: Rol y Estado ══════════════ */}
              {currentStep === 2 && (
                <>
                  <h2>Rol y Estado</h2>

                  {/* Resumen del paso 1 */}
                  <div className="resumen-paso1">
                    <p>
                      <strong>Cliente:</strong> {clienteData.nombre}
                    </p>
                    {clienteData.correo && (
                      <p>
                        <strong>Correo:</strong> {clienteData.correo}
                      </p>
                    )}
                    {clienteData.telefono && (
                      <p>
                        <strong>Teléfono:</strong> {clienteData.telefono}
                      </p>
                    )}
                    {clienteData.dni && (
                      <p>
                        <strong>DNI:</strong> {clienteData.dni}
                      </p>
                    )}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Rol</label>
                      <select
                        value={clienteData.rol}
                        onChange={(e) =>
                          handleInputChange("rol", e.target.value)
                        }
                      >
                        {roles.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Estado</label>
                      <select
                        value={clienteData.estado}
                        onChange={(e) =>
                          handleInputChange("estado", e.target.value)
                        }
                      >
                        {estados.map((e) => (
                          <option key={e.value} value={e.value}>
                            {e.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="button-group">
                    <button
                      type="button"
                      className="btn-prev"
                      onClick={handlePrev}
                      disabled={isSubmitting}
                    >
                      ← Anterior
                    </button>
                    <button
                      type="submit"
                      className="btn-submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner"></span>
                          {cliente ? "Actualizando..." : "Creando..."}
                        </>
                      ) : cliente ? (
                        "Actualizar Cliente"
                      ) : (
                        "Crear Cliente"
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClienteForm;
