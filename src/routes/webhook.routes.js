import { Router } from "express";
import { culqiWebhook } from "../controllers/webhook.controller.js";

const router = Router();

/**
 * POST /api/webhooks/culqi
 *
 * Endpoint público — Culqi lo llama directamente, no pasa por authRequired.
 * IMPORTANTE: esta ruta debe registrarse ANTES de cualquier middleware
 * que parsee el body como JSON, o usar express.raw() si quieres verificar
 * la firma del webhook (recomendado en producción).
 */
router.post("/culqi", culqiWebhook);

export default router;