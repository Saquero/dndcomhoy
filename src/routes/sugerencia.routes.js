const express = require("express");
const router = express.Router();
const sugerenciaController = require("../controllers/sugerencia.controller");
const validarSugerencia = require("../middlewares/validarSugerencia");
const authMiddleware = require("../middlewares/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: Sugerencias
 *   description: Gestión de sugerencias
 */

/**
 * @swagger
 * /sugerencias:
 *   get:
 *     summary: Obtener todas las sugerencias (solo admin)
 *     tags: [Sugerencias]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de sugerencias
 */
router.get("/", authMiddleware, sugerenciaController.obtenerSugerencias);

/**
 * @swagger
 * /sugerencias/{id}:
 *   get:
 *     summary: Obtener una sugerencia por ID
 *     tags: [Sugerencias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalles de la sugerencia
 *       404:
 *         description: Sugerencia no encontrada
 */
router.get("/:id", authMiddleware, sugerenciaController.obtenerSugerenciaPorId);

/**
 * @swagger
 * /sugerencias:
 *   post:
 *     summary: Crear una nueva sugerencia (público)
 *     tags: [Sugerencias]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SugerenciaInput'
 *     responses:
 *       201:
 *         description: Sugerencia creada
 *       400:
 *         description: Datos inválidos
 */
router.post("/", validarSugerencia, sugerenciaController.crearSugerencia);

/**
 * @swagger
 * /sugerencias/{id}:
 *   put:
 *     summary: Actualizar una sugerencia (solo admin)
 *     tags: [Sugerencias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SugerenciaInput'
 *     responses:
 *       200:
 *         description: Sugerencia actualizada
 *       404:
 *         description: No encontrada
 */
router.put(
  "/:id",
  authMiddleware,
  validarSugerencia,
  sugerenciaController.actualizarSugerencia
);

/**
 * @swagger
 * /sugerencias/{id}/aprobar:
 *   post:
 *     summary: Aprobar sugerencia (crear restaurante y eliminar sugerencia)
 *     tags: [Sugerencias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Sugerencia aprobada y restaurante creado
 *       404:
 *         description: Sugerencia no encontrada
 */
router.post(
  "/:id/aprobar",
  authMiddleware,
  sugerenciaController.aprobarSugerencia
);

/**
 * @swagger
 * /sugerencias/{id}:
 *   delete:
 *     summary: Eliminar sugerencia (rechazo)
 *     tags: [Sugerencias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Sugerencia eliminada
 *       404:
 *         description: No encontrada
 */
router.delete("/:id", authMiddleware, sugerenciaController.eliminarSugerencia);

module.exports = router;
