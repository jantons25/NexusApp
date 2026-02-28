import Reserva from "../models/reserva.model.js";
import Cliente from "../models/cliente.model.js";
import DetalleReserva from "../models/detalle_reserva.js";
import Espacio from "../models/espacio.model.js";
import { Types } from "mongoose";

export const crearReserva = async (data) => {
  try {
    // 1) Validaciones base
    if (!data.inicio || !data.fin)
      throw new Error("inicio y fin son obligatorios.");

    const inicio = new Date(data.inicio);
    const fin = new Date(data.fin);

    if (isNaN(inicio) || isNaN(fin)) throw new Error("inicio/fin inválidos.");
    if (fin <= inicio) throw new Error("fin debe ser mayor que inicio.");

    // 2) Anti-solapamiento
    const reservaExistente = await Reserva.findOne({
      espacio: data.espacio,
      estado: { $in: ["pendiente", "confirmada"] },
      inicio: { $lt: fin },
      fin: { $gt: inicio },
    });

    if (reservaExistente) {
      throw new Error(
        "Ya existe una reserva en ese horario para este espacio."
      );
    }

    // 3) Cliente (objeto esperado)
    const clienteData = data.cliente; // { nombre, correo, dni, telefono }

    if (!clienteData?.nombre?.trim()) {
      throw new Error("El nombre del cliente es obligatorio.");
    }

    // Deduplicación por DNI o correo
    let cliente = null;

    if (clienteData.dni?.trim()) {
      cliente = await Cliente.findOne({ dni: clienteData.dni.trim() });
    } else if (clienteData.correo?.trim()) {
      cliente = await Cliente.findOne({
        correo: clienteData.correo.trim().toLowerCase(),
      });
    }

    if (!cliente) {
      cliente = await Cliente.create({
        nombre: clienteData.nombre.trim(),
        correo: clienteData.correo?.trim().toLowerCase() || undefined,
        telefono: clienteData.telefono?.trim() || "",
        dni: clienteData.dni?.trim() || undefined,
        rol: "cliente",
        estado: "activo",
        origen_registro: "interno",
      });
    }

    // 4) Pagos (embebidos dentro de la reserva)
    const importe_total = Number(data.importe_total || 0);
    const pago_inicial = Number(data.pago_inicial || 0);

    if (importe_total < 0)
      throw new Error("importe_total no puede ser negativo.");
    if (pago_inicial < 0)
      throw new Error("pago_inicial no puede ser negativo.");
    if (pago_inicial > importe_total) {
      throw new Error("pago_inicial no puede ser mayor que el importe_total.");
    }

    const pagos = [];
    if (pago_inicial > 0) {
      pagos.push({
        monto_pago: pago_inicial,
        metodo_pago: data.metodo_pago || "efectivo",
        observacion_pago: data.observacion_pago || "",
        registrado_por: data.usuario || null,
      });
    }

    // 5) Crear reserva + detalle embebido (UNA sola escritura)
    const reserva = await Reserva.create({
      usuario: data.usuario,
      cliente: cliente._id,
      espacio: data.espacio,
      inicio,
      fin,
      descripcion: data.descripcion || "",
      tipo: data.tipo || "interna",
      estado: data.estado || "pendiente",
      observaciones: data.observaciones || "",

      // ✅ Detalle embebido
      detalle: {
        moneda: data.moneda || "PEN",
        importe_total,
        pagos,
        observaciones_generales: data.observaciones_generales || "",
      },
    });

    // 6) Obtener la reserva con populate para devolver objetos completos
    const reservaConPopulate = await Reserva.findById(reserva._id)
      .populate("cliente", "nombre correo telefono dni estado")
      .populate(
        "espacio",
        "nombre tipo capacidad descripcion precio_por_hora sede piso habilitado_reservas estado"
      )
      .populate("usuario", "nombre correo")
      .lean();

    // 7) Crear también el DetalleReserva (si usas modelo separado)
    // Pero como tienes detalle embebido en Reserva, solo devuelves ese
    const detalle = {
      moneda: data.moneda || "PEN",
      importe_total,
      pagos,
      observaciones_generales: data.observaciones_generales || "",
      total_pagado: pago_inicial,
      saldo_pendiente: importe_total - pago_inicial,
      estado_pago:
        pago_inicial >= importe_total
          ? "completo"
          : pago_inicial > 0
          ? "parcial"
          : "pendiente",
      facturado: false,
    };

    return {
      mensaje: "Reserva creada correctamente.",
      reserva: reservaConPopulate, // ← Con objetos populados
      detalle: detalle,
    };
  } catch (error) {
    throw new Error(`Error al crear reserva: ${error.message}`);
  }
};

