// src/index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const setupSwagger = require("./swagger");
const logger = require("./logger");
const prisma = require("./prisma");

// Rutas
const restauranteRoutes = require("./routes/restaurante.routes");
const sugerenciaRoutes = require("./routes/sugerencia.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();

// -- CORS / Seguridad
const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: "1mb" }));

// -- Swagger
setupSwagger(app);

// -- Healthcheck (útil para pruebas/monitorización)
app.get("/health", (_req, res) => res.json({ ok: true }));

// -- Rutas API
app.use("/api/restaurantes", restauranteRoutes);
app.use("/api/sugerencias", sugerenciaRoutes);
app.use("/api/admin", adminRoutes);

// -- 404
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// -- Manejador global de errores
app.use((err, req, res, _next) => {
  logger.error("Error no capturado: %o", err);
  res.status(500).json({ error: "Error interno del servidor" });
});

// -- Arranque
const PORT = process.env.PORT || 3000;

async function start() {
  try {
    // Conexión a la BD antes de escuchar
    await prisma.$connect();

    app.listen(PORT, () => {
      logger.info(`✅ Servidor corriendo en http://localhost:${PORT}`);
      logger.info(`📚 Swagger docs en: http://localhost:${PORT}/api/docs`);
    });
  } catch (e) {
    logger.error("❌ No se pudo iniciar el servidor: %o", e);
    process.exit(1);
  }
}

// Cerrar Prisma con elegancia al apagar
process.on("SIGINT", async () => {
  try {
    await prisma.$disconnect();
  } finally {
    process.exit(0);
  }
});
process.on("SIGTERM", async () => {
  try {
    await prisma.$disconnect();
  } finally {
    process.exit(0);
  }
});

start();
