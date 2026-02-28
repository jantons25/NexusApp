import {
  crearReserva,
  getReservas,
  getReservaById,
  actualizarReserva,
  eliminarReserva,
  reprogramarReserva,
  agregarPagoAReserva,
  getEspaciosPublicos,
  getHorasOcupadas,
} from "../services/reserva.service.js";

// Crear una nueva reserva
export const registrarReserva = async (req, res) => {
  try {
    // Si usas auth, conviene forzar usuario desde token:
    const usuarioId = req.user?.id;
    // const payload = { ...req.body, usuario: usuarioId || req.body.usuario };

    const resultado = await crearReserva({ ...req.body, usuario: usuarioId });
    res.status(201).json(resultado);
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  } 
};

// Obtener todas las reservas con detalle (paginación + filtros)
export const obtenerReservas = async (req, res) => {
  try {
    const {
      desde,
      hasta,
      estado,
      espacio,
      tipo,
      cliente,
      page = 1,
      limit = 50,
    } = req.query;

    const opts = {
      filtros: {
        ...(desde ? { desde } : {}),
        ...(hasta ? { hasta } : {}),
        ...(estado ? { estado } : {}),
        ...(espacio ? { espacio } : {}),
        ...(tipo ? { tipo } : {}),
        ...(cliente ? { cliente } : {}),
      },
      page: Number(page),
      limit: Number(limit),
      sort: { inicio: -1 },
    };

    const reservas = await getReservas(opts);
    res.status(200).json(reservas);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Obtener reserva por ID con detalle
export const obtenerReservaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await getReservaById(id);
    res.status(200).json(resultado);
  } catch (error) {
    // Si quieres distinguir 400 vs 404, lo ideal es lanzar errores tipados en service.
    // Por ahora, devolvemos 404 si el mensaje sugiere no encontrado, sino 400.
    const status = error.message.includes("no encontrada") ? 404 : 400;
    res.status(status).json({ mensaje: error.message });
  }
};

// Actualizar reserva y su detalle
export const editarReserva = async (req, res) => {
  try {
    const { id } = req.params;

    // Si usas auth, conviene forzar usuario desde token:
    // const payload = { ...req.body, usuario: req.user?.id };

    const resultado = await actualizarReserva(id, req.body);
    res.status(200).json(resultado);
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
};

export const cancelarReserva = async (req, res) => {
  try {
    const { id } = req.params;

    // Ideal: viene del middleware de auth
    const usuarioId = req.user?.id || req.body.usuario || null;

    // Motivo opcional
    const motivo = req.body?.motivo_cancelacion || req.body?.motivo || "";

    const resultado = await eliminarReserva(id, usuarioId, motivo);

    // Si hay devolución pendiente, responder con 200 e incluir el resumen
    res.status(200).json(resultado);
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
};

export const reprogramarReservaController = async (req, res) => {
  try {
    const { id } = req.params;
    const { nuevoInicio, nuevoFin } = req.body;
    const usuarioId = req.user?.id || null;
    const resultado = await reprogramarReserva(
      id,
      nuevoInicio,
      nuevoFin,
      usuarioId
    );
    res.status(200).json(resultado);
  } catch (error) {
    const status = error.message.includes("no encontrada") ? 404 : 400;
    res.status(status).json({ ok: false, mensaje: error.message });
  }
};

// Agregar un pago a una reserva existente
export const agregarPagoController = async (req, res) => {
  try {
    // Extraemos el ID de la reserva desde la URL (/reservas/:id/pagos)
    const { id } = req.params;

    // Construimos el payload combinando el body con el usuario autenticado.
    // req.user?.id viene del middleware de auth (si está activo).
    // Si no hay auth activa todavía, el usuario puede venir directo del body.
    const payload = {
      ...req.body,
      usuario: req.user?.id || req.body.usuario || null,
    };

    // Llamamos al servicio que hace todo el trabajo real
    const resultado = await agregarPagoAReserva(id, payload);

    // Si todo salió bien, respondemos con 201 (recurso creado)
    res.status(201).json(resultado);
  } catch (error) {
    // Distinguimos entre "no encontrada" (404) y errores de validación (400)
    const status = error.message.includes("no encontrada") ? 404 : 400;
    res.status(status).json({ mensaje: error.message });
  }
};

export const obtenerEspaciosPublicos = async (req, res) => {
  try {
    const { tipo, sede } = req.query;

    const filtros = {
      ...(tipo ? { tipo } : {}),
      ...(sede ? { sede } : {}),
    };

    const resultado = await getEspaciosPublicos(filtros);
    res.status(200).json(resultado);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

export const obtenerDisponibilidad = async (req, res) => {
  try {
    const { espacioId } = req.params;
    const { fecha } = req.query;

    // ── Validaciones de entrada ──────────────────────────────────────────────
    if (!fecha) {
      return res
        .status(400)
        .json({ mensaje: 'El parámetro "fecha" es obligatorio (YYYY-MM-DD).' });
    }

    const fechaDate = new Date(fecha);
    if (isNaN(fechaDate)) {
      return res
        .status(400)
        .json({ mensaje: "Fecha inválida. Usa el formato YYYY-MM-DD." });
    }

    if (!espacioId) {
      return res
        .status(400)
        .json({ mensaje: "El ID del espacio es obligatorio." });
    }

    // ── Llamada al service ───────────────────────────────────────────────────
    const resultado = await getHorasOcupadas(espacioId, fecha);

    res.status(200).json(resultado);
  } catch (error) {
    const status = error.message.includes("no encontrado") ? 404 : 500;
    res.status(status).json({ mensaje: error.message });
  }
};