export const actualizarReserva = async (id, data) => {
  try {
    // 1) Buscar la reserva actual
    const reservaActual = await Reserva.findById(id, null);
    if (!reservaActual) throw new Error("Reserva no encontrada.");

    // Si está cancelada/finalizada, normalmente bloqueas edición (ajusta a tu negocio)
    if (["cancelada", "finalizada"].includes(reservaActual.estado)) {
      throw new Error(
        "No se puede actualizar una reserva cancelada o finalizada."
      );
    }

    // 2) Resolver valores nuevos (fallback a lo actual si no viene)
    const espacio = data.espacio || reservaActual.espacio;
    const inicio = data.inicio ? new Date(data.inicio) : reservaActual.inicio;
    const fin = data.fin ? new Date(data.fin) : reservaActual.fin;

    if (!inicio || !fin || isNaN(inicio) || isNaN(fin)) {
      throw new Error("inicio/fin inválidos.");
    }
    if (fin <= inicio) {
      throw new Error("fin debe ser mayor que inicio.");
    }

    // 3) Anti-solapamiento (pendiente/confirmada bloquean)
    const reservaSolapada = await Reserva.findOne(
      {
        _id: { $ne: id },
        espacio,
        estado: { $in: ["pendiente", "confirmada"] },
        inicio: { $lt: fin },
        fin: { $gt: inicio },
      },
      null
    );

    if (reservaSolapada) {
      throw new Error(
        "Ya existe una reserva en ese horario para este espacio."
      );
    }

    // 4) Cliente: idealmente data.cliente es objeto (no array)
    let clienteId = reservaActual.cliente;

    if (data.cliente) {
      const c = data.cliente;

      if (!c?.nombre?.trim()) {
        throw new Error(
          "El nombre del cliente es obligatorio para actualizar la reserva."
        );
      }

      // Prioriza deduplicación por dni/correo si existen
      let cliente = null;

      if (c.dni?.trim()) {
        cliente = await Cliente.findOne({ dni: c.dni.trim() }, null);
      } else if (c.correo?.trim()) {
        cliente = await Cliente.findOne(
          { correo: c.correo.trim().toLowerCase() },
          null
        );
      }

      if (!cliente) {
        // Crear cliente nuevo
        const creado = await Cliente.create([
          {
            nombre: c.nombre.trim(),
            correo: c.correo?.trim().toLowerCase() || undefined, // <- importante, no ""
            telefono: c.telefono?.trim() || "",
            dni: c.dni?.trim() || undefined,
            rol: "cliente",
            estado: "activo",
            origen_registro: data.tipo === "web" ? "web" : "interno",
          },
        ]);
        cliente = creado[0];
      } else {
        // Si deseas, puedes actualizar datos básicos del cliente existente
        // (solo si vienen y no están vacíos)
        const patch = {};
        if (c.nombre?.trim()) patch.nombre = c.nombre.trim();
        if (c.telefono?.trim()) patch.telefono = c.telefono.trim();
        if (c.correo?.trim()) patch.correo = c.correo.trim().toLowerCase();
        if (c.dni?.trim()) patch.dni = c.dni.trim();

        if (Object.keys(patch).length) {
          await Cliente.updateOne({ _id: cliente._id }, { $set: patch });
        }
      }

      clienteId = cliente._id;
    }

    // 5) Actualizar Reserva (solo campos permitidos)
    const updateReserva = {
      usuario: data.usuario ?? reservaActual.usuario,
      cliente: clienteId,
      espacio,
      inicio,
      fin,
      descripcion: data.descripcion ?? reservaActual.descripcion ?? "",
      tipo: data.tipo ?? reservaActual.tipo ?? "interna",
      estado: data.estado ?? reservaActual.estado ?? "pendiente",
      observaciones: data.observaciones ?? reservaActual.observaciones ?? "",
    };

    // Si el estado pasa a "cancelada", captura auditoría (si lo deseas)
    if (
      updateReserva.estado === "cancelada" &&
      reservaActual.estado !== "cancelada"
    ) {
      updateReserva.cancelado_por = data.usuario || null;
      updateReserva.fecha_cancelacion = new Date();
      updateReserva.motivo_cancelacion = data.motivo_cancelacion?.trim() || "";
    }

    const reservaActualizada = await Reserva.findByIdAndUpdate(
      id,
      updateReserva,
      { new: true, runValidators: true }
    );

    if (!reservaActualizada) throw new Error("Error al actualizar la reserva.");

    // 6) Actualizar DetalleReserva (1-1)
    // Si no existe, lo creamos (por seguridad)
    let detalle = await DetalleReserva.findOne({ reserva: id }, null);

    // data.detalle es recomendado para separar concern
    const d = data.detalle || {};

    if (!detalle) {
      // Si viene pago_actualizado pero no hay detalle, convertirlo a nuevo_pago
      const pagoInicial = d.pago_actualizado || d.nuevo_pago;
      const pagosIniciales =
        pagoInicial && Number(pagoInicial.monto_pago) > 0
          ? [
              {
                monto_pago: Number(pagoInicial.monto_pago),
                metodo_pago: pagoInicial.metodo_pago || "efectivo",
                observacion_pago: pagoInicial.observacion_pago || "",
                registrado_por: data.usuario || null,
                fecha_pago: new Date(),
              },
            ]
          : [];

      const creado = await DetalleReserva.create([
        {
          reserva: id,
          moneda: d.moneda || "PEN",
          importe_total: Number(d.importe_total || 0),
          pagos: pagosIniciales, // ← incluir el pago desde el inicio
          observaciones_generales: d.observaciones_generales || "",
        },
      ]);
      detalle = creado[0];
    } else {
      // actualizar campos base del detalle
      const patchDetalle = {};
      if (d.moneda) patchDetalle.moneda = d.moneda;
      if (d.importe_total !== undefined)
        patchDetalle.importe_total = Number(d.importe_total || 0);
      if (d.observaciones_generales !== undefined) {
        patchDetalle.observaciones_generales = d.observaciones_generales || "";
      }

      if (Object.keys(patchDetalle).length) {
        await DetalleReserva.updateOne(
          { _id: detalle._id },
          { $set: patchDetalle }
        );
      }
    }

    // 6.1) Manejar pagos
    if (d.nuevo_pago && Number(d.nuevo_pago.monto_pago) > 0) {
      // ─── CASO A: Agregar pago nuevo ───
      const nuevoPago = {
        monto_pago: Number(d.nuevo_pago.monto_pago),
        metodo_pago: d.nuevo_pago.metodo_pago || "efectivo",
        observacion_pago: d.nuevo_pago.observacion_pago || "",
        referencia: d.nuevo_pago.referencia || "",
        comprobante_url: d.nuevo_pago.comprobante_url || "",
        registrado_por: data.usuario || null,
        fecha_pago: d.nuevo_pago.fecha_pago
          ? new Date(d.nuevo_pago.fecha_pago)
          : new Date(),
      };

      // Actualizar DetalleReserva externo
      await DetalleReserva.updateOne(
        { _id: detalle._id },
        { $push: { pagos: nuevoPago } }
      );

      // ✅ NUEVO: Sincronizar también en el detalle embebido de Reserva
      await Reserva.updateOne(
        { _id: id },
        { $push: { "detalle.pagos": nuevoPago } }
      );
    } else if (d.pago_actualizado) {
      // ─── CASO B: Actualizar pago existente ───
      const pa = d.pago_actualizado;
      const pagoId =
        pa._id && Types.ObjectId.isValid(pa._id)
          ? new Types.ObjectId(pa._id)
          : null;
      const monto = Number(pa.monto_pago);

      if (pagoId) {
        // ✅ NUEVO: Actualizar en DetalleReserva externo por _id del pago (más seguro que pagos.0)
        await DetalleReserva.updateOne(
          { _id: detalle._id, "pagos._id": pagoId },
          {
            $set: {
              "pagos.$.monto_pago": monto,
              "pagos.$.metodo_pago": pa.metodo_pago || "efectivo",
              "pagos.$.observacion_pago": pa.observacion_pago || "",
              "pagos.$.registrado_por": data.usuario || null,
              "pagos.$.fecha_pago": new Date(),
            },
          }
        );

        // ✅ NUEVO: Sincronizar en el detalle embebido de Reserva por _id del pago
        await Reserva.updateOne(
          { _id: id, "detalle.pagos._id": pagoId },
          {
            $set: {
              "detalle.pagos.$.monto_pago": monto,
              "detalle.pagos.$.metodo_pago": pa.metodo_pago || "efectivo",
              "detalle.pagos.$.observacion_pago": pa.observacion_pago || "",
              "detalle.pagos.$.registrado_por": data.usuario || null,
              "detalle.pagos.$.fecha_pago": new Date(),
            },
          }
        );
      } else {
        // Fallback sin _id → usar posición 0 (comportamiento anterior)
        await DetalleReserva.updateOne(
          { _id: detalle._id, "pagos.0": { $exists: true } },
          {
            $set: {
              "pagos.0.monto_pago": monto,
              "pagos.0.metodo_pago": pa.metodo_pago || "efectivo",
              "pagos.0.observacion_pago": pa.observacion_pago || "",
              "pagos.0.registrado_por": data.usuario || null,
              "pagos.0.fecha_pago": new Date(),
            },
          }
        );

        // ✅ NUEVO: Sincronizar fallback en embebido
        await Reserva.updateOne(
          { _id: id, "detalle.pagos.0": { $exists: true } },
          {
            $set: {
              "detalle.pagos.0.monto_pago": monto,
              "detalle.pagos.0.metodo_pago": pa.metodo_pago || "efectivo",
              "detalle.pagos.0.observacion_pago": pa.observacion_pago || "",
              "detalle.pagos.0.registrado_por": data.usuario || null,
              "detalle.pagos.0.fecha_pago": new Date(),
            },
          }
        );
      }
    }

    // ✅ NUEVO - 6.2) Sincronizar importe_total y otros campos en el detalle embebido
    if (d.importe_total !== undefined) {
      await Reserva.updateOne(
        { _id: id },
        {
          $set: {
            "detalle.importe_total": Number(d.importe_total || 0),
            "detalle.moneda": d.moneda || "PEN",
            "detalle.observaciones_generales": d.observaciones_generales || "",
          },
        }
      );
    }

    // 6.3) Releer detalle actualizado y forzar recálculo de virtuals
    let detalleActualizado = await DetalleReserva.findOne(
      { reserva: id },
      null
    );
    if (!detalleActualizado)
      throw new Error("No se pudo obtener el detalle actualizado.");

    try {
      await detalleActualizado.save();
    } catch (saveError) {
      throw new Error(`Error al recalcular detalle: ${saveError.message}`);
    } // dispara hooks pre('save') para recalcular total_pagado/saldo_pendiente
    // ✅ NUEVO - 6.4) Releer reserva con populate completo
    const reservaFinal = await Reserva.findById(id)
      .populate("cliente", "nombre correo telefono dni estado")
      .populate(
        "espacio",
        "nombre tipo capacidad descripcion precio_por_hora sede piso habilitado_reservas estado"
      )
      .populate("usuario", "nombre correo")
      .lean();
    if (!reservaFinal)
      throw new Error("No se pudo releer la reserva actualizada.");
    return {
      mensaje: "Reserva actualizada correctamente.",
      reserva: reservaFinal, // ✅ CAMBIO: reservaFinal en lugar de reservaActualizada
      detalle: detalleActualizado,
    };
  } catch (error) {
    throw new Error(`Error al actualizar reserva: ${error.message}`);
  }
};

