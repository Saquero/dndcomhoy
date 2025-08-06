const sugerenciaService = require("../services/sugerencia.service");
const restauranteService = require("../services/restaurante.service");
const logger = require("../logger");

// Frases motivadoras
const frasesGracias = [
  '¡Gracias por tu sugerencia! El restaurante "{nombre}" ha sido registrado y será revisado.',
  '¡Genial! Hemos recibido la sugerencia para "{nombre}". Nuestro equipo la revisará pronto.',
  '¡Perfecto! "{nombre}" está en nuestra lista para evaluación. ¡Gracias por colaborar!',
  '¡Tu sugerencia para "{nombre}" ha sido anotada! Te avisaremos cuando sea verificada.',
  '¡Gracias por ayudarnos a mejorar! "{nombre}" será revisado por nuestro equipo muy pronto.',
];

function fraseAleatoria(nombre) {
  const frase = frasesGracias[Math.floor(Math.random() * frasesGracias.length)];
  return frase.replace("{nombre}", nombre);
}

// Crear sugerencia
const crearSugerencia = async (req, res) => {
  logger.info("Datos recibidos para crear sugerencia:", req.body);
  try {
    const {
      nombre,
      direccion,
      descripcion,
      localidad,
      ciudad,
      provincia,
      nombreContacto,
      emailContacto,
      comentarios,
      zonaAmplia,
      parqueCercano,
      zonaInfantil,
      tronaDisponible,
      cambiadorDisponible,
      sitioParaCarrito,
      terrazaSegura,
      actividadesParaNinos,
      menuInfantil,
      aptoVegetariano,
      aptoVegano,
      sinPantallas,
      ambienteFamiliar,
      accesibleConCarrito,
    } = req.body;

    // Validación de campos obligatorios
    if (
      !nombre ||
      !direccion ||
      !descripcion ||
      !localidad ||
      !ciudad ||
      !provincia ||
      !nombreContacto
    ) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const nuevaSugerencia = await sugerenciaService.crearSugerencia({
      nombre,
      direccion,
      descripcion,
      localidad,
      ciudad,
      provincia,
      nombreContacto,
      emailContacto,
      comentarios,
      zonaAmplia,
      parqueCercano,
      zonaInfantil,
      tronaDisponible,
      cambiadorDisponible,
      sitioParaCarrito,
      terrazaSegura,
      actividadesParaNinos,
      menuInfantil,
      aptoVegetariano,
      aptoVegano,
      sinPantallas,
      ambienteFamiliar,
      accesibleConCarrito,
    });

    res.status(201).json({
      mensaje: fraseAleatoria(nuevaSugerencia.nombre),
      sugerencia: nuevaSugerencia,
    });
  } catch (error) {
    logger.error("Error al crear sugerencia:", error);
    res.status(500).json({ error: "Error al crear sugerencia" });
  }
};

// Obtener todas las sugerencias
const obtenerSugerencias = async (req, res) => {
  try {
    const sugerencias = await sugerenciaService.obtenerSugerencias();
    res.json(sugerencias);
  } catch (error) {
    logger.error("Error al obtener sugerencias: %o", error);
    res.status(500).json({ error: "Error al obtener sugerencias" });
  }
};

// Obtener una sugerencia por ID
const obtenerSugerenciaPorId = async (req, res) => {
  const { id } = req.params;
  if (isNaN(parseInt(id, 10))) {
    return res.status(400).json({ error: "ID inválido" });
  }

  try {
    const sugerencia = await sugerenciaService.obtenerPorId(id);
    if (!sugerencia) {
      return res.status(404).json({ error: "Sugerencia no encontrada" });
    }
    res.json(sugerencia);
  } catch (error) {
    logger.error("Error al obtener sugerencia: %o", error);
    res.status(500).json({ error: "Error al obtener sugerencia" });
  }
};

// Actualizar sugerencia
const actualizarSugerencia = async (req, res) => {
  const { id } = req.params;
  if (isNaN(parseInt(id, 10))) {
    return res.status(400).json({ error: "ID inválido" });
  }

  try {
    const sugerenciaActualizada = await sugerenciaService.actualizarSugerencia(
      id,
      req.body
    );
    res.json(sugerenciaActualizada);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Sugerencia no encontrada" });
    }
    logger.error("Error al actualizar sugerencia: %o", error);
    res.status(500).json({ error: "Error al actualizar sugerencia" });
  }
};

// Eliminar sugerencia
const eliminarSugerencia = async (req, res) => {
  const { id } = req.params;
  if (isNaN(parseInt(id, 10))) {
    return res.status(400).json({ error: "ID inválido" });
  }

  try {
    await sugerenciaService.eliminar(id);
    res.json({ mensaje: "Sugerencia eliminada correctamente" });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Sugerencia no encontrada" });
    }
    logger.error("Error al eliminar sugerencia: %o", error);
    res.status(500).json({ error: "Error al eliminar sugerencia" });
  }
};

// Aprobar sugerencia
const aprobarSugerencia = async (req, res) => {
  const { id } = req.params;
  if (isNaN(parseInt(id, 10))) {
    return res.status(400).json({ error: "ID inválido" });
  }

  try {
    const sugerencia = await sugerenciaService.obtenerPorId(id);
    if (!sugerencia) {
      return res.status(404).json({ error: "Sugerencia no encontrada" });
    }

    const nuevoRestaurante = await restauranteService.crear({
      nombre: sugerencia.nombre,
      direccion: sugerencia.direccion,
      descripcion: sugerencia.descripcion,
      zonaAmplia: sugerencia.zonaAmplia,
      parqueCercano: sugerencia.parqueCercano,
      zonaInfantil: sugerencia.zonaInfantil,
      tronaDisponible: sugerencia.tronaDisponible,
      cambiadorDisponible: sugerencia.cambiadorDisponible,
      sitioParaCarrito: sugerencia.sitioParaCarrito,
      terrazaSegura: sugerencia.terrazaSegura,
      actividadesParaNinos: sugerencia.actividadesParaNinos,
      menuInfantil: sugerencia.menuInfantil,
      aptoVegetariano: sugerencia.aptoVegetariano,
      aptoVegano: sugerencia.aptoVegano,
      sinPantallas: sugerencia.sinPantallas,
      ambienteFamiliar: sugerencia.ambienteFamiliar,
      accesibleConCarrito: sugerencia.accesibleConCarrito,
      activo: true,
      verificado: true,
    });

    await sugerenciaService.eliminar(id);

    res.status(201).json({
      mensaje: "Sugerencia aprobada y convertida en restaurante",
      restaurante: nuevoRestaurante,
    });
  } catch (error) {
    logger.error("Error al aprobar sugerencia: %o", error);
    res.status(500).json({ error: "Error al aprobar sugerencia" });
  }
};

module.exports = {
  crearSugerencia,
  obtenerSugerencias,
  obtenerSugerenciaPorId,
  actualizarSugerencia,
  eliminarSugerencia,
  aprobarSugerencia,
};
