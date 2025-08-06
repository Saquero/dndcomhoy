const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const restauranteRoutes = require("./routes/restaurante.routes");
const sugerenciaRoutes = require("./routes/sugerencia.routes");
const adminRoutes = require("./routes/admin.routes");
const setupSwagger = require("./swagger");
const logger = require("./logger"); // Importar logger Winston

const app = express();

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());

setupSwagger(app);

app.use("/api/restaurantes", restauranteRoutes);
app.use("/api/sugerencias", sugerenciaRoutes);
app.use("/api/admin", adminRoutes);

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// Manejador global de errores
app.use((err, req, res, next) => {
  logger.error("Error no capturado: %o", err);
  res.status(500).json({ error: "Error interno del servidor" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`✅ Servidor corriendo en http://localhost:${PORT}`);
  logger.info(`📚 Swagger docs en: http://localhost:${PORT}/api/docs`);
});