// ✅ NUEVO: Finalizar automáticamente reservas cuyo tiempo ya venció
export const finalizarReservasVencidas = async () => {
  try {
    const ahora = new Date();

    const resultado = await Reserva.updateMany(
      {
        fin: { $lt: ahora },
        estado: { $in: ["pendiente", "confirmada"] },
      },
      {
        $set: { estado: "finalizada" },
      }
    );

    return { finalizadas: resultado.modifiedCount };
  } catch (error) {
    throw new Error(`Error al finalizar reservas vencidas: ${error.message}`);
  }
};

export const getReservas = async (opts = {}) => {
  try {
    // ✅ NUEVO: Sincronizar estados antes de responder
    await finalizarReservasVencidas();
    const {
      filtros = {},
      page = 1,
      limit = 50,
      sort = { inicio: -1 }, // más útil que fecha_reserva
    } = opts;

    const query = {};

    // ✅ Filtros por rango de fechas usando inicio/fin (modelo nuevo)
    if (filtros.desde || filtros.hasta) {
      query.inicio = {};
      if (filtros.desde) query.inicio.$gte = new Date(filtros.desde);
      if (filtros.hasta) query.inicio.$lte = new Date(filtros.hasta);
    }

    // ✅ Filtros típicos
    if (filtros.estado) query.estado = filtros.estado;
    if (filtros.tipo) query.tipo = filtros.tipo;
    if (filtros.espacio) query.espacio = filtros.espacio;
    if (filtros.cliente) query.cliente = filtros.cliente;

    const skip = (Math.max(page, 1) - 1) * Math.max(limit, 1);

    // 1) Traer reservas paginadas y pobladas
    const [reservas, total] = await Promise.all([
      Reserva.find(query)
        .populate("cliente", "nombre correo telefono dni estado")
        .populate(
          "espacio",
          "nombre tipo capacidad descripcion precio_por_hora sede piso habilitado_reservas estado"
        )
        .populate("usuario", "nombre correo")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(), // más rápido para lecturas
      Reserva.countDocuments(query),
    ]);

    if (!reservas.length) {
      return {
        data: [],
        pagination: { page, limit, total, totalPages: 0 },
      };
    }

    // 2) Traer detalles 1-1 por reserva
    const reservaIds = reservas.map((r) => r._id);
    const detalles = await DetalleReserva.find({ reserva: { $in: reservaIds } })
      .select(
        "reserva moneda importe_total total_pagado saldo_pendiente estado_pago facturado pagos observaciones_generales comprobante"
      )
      .lean();

    // 3) Mapear detalle por reservaId (O(1))
    const detalleByReservaId = new Map(
      detalles.map((d) => [String(d.reserva), d])
    );

    // 4) Unir reserva + detalle
    // 4) Unir reserva + detalle
    const data = reservas.map((reserva) => {
      const detalleExterno = detalleByReservaId.get(String(reserva._id));

      // Si no hay detalle externo, construirlo desde el detalle embebido
      const detalle =
        detalleExterno ??
        (reserva.detalle
          ? {
              moneda: reserva.detalle.moneda,
              importe_total: reserva.detalle.importe_total,
              pagos: reserva.detalle.pagos ?? [],
              observaciones_generales:
                reserva.detalle.observaciones_generales ?? "",
              total_pagado:
                reserva.detalle.pagos?.reduce(
                  (sum, p) => sum + (p.monto_pago || 0),
                  0
                ) ?? 0,
              saldo_pendiente:
                (reserva.detalle.importe_total || 0) -
                (reserva.detalle.pagos?.reduce(
                  (sum, p) => sum + (p.monto_pago || 0),
                  0
                ) ?? 0),
              estado_pago: null,
              facturado: false,
            }
          : null);

      return { reserva, detalle };
    });

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw new Error(`Error al obtener reservas: ${error.message}`);
  }
};

