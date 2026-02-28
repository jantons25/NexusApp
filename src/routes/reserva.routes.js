import { Router } from "express";
import {
  registrarReserva,
  obtenerReservas,
  obtenerReservaPorId,
  editarReserva,
  cancelarReserva,
  reprogramarReservaController,
  agregarPagoController,
} from "../controllers/reserva.controller.js";
import { authRequired } from "../middlewares/validateToken.js";
const router = Router();

router.get("/reservas", authRequired, obtenerReservas);
router.get("/reservas/:id", authRequired, obtenerReservaPorId);

router.post("/reservas", authRequired, registrarReserva);
router.patch("/reservas/:id", authRequired, editarReserva);
router.patch("/reservas/:id/cancelar", authRequired, cancelarReserva);
router.patch("/reservas/:id/reprogramar", authRequired, reprogramarReservaController);
router.patch("/reservas/:id/pago", authRequired, agregarPagoController);

export default router;
