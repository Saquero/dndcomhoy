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

/**
 * @swagger
 * /restaurantes:
 *   get:
 *     summary: Obtener todos los restaurantes
 *     tags: [Restaurantes]
 *     responses:
 *       200:
 *         description: Lista de restaurantes
 */
router.get("/", restauranteController.obtenerRestaurantes);

/**
 * @swagger
 * /restaurantes:
 *   post:
 *     summary: Crear un nuevo restaurante (requiere autenticación)
 *     tags: [Restaurantes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - direccion
 *               - ciudad
 *               - provincia
 *               - localidad
 *               - descripcion
 *             properties:
 *               nombre:
 *                 type: string
 *               direccion:
 *                 type: string
 *               ciudad:
 *                 type: string
 *               provincia:
 *                 type: string
 *               localidad:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               imagenes:
 *                 type: array
 *                 items:
 *                   type: string
 *               activo:
 *                 type: boolean
 *               verificado:
 *                 type: boolean
 *               zonaAmplia:
 *                 type: boolean
 *               parqueCercano:
 *                 type: boolean
 *               zonaInfantil:
 *                 type: boolean
 *               menuInfantil:
 *                 type: boolean
 *               tronaDisponible:
 *                 type: boolean
 *               cambiadorDisponible:
 *                 type: boolean
 *               sitioParaCarrito:
 *                 type: boolean
 *               terrazaSegura:
 *                 type: boolean
 *               ambienteFamiliar:
 *                 type: boolean
 *               sinPantallas:
 *                 type: boolean
 *               aptoVegetariano:
 *                 type: boolean
 *               aptoVegano:
 *                 type: boolean
 *               actividadesParaNinos:
 *                 type: boolean
 *               accesibleConCarrito:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Restaurante creado correctamente
 */
router.post(
  "/",
  authMiddleware,
  validarRestaurante,
  restauranteController.crearRestaurante
);

/**
 * @swagger
 * /restaurantes/{id}:
 *   put:
 *     summary: Actualizar un restaurante por ID (requiere autenticación)
 *     tags: [Restaurantes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del restaurante a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               activo:
 *                 type: boolean
 *               verificado:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Restaurante actualizado correctamente
 *       404:
 *         description: Restaurante no encontrado
 */
router.put(
  "/:id",
  authMiddleware,
  validarRestaurante,
  restauranteController.actualizarRestaurante
);

/**
 * @swagger
 * /restaurantes/{id}:
 *   delete:
 *     summary: Eliminar un restaurante por ID (requiere autenticación)
 *     tags: [Restaurantes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del restaurante a eliminar
 *     responses:
 *       200:
 *         description: Restaurante eliminado correctamente
 *       404:
 *         description: Restaurante no encontrado
 */
router.delete(
  "/:id",
  authMiddleware,
  restauranteController.eliminarRestaurante
);

module.exports = router;