export const getReservaById = async (id) => {
  try {
    // 1) Traer la reserva (con populate)
    const reserva = await Reserva.findById(id)
      .populate("cliente", "nombre correo telefono dni estado")
      .populate(
        "espacio",
        "nombre tipo capacidad descripcion precio_por_hora sede piso habilitado_reservas estado"
      )
      .populate("usuario", "nombre correo")
      .lean();

    if (!reserva) {
      throw new Error("Reserva no encontrada.");
    }

    // 2) Traer el detalle 1-1 asociado
    const detalle = await DetalleReserva.findOne({ reserva: reserva._id })
      .select(
        "reserva moneda importe_total total_pagado saldo_pendiente estado_pago facturado pagos observaciones_generales comprobante createdAt updatedAt"
      )
      .lean();

    // 3) Retornar
    return {
      reserva,
      detalle: detalle || null,
    };
  } catch (error) {
    throw new Error(`Error al obtener reserva por ID: ${error.message}`);
  }
};

//OTROS SERVICIOS

const ESTADOS_NO_REPROGRAMABLES = Object.freeze([
  "cancelada",
  "finalizada",
  "rechazada",
]);

const _parsearFecha = (valor, nombreCampo) => {
  if (!valor && valor !== 0) {
    throw new Error(`El campo '${nombreCampo}' es obligatorio.`);
  }
  const fecha = new Date(valor);
  if (isNaN(fecha.getTime())) {
    throw new Error(
      `'${nombreCampo}' no es una fecha válida. ` +
        `Usa formato ISO 8601, ej: "2025-08-20T10:00:00.000Z". ` +
        `Valor recibido: "${valor}".`
    );
  }
  return fecha;
};

const _formatearParaMensaje = (fecha, timezone = "America/Lima") =>
  new Date(fecha).toLocaleString("es-PE", {
    timeZone: timezone,
    dateStyle: "short",
    timeStyle: "short",
  });

const _poblarReserva = (query) =>
  query
    .populate("cliente", "nombre correo telefono dni estado")
    .populate(
      "espacio",
      "nombre tipo capacidad descripcion precio_por_hora sede piso habilitado_reservas estado"
    )
    .populate("usuario", "nombre correo");

