const jwt = require("jsonwebtoken");
const prisma = require("../prisma");
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

module.exports = async (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  // El header debe tener formato: "Bearer <token>"
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token mal formateado" });
  }

  try {
    // Verificamos el token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Buscar admin en DB para comprobar si sigue activo
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.adminId },
    });

    if (!admin) {
      return res.status(401).json({ error: "Admin no encontrado" });
    }

    if (!admin.activo) {
      return res.status(403).json({ error: "Cuenta de admin inactiva" });
    }

    // Guardamos info del admin para usar en la ruta
    req.admin = {
      id: admin.id,
      email: admin.email,
    };

    next(); // Todo bien, dejamos pasar
  } catch (err) {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
};
