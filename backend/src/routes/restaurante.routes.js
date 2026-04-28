// src/routes/restaurante.routes.js
const express = require("express");
const router = express.Router();
const restauranteController = require("../controllers/restaurante.controller");
const validarRestaurante = require("../middlewares/validarRestaurante");
const authMiddleware = require("../middlewares/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: Restaurantes
 *   description: Endpoints para gestionar restaurantes
 */

// Lista publica
router.get("/", restauranteController.obtenerRestaurantes);

// Detalle por id â€” PUBLICO (sin auth)
router.get("/:id", restauranteController.obtenerRestaurantePorId);

// Favorito â€” PUBLICO (incrementa contador)
router.post("/:id/favorito", restauranteController.incrementarFavorito);

// Crear (admin)
router.post(
  "/",
  authMiddleware,
  validarRestaurante,
  restauranteController.crearRestaurante
);

// Actualizar (admin)
router.put(
  "/:id",
  authMiddleware,
  validarRestaurante,
  restauranteController.actualizarRestaurante
);

// Eliminar (admin)
router.delete(
  "/:id",
  authMiddleware,
  restauranteController.eliminarRestaurante
);

// Re-geocodificar (admin)
router.post(
  "/:id/regeocode",
  authMiddleware,
  restauranteController.regeocodificar
);

module.exports = router;