const _calcularImporte = (precioPorHora, inicio, fin) => {
  const horas = (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60);
  return parseFloat((precioPorHora * horas).toFixed(2));
};

export const reprogramarReserva = async (
  reservaId,
  nuevoInicio,
  nuevoFin,
  usuarioId = null
) => {
  try {
    // ─── 1) Parsear y validar fechas ─────────────────────────────────────
    const inicio = _parsearFecha(nuevoInicio, "nuevoInicio");
    const fin = _parsearFecha(nuevoFin, "nuevoFin");

    if (fin <= inicio) {
      throw new Error(
        `'nuevoFin' debe ser mayor que 'nuevoInicio'. ` +
          `Recibido → inicio: "${inicio.toISOString()}", fin: "${fin.toISOString()}".`
      );
    }

    // ─── 2) Buscar la reserva ─────────────────────────────────────────────
    const reserva = await Reserva.findById(reservaId).select(
      "_id estado espacio inicio fin timezone detalle"
    );

    if (!reserva) throw new Error(`Reserva no encontrada. Id: "${reservaId}".`);

    // ─── 3) Verificar estado ──────────────────────────────────────────────
    if (ESTADOS_NO_REPROGRAMABLES.includes(reserva.estado)) {
      throw new Error(
        `No se puede reprogramar una reserva en estado "${reserva.estado}". ` +
          `Solo se permiten los estados: pendiente, confirmada.`
      );
    }

    // ─── 4) Idempotencia ──────────────────────────────────────────────────
    const mismoInicio = reserva.inicio.getTime() === inicio.getTime();
    const mismoFin = reserva.fin.getTime() === fin.getTime();

    if (mismoInicio && mismoFin) {
      const reservaSinCambios = await _poblarReserva(
        Reserva.findById(reservaId)
      ).lean();
      return {
        ok: true,
        cambio: false,
        mensaje:
          "Las fechas indicadas son idénticas a las actuales. No se realizaron cambios.",
        reserva: reservaSinCambios,
        nuevo_importe: reserva.detalle?.importe_total ?? 0,
      };
    }

    // ─── 5) Anti-solapamiento ─────────────────────────────────────────────
    const conflicto = await Reserva.findOne({
      _id: { $ne: reservaId },
      espacio: reserva.espacio,
      estado: { $in: ["pendiente", "confirmada"] },
      inicio: { $lt: fin },
      fin: { $gt: inicio },
    }).select("_id inicio fin estado");

    if (conflicto) {
      const tz = reserva.timezone || "America/Lima";
      throw new Error(
        `El espacio ya tiene una reserva (${conflicto.estado}) ` +
          `entre ${_formatearParaMensaje(conflicto.inicio, tz)} y ` +
          `${_formatearParaMensaje(conflicto.fin, tz)} ` +
          `que se solapa con el nuevo horario. Elige un horario diferente.`
      );
    }

    // ─── 6) Recalcular importe basado en precio_por_hora del espacio ──────
    // Traemos el espacio para obtener precio_por_hora (fuente de verdad).
    // Si el espacio no tiene precio_por_hora definido, usamos el importe
    // actual de la reserva como fallback seguro.
    const espacio = await Espacio.findById(reserva.espacio).select(
      "precio_por_hora tarifas"
    );

    let nuevoImporte = reserva.detalle?.importe_total ?? 0; // fallback

    if (espacio) {
      // Prioridad 1: precio_por_hora (campo principal, igual que el Wizard)
      // Prioridad 2: primera tarifa de tipo "hora" activa (si precio_por_hora es 0)
      const precioPorHora =
        espacio.precio_por_hora ||
        espacio.tarifas?.find((t) => t.tipo === "hora" && t.activo)?.precio ||
        0;

      if (precioPorHora > 0) {
        nuevoImporte = _calcularImporte(precioPorHora, inicio, fin);
      }
    }

    // ─── 7) Actualizar Reserva: fechas + importe_total embebido ──────────
    const reservaActualizada = await _poblarReserva(
      Reserva.findByIdAndUpdate(
        reservaId,
        {
          $set: {
            inicio,
            fin,
            "detalle.importe_total": nuevoImporte,
          },
        },
        { new: true, runValidators: true }
      )
    ).lean();

    if (!reservaActualizada) {
      throw new Error(
        "No se pudo completar la reprogramación: la reserva fue eliminada " +
          "por otra operación simultánea. Vuelve a intentarlo."
      );
    }

    // ─── 8) Sincronizar DetalleReserva externo (si existe) ───────────────
    // El detalle externo es la fuente que usa la lista. Lo actualizamos
    // para mantener consistencia entre ambos documentos.
    await DetalleReserva.updateOne(
      { reserva: reservaId },
      { $set: { importe_total: nuevoImporte } }
    );

    // ─── 9) Retornar ─────────────────────────────────────────────────────
    return {
      ok: true,
      cambio: true,
      mensaje: "Fechas y precio de la reserva reprogramados correctamente.",
      reserva: reservaActualizada,
      nuevo_importe: nuevoImporte,
    };
  } catch (error) {
    throw new Error(`Error al reprogramar reserva: ${error.message}`);
  }
};

const calcularDiasAnticipacion = (fechaInicio) => {
  const hoy = new Date();

  // Normalizar ambas fechas a medianoche para comparar solo días calendario
  const hoyNorm = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const inicioNorm = new Date(
    fechaInicio.getFullYear(),
    fechaInicio.getMonth(),
    fechaInicio.getDate()
  );

  const diffMs = inicioNorm - hoyNorm;
  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return diffDias; // puede ser negativo si ya pasó la fecha
};

