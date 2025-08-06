const prisma = require("../prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const logger = require("../logger");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email y contraseña son requeridos" });
  }

  try {
    const admin = await prisma.admin.findUnique({ where: { email } });

    if (!admin) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    if (!admin.activo) {
      return res.status(403).json({ message: "Cuenta de admin inactiva" });
    }

    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    const token = jwt.sign(
      { adminId: admin.id, email: admin.email },
      JWT_SECRET,
      { expiresIn: "4h" }
    );

    return res.json({ token });
  } catch (error) {
    logger.error("Error en login admin: %o", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
}

async function register(req, res) {
  const { email, password, nombre, activo = true } = req.body;

  if (!password || (!email && !nombre)) {
    return res
      .status(400)
      .json({ message: "Contraseña y al menos email o nombre son requeridos" });
  }

  try {
    if (email) {
      const existingAdmin = await prisma.admin.findUnique({ where: { email } });
      if (existingAdmin) {
        return res.status(409).json({ message: "El email ya está registrado" });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await prisma.admin.create({
      data: {
        email: email || null,
        password: hashedPassword,
        nombre: nombre || null,
        activo,
      },
    });

    return res
      .status(201)
      .json({ message: "Admin creado con éxito", adminId: newAdmin.id });
  } catch (error) {
    logger.error("Error en registro admin: %o", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
}

async function obtenerAdmins(req, res) {
  try {
    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        email: true,
        nombre: true,
        activo: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    res.json(admins);
  } catch (error) {
    logger.error("Error al obtener admins: %o", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
}

async function obtenerAdminPorId(req, res) {
  const { id } = req.params;
  if (isNaN(parseInt(id, 10))) {
    return res.status(400).json({ message: "ID inválido" });
  }

  try {
    const admin = await prisma.admin.findUnique({
      where: { id: parseInt(id, 10) },
      select: {
        id: true,
        email: true,
        nombre: true,
        activo: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!admin) {
      return res.status(404).json({ message: "Admin no encontrado" });
    }
    res.json(admin);
  } catch (error) {
    logger.error("Error al obtener admin: %o", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
}

async function actualizarAdmin(req, res) {
  const { id } = req.params;
  if (isNaN(parseInt(id, 10))) {
    return res.status(400).json({ message: "ID inválido" });
  }
  const { email, nombre, activo, password } = req.body;
  try {
    let dataToUpdate = { email, nombre, activo };
    if (password) {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }
    Object.keys(dataToUpdate).forEach(
      (key) => dataToUpdate[key] === undefined && delete dataToUpdate[key]
    );

    const admin = await prisma.admin.update({
      where: { id: parseInt(id, 10) },
      data: dataToUpdate,
      select: {
        id: true,
        email: true,
        nombre: true,
        activo: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    res.json(admin);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Admin no encontrado" });
    }
    logger.error("Error al actualizar admin: %o", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
}

async function eliminarAdmin(req, res) {
  const { id } = req.params;
  if (isNaN(parseInt(id, 10))) {
    return res.status(400).json({ message: "ID inválido" });
  }
  try {
    await prisma.admin.delete({
      where: { id: parseInt(id, 10) },
    });
    res.json({ message: "Admin eliminado correctamente" });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Admin no encontrado" });
    }
    logger.error("Error al eliminar admin: %o", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
}

module.exports = {
  login,
  register,
  obtenerAdmins,
  obtenerAdminPorId,
  actualizarAdmin,
  eliminarAdmin,
};
