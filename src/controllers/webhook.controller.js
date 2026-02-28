import Reserva from "../models/reserva.model.js";
import Cliente from "../models/cliente.model.js";
import DetalleReserva from "../models/detalle_reserva.js";
import Espacio from "../models/espacio.model.js";

/**
 * POST /api/webhooks/culqi
 *
 * Culqi llama a este endpoint cuando ocurre un pago exitoso.
 * Verifica las credenciales Basic Auth, extrae la metadata de la reserva
 * y crea Cliente + Reserva + DetalleReserva en MongoDB automáticamente.
 *
 * Variables de entorno requeridas en Render:
 *   CULQI_WEBHOOK_USER     → usuario configurado en el panel de Culqi
 *   CULQI_WEBHOOK_PASSWORD → contraseña configurada en el panel de Culqi
 *
 * IMPORTANTE — reserva.model.js:
 *   El campo "usuario" debe ser condicional para reservas web:
 *   usuario: {
 *     type: mongoose.Schema.Types.ObjectId,
 *     ref: "User",
 *     required: function() { return this.tipo !== "web"; }
 *   }
 */
export const culqiWebhook = async (req, res) => {
  try {
    // ── 1) Verificar autenticación Basic HTTP ─────────────────────────────────
    //       Culqi envía: Authorization: Basic base64(usuario:contraseña)
    //       Fix #5: usar substring(6).trim() en lugar de replace() para mayor robustez
    const authHeader = req.headers["authorization"] || "";

    if (!authHeader.toLowerCase().startsWith("basic ")) {
      console.warn(
        "[Culqi Webhook] Header de autorización ausente o inválido."
      );
      return res.status(401).json({ mensaje: "No autorizado." });
    }

    const base64Credentials = authHeader.substring(6).trim(); // Fix #5
    const decoded = Buffer.from(base64Credentials, "base64").toString("utf-8");
    const colonIndex = decoded.indexOf(":"); // Fix: split en primer ":" por si la contraseña contiene ":"
    const userRecibido = decoded.substring(0, colonIndex);
    const passwordRecibida = decoded.substring(colonIndex + 1);

    const expectedUser = process.env.CULQI_WEBHOOK_USER;
    const expectedPassword = process.env.CULQI_WEBHOOK_PASSWORD;

    if (
      !expectedUser ||
      !expectedPassword ||
      userRecibido !== expectedUser ||
      passwordRecibida !== expectedPassword
    ) {
      console.warn(
        "[Culqi Webhook] Credenciales incorrectas — posible intento no autorizado."
      );
      return res.status(401).json({ mensaje: "No autorizado." });
    }

    // ── 2) Validar body del evento ────────────────────────────────────────────
    const evento = req.body;

    if (!evento || !evento.type) {
      console.error("[Culqi Webhook] Body del evento vacío o sin tipo.");
      return res.status(400).json({ mensaje: "Evento inválido." });
    }

    console.log(`[Culqi Webhook] Evento recibido: ${evento.type}`);

    // ── 3) Filtrar — solo procesamos pagos exitosos ───────────────────────────
    //       CulqiLink puede enviar "charge.creation.succeeded" o "charge.paid"
    const tiposPermitidos = ["charge.paid", "charge.creation.succeeded"];

    if (!tiposPermitidos.includes(evento.type)) {
      console.log(`[Culqi Webhook] Evento ignorado: ${evento.type}`);
      return res.status(200).json({
        mensaje: `Evento ${evento.type} recibido pero no requiere acción.`,
      });
    }

    // ── 4) Extraer datos del cobro ────────────────────────────────────────────
    const charge = evento.data;

    if (!charge || !charge.id) {
      console.error("[Culqi Webhook] Datos del cobro ausentes.");
      return res.status(400).json({ mensaje: "Datos del cobro inválidos." });
    }

    console.log(`[Culqi Webhook] Procesando cobro: ${charge.id}`);

    // ── 5) Extraer metadata enviada desde el frontend ─────────────────────────
    const meta = charge?.metadata || {};

    const espacioId = meta.espacio_id;
    const fecha = meta.fecha;
    const horaInicio = Number(meta.hora_inicio);
    const horaFin = Number(meta.hora_fin);
    const importeTotal = Number(meta.importe_total || 0);
    const pagoInicial = Number(meta.pago_inicial || 0);

    const clienteNombre =
      meta.cliente_nombre || charge?.email?.split("@")[0] || "Cliente Web";
    const clienteCorreo = meta.cliente_correo || charge?.email || "";
    const clienteTelefono = meta.cliente_telefono || "";
    const clienteDni = meta.cliente_dni || "";

    // ── 6) Validar metadata mínima ────────────────────────────────────────────
    //       Fix #3: usar isNaN() en lugar de !horaInicio para no rechazar hora 0
    if (!espacioId || !fecha || isNaN(horaInicio) || isNaN(horaFin)) {
      console.error("[Culqi Webhook] Metadata insuficiente:", meta);
      return res.status(200).json({
        mensaje: "Pago recibido pero metadata incompleta. Revisar manualmente.",
        chargeId: charge.id,
        meta,
      });
    }

    // ── 7) Verificar que el espacio existe ────────────────────────────────────
    const espacio = await Espacio.findOne(
      { _id: espacioId, estado: "disponible", habilitado_reservas: true },
      "_id nombre tipo"
    ).lean();

    if (!espacio) {
      console.error(`[Culqi Webhook] Espacio no encontrado: ${espacioId}`);
      return res.status(200).json({
        mensaje:
          "Pago recibido pero espacio no encontrado. Revisar manualmente.",
        chargeId: charge.id,
      });
    }

    // ── 8) Construir fechas UTC desde hora local Lima (UTC-5) ─────────────────
    //       Lima es UTC-5 → sumamos +5h para convertir a UTC antes de guardar
    //       Ejemplo: reserva 15:00 Lima → se guarda como 20:00 UTC en MongoDB
    const [anio, mes, dia] = fecha.split("-").map(Number);
    const inicio = new Date(
      Date.UTC(anio, mes - 1, dia, horaInicio + 5, 0, 0, 0)
    );
    const fin = new Date(Date.UTC(anio, mes - 1, dia, horaFin + 5, 0, 0, 0));

    // ── 9) Idempotencia PRIMERO ───────────────────────────────────────────────
    //       Fix #2: verificar duplicado ANTES que solapamiento.
    //       Si Culqi reintenta el webhook por timeout, detectamos la reserva
    //       ya creada y devolvemos 200 sin generar falsa alarma de "reembolso".
    const reservaDuplicada = await Reserva.findOne({
      observaciones: { $regex: charge.id, $options: "i" },
    });

    if (reservaDuplicada) {
      console.log(
        `[Culqi Webhook] Reserva ya existe para charge ${charge.id}. Ignorando reintento.`
      );
      return res.status(200).json({
        mensaje: "Reserva ya fue procesada anteriormente.",
        reservaId: reservaDuplicada._id,
        chargeId: charge.id,
      });
    }

    // ── 10) Anti-solapamiento DESPUÉS ─────────────────────────────────────────
    //        Fix #2: solo llegamos aquí si es un pago genuinamente nuevo.
    //        Protege contra dos clientes que paguen el mismo horario simultáneamente.
    const reservaExistente = await Reserva.findOne({
      espacio: espacioId,
      estado: { $in: ["pendiente", "confirmada"] },
      inicio: { $lt: fin },
      fin: { $gt: inicio },
    });

    if (reservaExistente) {
      console.warn(
        `[Culqi Webhook] Solapamiento detectado con reserva: ${reservaExistente._id}`
      );
      return res.status(200).json({
        mensaje:
          "Pago recibido pero el horario ya está ocupado. Contactar al cliente para reembolso.",
        chargeId: charge.id,
        reservaId: reservaExistente._id,
      });
    }

    // ── 11) Deduplicar o crear el cliente ─────────────────────────────────────
    let cliente = null;

    if (clienteDni?.trim()) {
      cliente = await Cliente.findOne({ dni: clienteDni.trim() });
    }
    if (!cliente && clienteCorreo?.trim()) {
      cliente = await Cliente.findOne({
        correo: clienteCorreo.trim().toLowerCase(),
      });
    }

    if (!cliente) {
      cliente = await Cliente.create({
        nombre: clienteNombre.trim(),
        correo: clienteCorreo?.trim().toLowerCase() || undefined,
        telefono: clienteTelefono?.trim() || "",
        dni: clienteDni?.trim() || undefined,
        rol: "cliente",
        estado: "activo",
        origen_registro: "web",
      });
      console.log(`[Culqi Webhook] Cliente creado: ${cliente._id}`);
    } else {
      console.log(`[Culqi Webhook] Cliente existente: ${cliente._id}`);
    }

    // ── 12) Crear la reserva ──────────────────────────────────────────────────
    //        Fix #1: "usuario" se omite para que el modelo use required condicional.
    //        En reserva.model.js cambiar:
    //        required: function() { return this.tipo !== "web"; }
    const reserva = await Reserva.create({
      // usuario omitido intencionalmente — reserva web no tiene usuario del sistema
      cliente: cliente._id,
      espacio: espacioId,
      inicio,
      fin,
      timezone: "America/Lima",
      descripcion: `Reserva online — ${espacio.nombre}`,
      tipo: "web",
      estado: "confirmada",
      observaciones: `Charge ID: ${charge.id}`,
      detalle: {
        moneda: charge.currency_code || "PEN",
        importe_total: importeTotal,
        pagos: [
          {
            monto_pago: pagoInicial,
            metodo_pago: "culqi",
            observacion_pago: `Pago online 50% — Charge ID: ${charge.id}`,
            registrado_por: null,
            fecha_pago: new Date(),
          },
        ],
        observaciones_generales:
          "Reserva realizada desde el landing web con pago Culqi.",
      },
    });

    console.log(`[Culqi Webhook] Reserva creada: ${reserva._id}`);

    // ── 13) Crear o actualizar DetalleReserva externo ─────────────────────────
    //        Fix #4: usar findOneAndUpdate con upsert en lugar de create.
    //        Si Culqi reintentó y la Reserva ya existía pero el Detalle no,
    //        esto lo crea correctamente sin lanzar error de duplicado.
    await DetalleReserva.findOneAndUpdate(
      { reserva: reserva._id },
      {
        $setOnInsert: {
          reserva: reserva._id,
          moneda: charge.currency_code || "PEN",
          importe_total: importeTotal,
          pagos: [
            {
              monto_pago: pagoInicial,
              metodo_pago: "culqi",
              observacion_pago: `Pago online 50% — Charge ID: ${charge.id}`,
              registrado_por: null,
              fecha_pago: new Date(),
            },
          ],
          observaciones_generales:
            "Reserva realizada desde el landing web con pago Culqi.",
          estado_pago: pagoInicial >= importeTotal ? "completo" : "parcial",
          facturado: false,
        },
      },
      { upsert: true, new: true }
    );

    console.log(
      `[Culqi Webhook] ✅ Proceso completado para charge: ${charge.id}`
    );

    // ── 14) Responder 200 a Culqi ─────────────────────────────────────────────
    //        Crítico: si no respondemos 200, Culqi reintentará el webhook
    return res.status(200).json({
      mensaje: "Reserva creada correctamente.",
      reservaId: reserva._id,
      chargeId: charge.id,
    });
  } catch (error) {
    console.error("[Culqi Webhook] ❌ Error inesperado:", error.message);
    // 500 → Culqi reintentará (útil si fue un error temporal de BD o red)
    return res
      .status(500)
      .json({ mensaje: "Error interno al procesar el webhook." });
  }
};