const calcularPoliticaDevolucion = (
  diasAnticipacion,
  montoTotalPagado,
  importeTotal
) => {
  // Caso: mismo día o reserva ya iniciada
  if (diasAnticipacion <= 0) {
    return {
      porcentaje: 0,
      motivo:
        "Cancelación el mismo día o posterior al inicio. No corresponde devolución.",
    };
  }

  // Caso: 2 o más días antes → devolución total sin penalidad
  if (diasAnticipacion >= 2) {
    return {
      porcentaje: 100,
      motivo: `Cancelación con ${diasAnticipacion} días de anticipación. Devolución total.`,
    };
  }

  // Caso: exactamente 1 día antes → depende de si el pago fue completo o parcial
  const pagoEsCompleto = importeTotal > 0 && montoTotalPagado >= importeTotal;

  if (pagoEsCompleto) {
    return {
      porcentaje: 25,
      motivo:
        "Cancelación con 1 día de anticipación. Pago completo: se retiene el 75%.",
    };
  } else {
    return {
      porcentaje: 50,
      motivo:
        "Cancelación con 1 día de anticipación. Pago parcial: se retiene el 50%.",
    };
  }
};

export const eliminarReserva = async (id, usuarioId, motivo = "") => {
  try {
    // 1) Buscar reserva
    const reserva = await Reserva.findById(id);
    if (!reserva) throw new Error("Reserva no encontrada.");

    // 2) Validar estado actual
    if (reserva.estado === "cancelada")
      throw new Error("La reserva ya está cancelada.");

    if (reserva.estado === "finalizada")
      throw new Error("No se puede cancelar una reserva finalizada.");

    // 3) Calcular anticipación y política de devolución
    const diasAnticipacion = calcularDiasAnticipacion(reserva.inicio);
    const importeTotal = reserva.detalle?.importe_total || 0;

    // Sumar todos los pagos embebidos
    const pagosEmbebidos = reserva.detalle?.pagos || [];
    const montoTotalPagado = pagosEmbebidos.reduce(
      (sum, p) => sum + (p.monto_pago || 0),
      0
    );

    const politica = calcularPoliticaDevolucion(
      diasAnticipacion,
      montoTotalPagado,
      importeTotal
    );

    // 4) Calcular monto a devolver
    const montoDevolucion =
      montoTotalPagado > 0
        ? parseFloat(
            ((montoTotalPagado * politica.porcentaje) / 100).toFixed(2)
          )
        : 0;

    const montoRetenido = parseFloat(
      (montoTotalPagado - montoDevolucion).toFixed(2)
    );

    // 5) Soft delete: cambiar estado de la reserva
    reserva.estado = "cancelada";
    reserva.cancelado_por = usuarioId || null;
    reserva.fecha_cancelacion = new Date();
    reserva.motivo_cancelacion = motivo?.trim() || "";

    await reserva.save();

    // 6) Actualizar DetalleReserva externo (si existe)
    const detalle = await DetalleReserva.findOne({ reserva: id });

    if (detalle) {
      // Si no hubo ningún pago, simplemente marcar como cancelado
      if (montoTotalPagado <= 0) {
        detalle.estado_pago = "cancelado";
      } else {
        // Hay pagos: registrar la devolución en observaciones y marcar estado
        const notaCancelacion = [
          `[CANCELACIÓN ${new Date().toLocaleDateString("es-PE")}]`,
          `Días de anticipación: ${diasAnticipacion}`,
          politica.motivo,
          `Total pagado: S/${montoTotalPagado.toFixed(2)}`,
          `Monto a devolver: S/${montoDevolucion.toFixed(2)} (${
            politica.porcentaje
          }%)`,
          `Monto retenido: S/${montoRetenido.toFixed(2)}`,
        ].join(" | ");

        detalle.observaciones_generales = detalle.observaciones_generales
          ? `${detalle.observaciones_generales}\n${notaCancelacion}`
          : notaCancelacion;

        // Estado de pago refleja si hay algo pendiente de devolver
        detalle.estado_pago =
          montoDevolucion > 0 ? "devolucion_pendiente" : "cancelado";
      }

      await detalle.save();
    }

    // 7) Retornar resultado con el resumen de la política aplicada
    return {
      mensaje: "Reserva cancelada correctamente.",
      reserva,
      devolucion: {
        dias_anticipacion: diasAnticipacion,
        porcentaje_devolucion: politica.porcentaje,
        monto_total_pagado: montoTotalPagado,
        monto_a_devolver: montoDevolucion,
        monto_retenido: montoRetenido,
        motivo_politica: politica.motivo,
        requiere_devolucion: montoDevolucion > 0,
      },
    };
  } catch (error) {
    throw new Error(`Error al cancelar la reserva: ${error.message}`);
  }
};

