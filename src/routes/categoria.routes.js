import { Router } from "express";
import {
  registrarCategoria,
  obtenerCategorias,
  obtenerCategoriaPorId,
  eliminarCategoria,
} from "../controllers/categoria.controller.js";
import { authRequired } from "../middlewares/validateToken.js";

const router = Router();

router.get("/categorias", authRequired, obtenerCategorias);
router.get("/categorias/:id", authRequired, obtenerCategoriaPorId);
router.post("/categorias", authRequired, registrarCategoria);
router.delete("/categorias/:id", authRequired, eliminarCategoria);

export default router;
