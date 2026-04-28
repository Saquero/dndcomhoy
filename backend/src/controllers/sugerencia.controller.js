const sugerenciaService = require("../services/sugerencia.service");
const restauranteService = require("../services/restaurante.service");
const logger = require("../logger");
const { geocodeAddress } = require("../utils/geocoding");

const frasesGracias = [
  'iGracias por tu sugerencia! El restaurante "{nombre}" ha sido registrado y sera revisado.',
  'iGenial! Hemos recibido la sugerencia para "{nombre}". Nuestro equipo la revisara pronto.',
  'iPerfecto! "{nombre}" esta en nuestra lista para evaluacion. iGracias por colaborar!',
  'iTu sugerencia para "{nombre}" ha sido anotada! Te avisaremos cuando sea verificada.',
  'iGracias por ayudarnos a mejorar! "{nombre}" sera revisado por nuestro equipo muy pronto.',
];

function fraseAleatoria(nombre) {
  const frase = frasesGracias[Math.floor(Math.random() * frasesGracias.length)];
  return frase.replace("{nombre}", nombre);
}

// POST crear
const crearSugerencia = async (req, res) => {
  logger.info("Datos recibidos para crear sugerencia:", req.body);
  try {
    const {
      nombre, direccion, descripcion, localidad, ciudad, provincia,
      nombreContacto, emailContacto, comentarios,
      zonaAmplia, parqueCercano, zonaInfantil, tronaDisponible,
      cambiadorDisponible, sitioParaCarrito, terrazaSegura,
      actividadesParaNinos, menuInfantil, aptoVegetariano, aptoVegano,
      sinPantallas, ambienteFamiliar, accesibleConCarrito,
      codigoPostal, pais, latitud, longitud,
    } = req.body;

    if (!nombre || !direccion || !descripcion || !localidad || !ciudad || !provincia || !nombreContacto) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const nuevaSugerencia = await sugerenciaService.crearSugerencia({
      nombre, direccion, descripcion, localidad, ciudad, provincia,
      nombreContacto, emailContacto, comentarios,
      zonaAmplia, parqueCercano, zonaInfantil, tronaDisponible,
      cambiadorDisponible, sitioParaCarrito, terrazaSegura,
      actividadesParaNinos, menuInfantil, aptoVegetariano, aptoVegano,
      sinPantallas, ambienteFamiliar, accesibleConCarrito,
      codigoPostal, pais, latitud, longitud,
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

// GET paginado + filtros
const obtenerSugerencias = async (req, res) => {
  try {
    const { page = 1, pageSize = 20, estado, search } = req.query;
    const result = await sugerenciaService.obtenerTodos({
      page: Number(page),
      pageSize: Number(pageSize),
      estado: estado || undefined,
      search: search || undefined,
    });
    res.json(result);
  } catch (error) {
    logger.error("Error al obtener sugerencias: %o", error);
    res.status(500).json({ error: "Error al obtener sugerencias" });
  }
};

// GET por id
const obtenerSugerenciaPorId = async (req, res) => {
  const { id } = req.params;
  if (isNaN(parseInt(id, 10)))
    return res.status(400).json({ error: "ID invalido" });
  try {
    const sugerencia = await sugerenciaService.obtenerPorId(id);
    if (!sugerencia)
      return res.status(404).json({ error: "Sugerencia no encontrada" });
    res.json(sugerencia);
  } catch (error) {
    logger.error("Error al obtener sugerencia: %o", error);
    res.status(500).json({ error: "Error al obtener sugerencia" });
  }
};

// PUT update completo
const actualizarSugerencia = async (req, res) => {
  const { id } = req.params;
  if (isNaN(parseInt(id, 10)))
    return res.status(400).json({ error: "ID invalido" });
  try {
    const sugerenciaActualizada = await sugerenciaService.actualizarSugerencia(id, req.body);
    res.json(sugerenciaActualizada);
  } catch (error) {
    if (error.code === "P2025")
      return res.status(404).json({ error: "Sugerencia no encontrada" });
    logger.error("Error al actualizar sugerencia: %o", error);
    res.status(500).json({ error: "Error al actualizar sugerencia" });
  }
};

// PATCH estado â€” acepta motivoRechazo opcional
const actualizarEstado = async (req, res) => {
  const { id } = req.params;
  const { estado, motivoRechazo } = req.body;

  if (isNaN(parseInt(id, 10)))
    return res.status(400).json({ error: "ID invalido" });
  if (!estado)
    return res.status(400).json({ error: "Estado requerido" });

  try {
    const updateData = { estado };
    if (motivoRechazo && typeof motivoRechazo === "string") {
      updateData.motivoRechazo = motivoRechazo.trim();
      if (updateData.motivoRechazo) {
        logger.info(`Sugerencia ${id} rechazada. Motivo: ${updateData.motivoRechazo}`);
      }
    }

    const updated = await sugerenciaService.actualizarEstado(id, estado, updateData);
    if (!updated)
      return res.status(400).json({ error: "Estado invalido o sugerencia no encontrada" });

    res.json(updated);
  } catch (error) {
    logger.error("Error al actualizar estado de sugerencia: %o", error);
    res.status(500).json({ error: "Error al actualizar estado" });
  }
};

// DELETE
const eliminarSugerencia = async (req, res) => {
  const { id } = req.params;
  if (isNaN(parseInt(id, 10)))
    return res.status(400).json({ error: "ID invalido" });
  try {
    await sugerenciaService.eliminarSugerencia(id);
    res.json({ mensaje: "Sugerencia eliminada" });
  } catch (error) {
    if (error.code === "P2025")
      return res.status(404).json({ error: "Sugerencia no encontrada" });
    logger.error("Error al eliminar sugerencia: %o", error);
    res.status(500).json({ error: "Error al eliminar sugerencia" });
  }
};

// POST aprobar â€” convierte sugerencia en restaurante
const aprobarSugerencia = async (req, res) => {
  const { id } = req.params;
  if (isNaN(parseInt(id, 10)))
    return res.status(400).json({ error: "ID invalido" });

  try {
    const sugerencia = await sugerenciaService.obtenerPorId(id);
    if (!sugerencia)
      return res.status(404).json({ error: "Sugerencia no encontrada" });
    if (sugerencia.estado !== "PENDIENTE")
      return res.status(400).json({ error: "Solo se pueden aprobar sugerencias PENDIENTES" });

    const dataRest = {
      nombre: sugerencia.nombre,
      direccion: sugerencia.direccion,
      localidad: sugerencia.localidad,
      ciudad: sugerencia.ciudad,
      provincia: sugerencia.provincia,
      codigoPostal: sugerencia.codigoPostal,
      pais: sugerencia.pais || "Espana",
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
      imagenes: [],
    };

    if (sugerencia.latitud != null && sugerencia.longitud != null) {
      dataRest.latitud = sugerencia.latitud;
      dataRest.longitud = sugerencia.longitud;
    } else {
      const geo = await geocodeAddress({
        direccion: dataRest.direccion,
        localidad: dataRest.localidad,
        ciudad: dataRest.ciudad,
        provincia: dataRest.provincia,
        codigoPostal: dataRest.codigoPostal,
        pais: dataRest.pais,
      });
      if (geo) {
        dataRest.latitud = geo.lat;
        dataRest.longitud = geo.lon;
      }
    }

    const nuevoRestaurante = await restauranteService.crear(dataRest);

    await sugerenciaService.actualizarSugerencia(id, {
      estado: "APROBADA",
      restauranteId: nuevoRestaurante.id,
      procesadaEn: new Date(),
    });

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
  actualizarEstado,
  eliminarSugerencia,
  aprobarSugerencia,
};