export const agregarPagoAReserva = async (id, data) => {
  try {
    // ─────────────────────────────────────────
    // PASO 1: Buscar la reserva en la base de datos
    // ─────────────────────────────────────────
    // Buscamos la reserva por su ID. Si no existe, lanzamos un error
    // inmediatamente para no continuar con el proceso.
    const reserva = await Reserva.findById(id);
    if (!reserva) throw new Error("Reserva no encontrada.");

    // ─────────────────────────────────────────
    // PASO 2: Validar que el estado de la reserva permita pagos
    // ─────────────────────────────────────────
    // No tiene sentido agregar un pago a una reserva cancelada o finalizada.
    // Si el estado es alguno de estos dos, bloqueamos la operación.
    const estadosPermitidos = ["pendiente", "confirmada"];
    if (!estadosPermitidos.includes(reserva.estado)) {
      throw new Error(
        `No se puede agregar un pago a una reserva en estado "${reserva.estado}".`
      );
    }

    // ─────────────────────────────────────────
    // PASO 3: Extraer y validar el monto del nuevo pago
    // ─────────────────────────────────────────
    // Convertimos el monto a número (por si llega como string desde el body).
    // Number("150") → 150  |  Number("abc") → NaN
    const monto = Number(data.monto_pago);

    // isNaN comprueba si el resultado NO es un número válido.
    if (isNaN(monto)) {
      throw new Error("El monto del pago debe ser un número válido.");
    }

    // El monto debe ser estrictamente mayor a cero.
    // No aceptamos pagos de S/ 0.00 ni negativos.
    if (monto <= 0) {
      throw new Error("El monto del pago debe ser mayor a cero.");
    }

    // ─────────────────────────────────────────
    // PASO 4: Calcular cuánto se ha pagado hasta ahora (total acumulado)
    // ─────────────────────────────────────────
    // Usamos reduce() para sumar todos los montos del array de pagos.
    // Si el array está vacío, reduce devuelve el valor inicial: 0.
    //
    // Ejemplo: pagos = [{monto_pago: 100}, {monto_pago: 50}]
    //          totalPagado = 150
    const totalPagado = reserva.detalle.pagos.reduce(
      (acumulado, pago) => acumulado + (pago.monto_pago || 0),
      0
    );

    const importeTotal = reserva.detalle.importe_total || 0;

    // ─────────────────────────────────────────
    // PASO 5: Verificar que no se supere el importe total
    // ─────────────────────────────────────────
    // Si ya se pagó todo o más de lo que se debía, no permitimos más pagos.
    if (totalPagado >= importeTotal) {
      throw new Error(
        `La reserva ya está completamente pagada. Importe total: S/ ${importeTotal.toFixed(
          2
        )}.`
      );
    }

    // Si el nuevo pago hace que se supere el importe total, también lo bloqueamos.
    // Ejemplo: importe_total=500, totalPagado=400, nuevo pago=150 → 400+150=550 > 500 ❌
    const saldoPendiente = importeTotal - totalPagado;
    if (monto > saldoPendiente) {
      throw new Error(
        `El monto del pago (S/ ${monto.toFixed(
          2
        )}) supera el saldo pendiente (S/ ${saldoPendiente.toFixed(2)}).`
      );
    }

    // ─────────────────────────────────────────
    // PASO 6: Validar el método de pago (si viene)
    // ─────────────────────────────────────────
    // Definimos los métodos de pago que acepta el sistema.
    // Si el usuario manda uno que no está en esta lista, lo rechazamos.
    const metodosPermitidos = [
      "efectivo",
      "transferencia",
      "tarjeta",
      "yape",
      "plin",
      "otro",
    ];
    const metodoPago = data.metodo_pago?.trim().toLowerCase() || "efectivo";

    if (!metodosPermitidos.includes(metodoPago)) {
      throw new Error(
        `Método de pago inválido. Los métodos permitidos son: ${metodosPermitidos.join(
          ", "
        )}.`
      );
    }

    // ─────────────────────────────────────────
    // PASO 7: Construir el objeto del nuevo pago
    // ─────────────────────────────────────────
    // Armamos el objeto con la misma estructura que define el pagoSchema
    // en el modelo. Usamos valores por defecto si no vienen en data.
    const nuevoPago = {
      monto_pago: monto,
      metodo_pago: metodoPago,
      observacion_pago: data.observacion_pago?.trim() || "",
      registrado_por: data.usuario || null,
      fecha_pago: data.fecha_pago ? new Date(data.fecha_pago) : new Date(),
    };

    // ─────────────────────────────────────────
    // PASO 8: Persistir el nuevo pago en la base de datos
    // ─────────────────────────────────────────
    // Usamos $push para agregar el nuevo pago al array detalle.pagos
    // sin tener que traer, modificar y guardar el documento completo.
    // Es más eficiente y seguro ante escrituras concurrentes.
    await Reserva.updateOne(
      { _id: id },
      { $push: { "detalle.pagos": nuevoPago } }
    );

    // ─────────────────────────────────────────
    // PASO 9: Sincronizar también en DetalleReserva (modelo externo)
    // ─────────────────────────────────────────
    // Tu sistema mantiene dos fuentes de pagos en paralelo:
    // el detalle embebido dentro de Reserva y el modelo DetalleReserva separado.
    // Actualizamos ambos para mantenerlos consistentes.
    const detalleExterno = await DetalleReserva.findOne({ reserva: id });
    if (detalleExterno) {
      await DetalleReserva.updateOne(
        { _id: detalleExterno._id },
        { $push: { pagos: nuevoPago } }
      );
    }

    // ─────────────────────────────────────────
    // PASO 10: Releer la reserva actualizada con datos relacionados
    // ─────────────────────────────────────────
    // Después de guardar, traemos la reserva completa con populate
    // para devolver al frontend los objetos completos (cliente, espacio, etc.)
    // en lugar de solo los IDs de MongoDB.
    const reservaActualizada = await Reserva.findById(id)
      .populate("cliente", "nombre correo telefono dni estado")
      .populate(
        "espacio",
        "nombre tipo capacidad descripcion precio_por_hora sede piso habilitado_reservas estado"
      )
      .populate("usuario", "nombre correo")
      .lean();

    // ─────────────────────────────────────────
    // PASO 11: Calcular los valores financieros finales para el response
    // ─────────────────────────────────────────
    // Recalculamos con los pagos ya actualizados (incluyendo el nuevo).
    const nuevoTotalPagado = reservaActualizada.detalle.pagos.reduce(
      (acc, p) => acc + (p.monto_pago || 0),
      0
    );
    const nuevoSaldo = importeTotal - nuevoTotalPagado;

    // Determinamos el estado_pago según los montos:
    // - "completo"  → ya se pagó todo el importe
    // - "parcial"   → se pagó algo pero falta
    // - "pendiente" → no se ha pagado nada
    const estadoPago =
      nuevoTotalPagado >= importeTotal
        ? "completo"
        : nuevoTotalPagado > 0
        ? "parcial"
        : "pendiente";

    // ─────────────────────────────────────────
    // PASO 12: Retornar la respuesta estructurada
    // ─────────────────────────────────────────
    return {
      mensaje: "Pago agregado correctamente.",
      reserva: reservaActualizada,
      resumen_pago: {
        importe_total: importeTotal,
        total_pagado: nuevoTotalPagado,
        saldo_pendiente: nuevoSaldo,
        estado_pago: estadoPago,
        cantidad_pagos: reservaActualizada.detalle.pagos.length,
      },
    };
  } catch (error) {
    throw new Error(`Error al agregar pago: ${error.message}`);
  }
};

