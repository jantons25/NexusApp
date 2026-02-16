import React, { useState } from "react";
import "../css/Clientes/clienteForm.css";
import { useCliente } from "../context/ClienteContext.jsx";
import { toast } from "react-hot-toast";

function ClienteForm({ closeModal, refreshPagina, cliente = null }) {
  const { createCliente, updateCliente } = useCliente();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado inicial del formulario
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

  // Estados para mensajes de error
  const [errors, setErrors] = useState({});

  const roles = [
    { value: "cliente", label: "Cliente" },
    { value: "empresa", label: "Empresa" },
    { value: "admin", label: "Administrador" },
  ];

  const estados = [
    { value: "activo", label: "Activo" },
    { value: "inactivo", label: "Inactivo" },
    { value: "pendiente", label: "Pendiente" },
  ];

  const handleInputChange = (field, value) => {
    setClienteData({
      ...clienteData,
      [field]: value,
    });

    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validar nombre
    if (!clienteData.nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio";
    }

    // Validar correo
    if (!clienteData.correo.trim()) {
      newErrors.correo = "El correo es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clienteData.correo)) {
      newErrors.correo = "Correo electrónico inválido";
    }

    // Validar password (solo en creación)
    if (!cliente) {
      if (!clienteData.password.trim()) {
        newErrors.password = "La contraseña es obligatoria";
      } else if (clienteData.password.length < 8) {
        newErrors.password = "La contraseña debe tener al menos 8 caracteres";
      } else if (
        !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(
          clienteData.password
        )
      ) {
        newErrors.password =
          "Debe contener mayúsculas, minúsculas, números y caracteres especiales";
      }

      // Validar confirmación de password
      if (!clienteData.confirmPassword.trim()) {
        newErrors.confirmPassword = "Confirme la contraseña";
      } else if (clienteData.password !== clienteData.confirmPassword) {
        newErrors.confirmPassword = "Las contraseñas no coinciden";
      }
    }

    // Validar teléfono
    if (clienteData.telefono && !/^[\d\s+()-]+$/.test(clienteData.telefono)) {
      newErrors.telefono = "Teléfono inválido";
    }

    // Validar DNI
    if (clienteData.dni && !/^\d{8}$/.test(clienteData.dni)) {
      newErrors.dni = "DNI debe tener 8 dígitos";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar formulario
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Preparar datos para enviar
      const datosEnviar = {
        nombre: clienteData.nombre.trim(),
        correo: clienteData.correo.trim(),
        rol: clienteData.rol,
        telefono: clienteData.telefono.trim(),
        dni: clienteData.dni.trim(),
        estado: clienteData.estado,
      };

      // Solo incluir password si es creación de cliente o si se cambió
      if (!cliente) {
        datosEnviar.password = clienteData.password;
      }

      if (cliente) {
        // Actualizar cliente existente
        await updateCliente(cliente._id, datosEnviar);
        toast.success("Cliente actualizado correctamente");
      } else {
        // Crear nuevo cliente
        await createCliente(datosEnviar);
        toast.success("Cliente creado correctamente");
      }

      // Cerrar modal y refrescar
      if (closeModal) closeModal();
      if (refreshPagina) refreshPagina();

      // Resetear formulario si no es edición
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
      }
    } catch (error) {
      console.error("Error al guardar cliente:", error);
      toast.error(error.response?.data?.error || "Error al guardar cliente");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (closeModal) {
      closeModal();
    }
  };

  return (
    <div className="cliente-form-container">
      <div className="container">
        <div className="page__one">
          <section className="title">
            <h1>{cliente ? "Editar Cliente" : "Nuevo Cliente"}</h1>
          </section>
          <section className="steps">
            <div className="step active">
              <span>1</span>
              <p>Información del Cliente</p>
            </div>
          </section>
        </div>
        <div className="page__two">
          <div className="step-content single-form">
            <form onSubmit={handleSubmit}>
              <h2>{cliente ? "Editar Cliente" : "Registrar Nuevo Cliente"}</h2>

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
                  <label>Correo electrónico *</label>
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
                      <span className="error-message">{errors.password}</span>
                    )}
                    <small className="hint">
                      Mínimo 8 caracteres con mayúsculas, minúsculas, números y
                      caracteres especiales
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
                  <label>Teléfono</label>
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
                    onChange={(e) => handleInputChange("dni", e.target.value)}
                    className={errors.dni ? "error" : ""}
                    maxLength="8"
                  />
                  {errors.dni && (
                    <span className="error-message">{errors.dni}</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Rol</label>
                  <select
                    value={clienteData.rol}
                    onChange={(e) => handleInputChange("rol", e.target.value)}
                  >
                    {roles.map((rol) => (
                      <option key={rol.value} value={rol.value}>
                        {rol.label}
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
                    {estados.map((estado) => (
                      <option key={estado.value} value={estado.value}>
                        {estado.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="button-group single-form-buttons">
                <button
                  type="button"
                  className="btn-prev"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancelar
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
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClienteForm;
