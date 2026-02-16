import React, { useState, useContext, useEffect } from "react";
import "../css/Reservas/wizardComponent.css";
import { FaCheck } from "react-icons/fa";
import { useReserva } from "../context/ReservaContext.jsx";
import { useEspacio } from "../context/EspacioContext.jsx";
import { useCliente } from "../context/ClienteContext.jsx";

function WizardComponent({
  closeModal,
  refreshPagina,
  modo = "crear",
  reservaId = null,
  reservaInicial = null,
}) {
  const { espacios } = useEspacio();
  const { clientes } = useCliente();
  const { createReserva, reservas, updateReserva } = useReserva();
  const [currentStep, setCurrentStep] = useState(1);
  const [sugerenciasClientes, setSugerenciasClientes] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [reservationData, setReservationData] = useState({
    // Datos del espacio (paso 1)
    espacio_id: "",
    espacio_nombre: "",

    // Datos de fecha/hora (paso 2)
    fecha: "",
    horaInicio: "",
    horaFin: "",

    // Datos del cliente (paso 3)
    cliente: {
      nombre: "",
      dni: "",
      correo: "",
      telefono: "",
    },

    // Servicios adicionales (paso 4)
    servicios: [],
    observaciones_generales: "",

    // Datos de pago (paso 5)
    moneda: "PEN",
    importe_total: 0,
    pago_inicial: 0,
    metodo_pago: "efectivo",
    observacion_pago: "",

    // Campos fijos/calculados
    tipo: "interna",
    descripcion: "",
    observaciones: "",
    estado: "pendiente",
  });
  const [conflictoDetectado, setConflictoDetectado] = useState(null);

  useEffect(() => {
    if (modo === "editar" && reservaInicial) {
      cargarDatosReserva(reservaInicial);
    }
  }, [modo, reservaInicial]);

  const cargarDatosReserva = (reserva) => {
    const r = reserva.reserva; // La reserva viene dentro de { reserva, detalle }
    const d = reserva.detalle;

    // Extraer fecha y horas del ISO
    const fechaInicio = new Date(r.inicio);
    const fechaFin = new Date(r.fin);

    const fecha = fechaInicio.toISOString().split("T")[0];
    const horaInicio = fechaInicio.toTimeString().slice(0, 5); // HH:MM
    const horaFin = fechaFin.toTimeString().slice(0, 5);

    // Extraer servicios del campo observaciones_generales
    let serviciosExtraidos = [];
    if (d?.observaciones_generales?.includes("Servicios adicionales:")) {
      const match = d.observaciones_generales.match(
        /Servicios adicionales: ([^.]+)/
      );
      if (match) {
        serviciosExtraidos = match[1].split(", ").map((s) => s.trim());
      }
    }

    // Pre-cargar todos los datos
    setReservationData({
      espacio_id: r.espacio._id,
      espacio_nombre: r.espacio.nombre,
      fecha,
      horaInicio,
      horaFin,
      cliente: {
        nombre: r.cliente.nombre || "",
        dni: r.cliente.dni || "",
        correo: r.cliente.correo || "",
        telefono: r.cliente.telefono || "",
      },
      servicios: serviciosExtraidos,
      observaciones_generales: d?.observaciones_generales || "",
      moneda: d?.moneda || "PEN",
      importe_total: d?.importe_total || 0,
      pago_inicial: d?.pagos?.[0]?.monto_pago || 0,
      metodo_pago: d?.pagos?.[0]?.metodo_pago || "efectivo",
      observacion_pago: d?.pagos?.[0]?.observacion_pago || "",
      tipo: r.tipo || "interna",
      descripcion: r.descripcion || "",
      observaciones: r.observaciones || "",
      estado: r.estado || "pendiente",
    });

    // Pre-seleccionar el cliente si existe
    setClienteSeleccionado(r.cliente);
  };

  // Simulación de datos de espaciosBD (en producción vendría de una API)

  function procesarEspaciosCoworking(espacios) {
    return espacios.map((espacio) => {
      // Determinar el precio (priorizar precio_por_hora, si no existe buscar en tarifas)
      let precioHora = espacio.precio_por_hora;

      // Si no tiene precio_por_hora, buscar precio mensual en tarifas
      if (!precioHora && espacio.tarifas && espacio.tarifas.length > 0) {
        const tarifaMensual = espacio.tarifas.find(
          (t) => t.tipo === "mensual" || t.periodo === "mes"
        );
        precioHora = tarifaMensual ? tarifaMensual.precio : 0;
      }

      return {
        id: espacio._id,
        nombre: espacio.nombre,
        capacidad: espacio.capacidad,
        precio_hora: precioHora || 0,
      };
    });
  }

  // Uso:
  const espaciosBD = procesarEspaciosCoworking(espacios);

  const servicios = [
    { nombre: "Pizarra", precio: 10 },
    { nombre: "Estacionamiento x hora", precio: 5 },
    { nombre: "Impresiones Color", precio: 0.5 },
    { nombre: "Impresiones B/N", precio: 0.3 },
  ];

  const metodosPago = [
    { value: "efectivo", label: "Efectivo" },
    { value: "tarjeta", label: "Tarjeta" },
    { value: "transferencia", label: "Transferencia" },
    { value: "yape", label: "Yape" },
  ];

  const handleNext = () => {
    if (currentStep === 2) {
      const conflicto = verificarConflictoHorario();

      if (conflicto) {
        // Guardar el conflicto y no avanzar
        setConflictoDetectado(conflicto);
        return; // Bloquear el avance
      } else {
        // Limpiar cualquier conflicto previo
        setConflictoDetectado(null);
      }
    }
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);

      // Calcular precio total cuando se avanza al paso 4 (servicios)
      if (currentStep === 3 || currentStep === 4) {
        calcularPrecioTotal();
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);

      // ✅ Recalcular el precio si estamos regresando al paso 4 desde el paso 5
      // Esto asegura que el precio esté actualizado si el usuario vuelve a modificar servicios
      if (currentStep === 5) {
        calcularPrecioTotal();
      }
    }
  };

  const handleInputChange = (field, value) => {
    setReservationData({
      ...reservationData,
      [field]: value,
    });
  };

  const handleInputChangeConValidacion = (field, value) => {
    // Actualizar el campo
    setReservationData({
      ...reservationData,
      [field]: value,
    });

    // Limpiar el conflicto cuando el usuario cambie fecha/hora
    if (field === "fecha" || field === "horaInicio" || field === "horaFin") {
      setConflictoDetectado(null);
    }
  };

  const handleClienteChange = (field, value) => {
    setReservationData({
      ...reservationData,
      cliente: {
        ...reservationData.cliente,
        [field]: value,
      },
    });
  };

  const buscarClientesSimilares = (nombreBuscado) => {
    if (!nombreBuscado || nombreBuscado.trim().length < 2) {
      setSugerenciasClientes([]);
      setMostrarSugerencias(false);
      return;
    }

    const busqueda = nombreBuscado.toLowerCase().trim();
    const palabrasBusqueda = busqueda.split(" ");

    const clientesFiltrados = clientes.filter((cliente) => {
      const nombreCliente = cliente.nombre.toLowerCase();

      // Verificar si todas las palabras de búsqueda están en el nombre
      return palabrasBusqueda.every((palabra) =>
        nombreCliente.includes(palabra)
      );
    });

    // Ordenar por relevancia (los que empiezan con la búsqueda primero)
    clientesFiltrados.sort((a, b) => {
      const nombreA = a.nombre.toLowerCase();
      const nombreB = b.nombre.toLowerCase();

      if (nombreA.startsWith(busqueda) && !nombreB.startsWith(busqueda)) {
        return -1;
      }
      if (!nombreA.startsWith(busqueda) && nombreB.startsWith(busqueda)) {
        return 1;
      }
      return 0;
    });

    setSugerenciasClientes(clientesFiltrados.slice(0, 5)); // Limitar a 5 resultados
    setMostrarSugerencias(clientesFiltrados.length > 0);
  };

  const seleccionarCliente = (cliente) => {
    // Autocompletar todos los datos del formulario
    setReservationData({
      ...reservationData,
      cliente: {
        nombre: cliente.nombre,
        dni: cliente.dni || "",
        correo: cliente.correo || "",
        telefono: cliente.telefono || "",
      },
    });

    // Guardar el cliente seleccionado para mostrar estadísticas
    setClienteSeleccionado(cliente);

    // Ocultar sugerencias
    setMostrarSugerencias(false);
  };

  const contarReservasCliente = (clienteId) => {
    if (!clienteId) return 0;

    return reservas.data.filter((r) => r.reserva.cliente._id === clienteId)
      .length;
  };

  const handleNombreChange = (value) => {
    // Actualizar el campo nombre
    setReservationData({
      ...reservationData,
      cliente: {
        ...reservationData.cliente,
        nombre: value,
      },
    });

    // Limpiar cliente seleccionado si se está editando
    if (clienteSeleccionado && value !== clienteSeleccionado.nombre) {
      setClienteSeleccionado(null);
    }

    // Buscar clientes similares
    buscarClientesSimilares(value);
  };

  const handleServiceToggle = (service) => {
    const updatedServices = reservationData.servicios.includes(service)
      ? reservationData.servicios.filter((s) => s !== service)
      : [...reservationData.servicios, service];

    setReservationData({
      ...reservationData,
      servicios: updatedServices,
    });
  };

  const calcularPrecioTotal = () => {
    // Buscar el espacio seleccionado para obtener su precio por hora
    const espaciosBDeleccionado = espaciosBD.find(
      (e) => e.id === reservationData.espacio_id
    );

    if (
      !espaciosBDeleccionado ||
      !reservationData.horaInicio ||
      !reservationData.horaFin
    ) {
      return 0;
    }

    // Calcular horas de diferencia
    const horaInicio = new Date(`2000-01-01T${reservationData.horaInicio}`);
    const horaFin = new Date(`2000-01-01T${reservationData.horaFin}`);
    const horas = (horaFin - horaInicio) / (1000 * 60 * 60);

    // Calcular costo base del espacio
    let total = espaciosBDeleccionado.precio_hora * horas;

    // Agregar costo de servicios adicionales
    reservationData.servicios.forEach((servicioNombre) => {
      const servicio = servicios.find((s) => s.nombre === servicioNombre);
      if (servicio) {
        total += servicio.precio;
      }
    });

    setReservationData((prev) => ({
      ...prev,
      importe_total: total,
    }));

    return total;
  };

  const formatDateTimeISO = () => {
    if (
      !reservationData.fecha ||
      !reservationData.horaInicio ||
      !reservationData.horaFin
    ) {
      return { inicio: null, fin: null };
    }

    const inicio = new Date(
      `${reservationData.fecha}T${reservationData.horaInicio}`
    );
    const fin = new Date(`${reservationData.fecha}T${reservationData.horaFin}`);

    // Ajustar al huso horario de Perú (-05:00)
    const inicioISO = inicio.toISOString().replace("Z", "-05:00");
    const finISO = fin.toISOString().replace("Z", "-05:00");

    return { inicio: inicioISO, fin: finISO };
  };

  const calcularEstadoReserva = (pagoInicial) => {
    if (pagoInicial === 0) {
      return "pendiente";
    } else if (pagoInicial > 0) {
      return "confirmada";
    }
    return "pendiente"; // Fallback por si acaso
  };

  const verificarConflictoHorario = () => {
    if (
      !reservationData.espacio_id ||
      !reservationData.fecha ||
      !reservationData.horaInicio ||
      !reservationData.horaFin
    ) {
      return null;
    }

    const inicioNueva = new Date(
      `${reservationData.fecha}T${reservationData.horaInicio}`
    );
    const finNueva = new Date(
      `${reservationData.fecha}T${reservationData.horaFin}`
    );

    const reservasDelEspacio = reservas.data.filter((r) => {
      // ⬇️ AGREGAR: Excluir la reserva actual en modo edición
      if (modo === "editar" && r.reserva._id === reservaId) {
        return false; // No comparar con sí misma
      }

      return r.reserva.espacio._id === reservationData.espacio_id;
    });

    const conflicto = reservasDelEspacio.find((r) => {
      const inicioExistente = new Date(r.reserva.inicio);
      const finExistente = new Date(r.reserva.fin);

      const empiezaDurante =
        inicioNueva >= inicioExistente && inicioNueva < finExistente;

      const terminaDurante =
        finNueva > inicioExistente && finNueva <= finExistente;

      const envuelve =
        inicioNueva <= inicioExistente && finNueva >= finExistente;

      return empiezaDurante || terminaDurante || envuelve;
    });

    return conflicto || null;
  };

  const formatearFechaHora = (fechaISO) => {
    const fecha = new Date(fechaISO);
    const opciones = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    return fecha.toLocaleString("es-PE", opciones);
  };

  const handleSubmit = async () => {
    try {
      // Validaciones básicas (iguales)
      if (!reservationData.espacio_id) {
        alert("Por favor seleccione un espacio");
        return;
      }

      if (
        !reservationData.fecha ||
        !reservationData.horaInicio ||
        !reservationData.horaFin
      ) {
        alert("Por favor complete la fecha y horario");
        return;
      }

      if (!reservationData.cliente.nombre.trim()) {
        alert("El nombre del cliente es obligatorio");
        return;
      }

      if (reservationData.pago_inicial > reservationData.importe_total) {
        alert("El abono no puede ser mayor al importe total");
        return;
      }

      const { inicio, fin } = formatDateTimeISO();
      const estadoFinal = calcularEstadoReserva(reservationData.pago_inicial);

      // ⬇️ MODIFICAR: Preparar datos según el modo
      if (modo === "crear") {
        // MODO CREAR (igual que antes)
        const reservaData = {
          espacio: reservationData.espacio_id,
          inicio: inicio,
          fin: fin,
          cliente: {
            nombre: reservationData.cliente.nombre,
            dni: reservationData.cliente.dni,
            correo: reservationData.cliente.correo,
            telefono: reservationData.cliente.telefono,
          },
          tipo: reservationData.tipo,
          descripcion: `Reserva de ${reservationData.espacio_nombre} - ${reservationData.cliente.nombre}`,
          observaciones: reservationData.observaciones,
          moneda: reservationData.moneda,
          importe_total: reservationData.importe_total,
          pago_inicial: reservationData.pago_inicial,
          metodo_pago: reservationData.metodo_pago,
          observacion_pago: reservationData.observacion_pago,
          estado: estadoFinal,
          observaciones_generales:
            reservationData.servicios.length > 0
              ? `Servicios adicionales: ${reservationData.servicios.join(
                  ", "
                )}. ${reservationData.observaciones_generales}`
              : reservationData.observaciones_generales,
          usuario: "67e73148062e37ff7821fb98",
        };

        await createReserva(reservaData);
      } else {
        // ⬇️ MODO EDITAR (nuevo)
        const reservaDataActualizar = {
          espacio: reservationData.espacio_id,
          inicio: inicio,
          fin: fin,
          cliente: {
            nombre: reservationData.cliente.nombre,
            dni: reservationData.cliente.dni,
            correo: reservationData.cliente.correo,
            telefono: reservationData.cliente.telefono,
          },
          tipo: reservationData.tipo,
          descripcion: `Reserva de ${reservationData.espacio_nombre} - ${reservationData.cliente.nombre}`,
          observaciones: reservationData.observaciones,
          estado: estadoFinal,

          // Detalle como objeto separado (según tu backend)
          detalle: {
            moneda: reservationData.moneda,
            importe_total: reservationData.importe_total,
            observaciones_generales:
              reservationData.servicios.length > 0
                ? `Servicios adicionales: ${reservationData.servicios.join(
                    ", "
                  )}. ${reservationData.observaciones_generales}`
                : reservationData.observaciones_generales,

            // Solo agregar nuevo pago si es diferente al inicial
            nuevo_pago:
              reservationData.pago_inicial > 0 &&
              reservaInicial?.detalle?.pagos?.length === 0
                ? {
                    monto_pago: reservationData.pago_inicial,
                    metodo_pago: reservationData.metodo_pago,
                    observacion_pago: reservationData.observacion_pago,
                  }
                : undefined,
          },

          usuario: "67e73148062e37ff7821fb98",
        };

        await updateReserva(reservaId, reservaDataActualizar);
      }

      closeModal();
      refreshPagina();

      // Limpiar estados
      setConflictoDetectado(null);
      setClienteSeleccionado(null);
      setSugerenciasClientes([]);
      setMostrarSugerencias(false);
      setCurrentStep(1);
      setReservationData({
        espacio_id: "",
        espacio_nombre: "",
        fecha: "",
        horaInicio: "",
        horaFin: "",
        cliente: {
          nombre: "",
          dni: "",
          correo: "",
          telefono: "",
        },
        servicios: [],
        observaciones_generales: "",
        moneda: "PEN",
        importe_total: 0,
        pago_inicial: 0,
        metodo_pago: "efectivo",
        observacion_pago: "",
        tipo: "interna",
        descripcion: "",
        observaciones: "",
        estado: "pendiente",
      });
    } catch (error) {
      console.error(
        `Error al ${modo === "crear" ? "crear" : "actualizar"} reserva:`,
        error
      );
      alert(`Error al ${modo === "crear" ? "crear" : "actualizar"} la reserva`);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <h2>Seleccionar Espacio</h2>
            <div className="options-grid">
              {espaciosBD.map((espacio) => (
                <div
                  key={espacio.id}
                  className={`option-card ${
                    reservationData.espacio_id === espacio.id ? "selected" : ""
                  }`}
                  onClick={() => {
                    // Usar una actualización única del estado
                    setReservationData((prev) => ({
                      ...prev,
                      espacio_id: espacio.id,
                      espacio_nombre: espacio.nombre,
                    }));
                  }}
                >
                  <h3>{espacio.nombre}</h3>
                  <p>S/ {espacio.precio_hora} por hora</p>
                </div>
              ))}
            </div>
            <div className="button-group">
              <button
                className="btn-next"
                onClick={handleNext}
                disabled={!reservationData.espacio_id} // Deshabilitar si no hay espacio seleccionado
              >
                Siguiente
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <h2>Disponibilidad</h2>

            <div className="form-group">
              <label>Fecha:</label>
              <input
                type="date"
                value={reservationData.fecha}
                onChange={(e) =>
                  handleInputChangeConValidacion("fecha", e.target.value)
                }
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="time-group">
              <div className="form-group">
                <label>Hora Inicio:</label>
                <input
                  type="time"
                  value={reservationData.horaInicio}
                  onChange={(e) =>
                    handleInputChangeConValidacion("horaInicio", e.target.value)
                  }
                />
              </div>
              <div className="form-group">
                <label>Hora Fin:</label>
                <input
                  type="time"
                  value={reservationData.horaFin}
                  onChange={(e) =>
                    handleInputChangeConValidacion("horaFin", e.target.value)
                  }
                />
              </div>
            </div>

            {/* ⬇️ AGREGAR ESTE BLOQUE PARA MOSTRAR CONFLICTOS */}
            {conflictoDetectado && (
              <div className="conflicto-alerta">
                <h4>⚠️ Conflicto de Horario Detectado</h4>
                <div className="conflicto-detalle">
                  <p>
                    <strong>Cliente:</strong>{" "}
                    {conflictoDetectado.reserva.cliente.nombre}
                  </p>
                  <p>
                    <strong>Inicio:</strong>{" "}
                    {formatearFechaHora(conflictoDetectado.reserva.inicio)}
                  </p>
                  <p>
                    <strong>Fin:</strong>{" "}
                    {formatearFechaHora(conflictoDetectado.reserva.fin)}
                  </p>
                  <p>
                    <strong>Estado:</strong>{" "}
                    <span
                      className={`estado-badge ${conflictoDetectado.reserva.estado}`}
                    >
                      {conflictoDetectado.reserva.estado === "pendiente"
                        ? "Pendiente"
                        : conflictoDetectado.reserva.estado === "confirmada"
                        ? "Confirmada"
                        : conflictoDetectado.reserva.estado}
                    </span>
                  </p>
                </div>
                <p className="conflicto-mensaje">
                  Por favor, seleccione otro horario o fecha para continuar.
                </p>
              </div>
            )}
            {/* ⬆️ FIN DEL BLOQUE */}

            <div className="button-group">
              <button className="btn-prev" onClick={handlePrev}>
                Anterior
              </button>
              <button
                className="btn-next"
                onClick={handleNext}
                disabled={!!conflictoDetectado} // ⬅️ Deshabilitar si hay conflicto
              >
                Siguiente
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="step-content">
            <h2>Registrar Cliente</h2>

            {/* ⬇️ AGREGAR CONTADOR DE RESERVAS */}
            {clienteSeleccionado && (
              <div className="cliente-info-banner">
                <div className="cliente-info-item">
                  <span className="info-label">Cliente:</span>
                  <span className="info-value">
                    {clienteSeleccionado.nombre}
                  </span>
                </div>
                <div className="cliente-info-item">
                  <span className="info-label">Total de reservas:</span>
                  <span className="info-badge">
                    {contarReservasCliente(clienteSeleccionado._id)}
                  </span>
                </div>
              </div>
            )}
            {/* ⬆️ FIN CONTADOR */}

            <div className="form-group autocomplete-wrapper">
              <label>Nombre completo *:</label>
              <input
                type="text"
                placeholder="Ingrese nombre completo"
                value={reservationData.cliente.nombre}
                onChange={(e) => handleNombreChange(e.target.value)}
                onFocus={() => {
                  // Mostrar sugerencias si hay texto
                  if (reservationData.cliente.nombre.trim().length >= 2) {
                    buscarClientesSimilares(reservationData.cliente.nombre);
                  }
                }}
                onBlur={() => {
                  // Ocultar sugerencias después de un pequeño delay
                  // para permitir el click en una sugerencia
                  setTimeout(() => setMostrarSugerencias(false), 200);
                }}
                required
              />

              {/* ⬇️ AGREGAR DROPDOWN DE SUGERENCIAS */}
              {mostrarSugerencias && sugerenciasClientes.length > 0 && (
                <div className="sugerencias-dropdown">
                  {sugerenciasClientes.map((cliente) => (
                    <div
                      key={cliente._id}
                      className="sugerencia-item"
                      onMouseDown={(e) => {
                        e.preventDefault(); // Prevenir que se dispare el onBlur
                        seleccionarCliente(cliente);
                      }}
                    >
                      <div className="sugerencia-principal">
                        <strong>{cliente.nombre}</strong>
                        {cliente.dni && (
                          <span className="sugerencia-detalle">
                            DNI: {cliente.dni}
                          </span>
                        )}
                      </div>
                      {(cliente.correo || cliente.telefono) && (
                        <div className="sugerencia-secundaria">
                          {cliente.correo && <span>{cliente.correo}</span>}
                          {cliente.telefono && <span>{cliente.telefono}</span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {/* ⬆️ FIN DROPDOWN */}
            </div>

            <div className="form-group">
              <label>DNI:</label>
              <input
                type="text"
                placeholder="Número de DNI"
                value={reservationData.cliente.dni}
                onChange={(e) => handleClienteChange("dni", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                placeholder="correo@ejemplo.com"
                value={reservationData.cliente.correo}
                onChange={(e) => handleClienteChange("correo", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Teléfono:</label>
              <input
                type="tel"
                placeholder="+51 999 999 999"
                value={reservationData.cliente.telefono}
                onChange={(e) =>
                  handleClienteChange("telefono", e.target.value)
                }
              />
            </div>

            <div className="button-group">
              <button className="btn-prev" onClick={handlePrev}>
                Anterior
              </button>
              <button className="btn-next" onClick={handleNext}>
                Siguiente
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="step-content">
            <h2>Servicios Adicionales</h2>
            <p>Seleccione los servicios adicionales requeridos:</p>
            <div className="services-grid">
              {servicios.map((servicio, index) => (
                <div
                  key={index}
                  className={`service-card ${
                    reservationData.servicios.includes(servicio.nombre)
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => handleServiceToggle(servicio.nombre)}
                >
                  <h3>{servicio.nombre}</h3>
                  <p>S/ {servicio.precio}</p>
                </div>
              ))}
            </div>
            <div className="form-group">
              <label>Observaciones adicionales:</label>
              <textarea
                placeholder="Alguna observación específica sobre los servicios..."
                value={reservationData.observaciones_generales}
                onChange={(e) =>
                  handleInputChange("observaciones_generales", e.target.value)
                }
                rows="3"
              />
            </div>
            <div className="button-group">
              <button className="btn-prev" onClick={handlePrev}>
                Anterior
              </button>
              <button className="btn-next" onClick={handleNext}>
                Siguiente
              </button>
            </div>
          </div>
        );

      case 5:
        // Calcular total automáticamente
        const espaciosBDeleccionado = espaciosBD.find(
          (e) => e.id === reservationData.espacio_id
        );
        const espacioNombre = espaciosBDeleccionado
          ? espaciosBDeleccionado.nombre
          : "No seleccionado";

        return (
          <div className="step-content">
            <div className="resumen">
              <h3>Resumen de Reserva</h3>
              <p>
                <strong>Espacio:</strong> {espacioNombre}
              </p>
              <p>
                <strong>Fecha:</strong>{" "}
                {reservationData.fecha || "No seleccionada"}
              </p>
              <p>
                <strong>Horario:</strong> {reservationData.horaInicio} -{" "}
                {reservationData.horaFin}
              </p>
              <p>
                <strong>Cliente:</strong>{" "}
                {reservationData.cliente.nombre || "No registrado"}
              </p>
              <p>
                <strong>Servicios:</strong>{" "}
                {reservationData.servicios.join(", ") || "Ninguno"}
              </p>

              <div className="precio-total">
                <h3>
                  Total a pagar: S/ {reservationData.importe_total.toFixed(2)}
                </h3>
              </div>

              <div className="form-group">
                <label>Método de Pago:</label>
                <select
                  value={reservationData.metodo_pago}
                  onChange={(e) =>
                    handleInputChange("metodo_pago", e.target.value)
                  }
                >
                  {metodosPago.map((metodo) => (
                    <option key={metodo.value} value={metodo.value}>
                      {metodo.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Monto de Abono (S/):</label>
                <input
                  type="number"
                  placeholder="0.00"
                  min="0"
                  max={reservationData.importe_total}
                  value={reservationData.pago_inicial}
                  onChange={(e) => {
                    const nuevoPago = parseFloat(e.target.value) || 0;
                    const nuevoEstado = calcularEstadoReserva(nuevoPago);

                    setReservationData((prev) => ({
                      ...prev,
                      pago_inicial: nuevoPago,
                      estado: nuevoEstado, // ⬅️ Actualizar estado automáticamente
                    }));
                  }}
                />
              </div>

              <div className="form-group">
                <label>Observación del pago:</label>
                <input
                  type="text"
                  placeholder="Ej: Adelanto, señal, etc."
                  value={reservationData.observacion_pago}
                  onChange={(e) =>
                    handleInputChange("observacion_pago", e.target.value)
                  }
                />
              </div>
            </div>
            <div className="button-group">
              <button className="btn-prev" onClick={handlePrev}>
                Anterior
              </button>
              <button className="btn-submit" onClick={handleSubmit}>
                {modo === "crear" ? "Confirmar Reserva" : "Actualizar Reserva"}
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
            <h1>{modo === "crear" ? "Nueva Reserva" : "Editar Reserva"}</h1>
          </section>
          <section className="steps">
            {[1, 2, 3, 4, 5].map((step) => (
              <React.Fragment key={step}>
                <div className={`step ${currentStep >= step ? "active" : ""}`}>
                  <span>{currentStep > step ? <FaCheck /> : step}</span>
                  <p>
                    {step === 1 && "Seleccionar Espacio"}
                    {step === 2 && "Disponibilidad"}
                    {step === 3 && "Registrar Cliente"}
                    {step === 4 && "Serv. Adicionales"}
                    {step === 5 && "Abono"}
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

export default WizardComponent;