export const getEspaciosPublicos = async (filtros = {}) => {
  try {
    // 1) Construir query base: solo espacios activos y habilitados
    const query = {
      estado: "disponible",
      habilitado_reservas: true,
    };

    // 2) Filtros opcionales
    if (filtros.tipo) query.tipo = filtros.tipo;

    // sede puede ser ObjectId como string → Mongoose lo castea solo
    if (filtros.sede) query.sede = filtros.sede;

    // 3) Campos a exponer públicamente (nada de datos de gestión interna)
    const proyeccion = [
      "nombre",
      "tipo",
      "capacidad",
      "descripcion",
      "precio_por_hora",
      "piso",
      "servicios",
      "fotos",
      "estado",
      "sede",
    ].join(" ");

    // 4) Consulta ordenada por nombre para consistencia en el listado
    const espacios = await Espacio.find(query)
      .select(proyeccion)
      .populate("sede", "nombre direccion") // muestra nombre/dirección de sede si aplica
      .sort({ nombre: 1 })
      .lean();

    return {
      data: espacios,
      total: espacios.length,
    };
  } catch (error) {
    throw new Error(`Error al obtener espacios públicos: ${error.message}`);
  }
};

export const getHorasOcupadas = async (espacioId, fecha) => {
  try {
    // 1) Validar que el espacio exista y esté activo
    const espacio = await Espacio.findOne(
      { _id: espacioId, estado: "disponible" },
      "_id nombre"
    ).lean();

    if (!espacio) {
      throw new Error("Espacio no encontrado o inactivo.");
    }

    // 2) Construir rango del día completo en UTC
    //    Lima es UTC-5, así que 00:00 Lima = 05:00 UTC del mismo día
    //    y 23:59 Lima = 04:59 UTC del día siguiente.
    //    Usamos el rango más amplio posible (00:00 – 23:59:59 UTC)
    //    para no perder reservas que crucen la medianoche UTC.
    const inicioDia = new Date(`${fecha}T00:00:00.000Z`);
    const finDia = new Date(`${fecha}T23:59:59.999Z`);

    // 3) Buscar reservas activas que se solapen con ese día
    //    Solapamiento: inicio de la reserva < fin del día  AND  fin de la reserva > inicio del día
    const reservasDia = await Reserva.find(
      {
        espacio: espacioId,
        estado: { $in: ["pendiente", "confirmada"] },
        inicio: { $lt: finDia },
        fin: { $gt: inicioDia },
      },
      "inicio fin estado" // solo los campos necesarios
    ).lean();

    // 4) Calcular horas ocupadas y franjas legibles
    const horasSet = new Set();
    const franjas = [];

    const OFFSET_LIMA = -5; // UTC-5

    reservasDia.forEach((reserva) => {
      // Convertir a hora local de Lima sumando el offset
      const inicioLocal = new Date(
        reserva.inicio.getTime() + OFFSET_LIMA * 60 * 60 * 1000
      );
      const finLocal = new Date(
        reserva.fin.getTime() + OFFSET_LIMA * 60 * 60 * 1000
      );

      // Hora entera de inicio (truncar minutos)
      const horaInicio = inicioLocal.getUTCHours();

      // Hora entera de fin — si termina justo en punto (00 min) la hora no se bloquea
      const minFin = finLocal.getUTCMinutes();
      const horaFin =
        minFin === 0
          ? finLocal.getUTCHours() - 1 // 11:00 exacto → bloquea hasta la hora 10
          : finLocal.getUTCHours();     // 11:30 → bloquea la hora 11 también

      // Marcar todas las horas enteras dentro del rango
      for (let h = horaInicio; h <= horaFin; h++) {
        horasSet.add(h);
      }

      // Franja legible para el tooltip del timeline
      const pad = (n) => String(n).padStart(2, "0");
      franjas.push({
        inicio: `${pad(horaInicio)}:${pad(inicioLocal.getUTCMinutes())}`,
        fin: `${pad(finLocal.getUTCHours())}:${pad(minFin)}`,
        estado: reserva.estado,
      });
    });

    // 5) Ordenar horas de menor a mayor para facilitar el render en el frontend
    const horasOcupadas = Array.from(horasSet).sort((a, b) => a - b);

    return {
      espacioId,
      fecha,
      horasOcupadas,
      franjas,
    };
  } catch (error) {
    throw new Error(`Error al obtener disponibilidad: ${error.message}`);
  }
};