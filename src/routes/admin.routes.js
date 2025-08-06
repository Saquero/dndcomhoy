const express = require("express");
const router = express.Router();

const {
  login,
  register,
  obtenerAdmins,
  obtenerAdminPorId,
  actualizarAdmin,
  eliminarAdmin,
} = require("../controllers/admin.controller");

const authMiddleware = require("../middlewares/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: Admins
 *   description: Gestión de administradores
 */

/**
 * @swagger
 * /admin/login:
 *   post:
 *     summary: Iniciar sesión como administrador
 *     tags: [Admins]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sesión iniciada correctamente
 *       401:
 *         description: Credenciales inválidas
 */
router.post("/login", login);

/**
 * @swagger
 * /admin/register:
 *   post:
 *     summary: Registrar un nuevo administrador
 *     tags: [Admins]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - email
 *               - password
 *             properties:
 *               nombre:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Administrador registrado correctamente
 *       400:
 *         description: Datos inválidos
 */
router.post("/register", register);

/**
 * @swagger
 * /admin:
 *   get:
 *     summary: Obtener todos los administradores
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de administradores
 */
router.get("/", authMiddleware, obtenerAdmins);

/**
 * @swagger
 * /admin/{id}:
 *   get:
 *     summary: Obtener un administrador por ID
 *     tags: [Admins]
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
 *         description: Administrador encontrado
 *       404:
 *         description: Administrador no encontrado
 */
router.get("/:id", authMiddleware, obtenerAdminPorId);

/**
 * @swagger
 * /admin/{id}:
 *   put:
 *     summary: Actualizar un administrador por ID
 *     tags: [Admins]
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
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Administrador actualizado correctamente
 *       404:
 *         description: Administrador no encontrado
 */
router.put("/:id", authMiddleware, actualizarAdmin);

/**
 * @swagger
 * /admin/{id}:
 *   delete:
 *     summary: Eliminar un administrador por ID
 *     tags: [Admins]
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
 *         description: Administrador eliminado correctamente
 *       404:
 *         description: Administrador no encontrado
 */
router.delete("/:id", authMiddleware, eliminarAdmin);

module.exports = router;
