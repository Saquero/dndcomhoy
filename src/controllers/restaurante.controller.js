const prisma = require("../prisma");
const logger = require("../logger");

// Crear restaurante
const crearRestaurante = async (req, res) => {
  try {
    const restaurante = await prisma.restaurante.create({
      data: req.body,
    });

    res.status(201).json(restaurante);
  } catch (error) {
    logger.error("Error al crear restaurante:", error);
    res.status(500).json({ error: "Error al crear restaurante" });
  }
};

// Obtener restaurantes con filtros opcionales
const obtenerRestaurantes = async (req, res) => {
  try {
    const {
      direccion,
      ciudad,
      provincia,
      localidad,
      zonaAmplia,
      parqueCercano,
      zonaInfantil,
      menuInfantil,
      tronaDisponible,
      cambiadorDisponible,
      sitioParaCarrito,
      terrazaSegura,
      ambienteFamiliar,
      sinPantallas,
      aptoVegetariano,
      aptoVegano,
      actividadesParaNinos,
      accesibleConCarrito,
      activo,
      verificado,
    } = req.query;

    const filtros = {};

    if (direccion)
      filtros.direccion = { contains: direccion, mode: "insensitive" };
    if (ciudad) filtros.ciudad = { contains: ciudad, mode: "insensitive" };
    if (provincia)
      filtros.provincia = { contains: provincia, mode: "insensitive" };
    if (localidad)
      filtros.localidad = { contains: localidad, mode: "insensitive" };

    // Filtros booleanos
    if (zonaAmplia) filtros.zonaAmplia = zonaAmplia === "true";
    if (parqueCercano) filtros.parqueCercano = parqueCercano === "true";
    if (zonaInfantil) filtros.zonaInfantil = zonaInfantil === "true";
    if (menuInfantil) filtros.menuInfantil = menuInfantil === "true";
    if (tronaDisponible) filtros.tronaDisponible = tronaDisponible === "true";
    if (cambiadorDisponible)
      filtros.cambiadorDisponible = cambiadorDisponible === "true";
    if (sitioParaCarrito)
      filtros.sitioParaCarrito = sitioParaCarrito === "true";
    if (terrazaSegura) filtros.terrazaSegura = terrazaSegura === "true";
    if (ambienteFamiliar)
      filtros.ambienteFamiliar = ambienteFamiliar === "true";
    if (sinPantallas) filtros.sinPantallas = sinPantallas === "true";
    if (aptoVegetariano) filtros.aptoVegetariano = aptoVegetariano === "true";
    if (aptoVegano) filtros.aptoVegano = aptoVegano === "true";
    if (actividadesParaNinos)
      filtros.actividadesParaNinos = actividadesParaNinos === "true";
    if (accesibleConCarrito)
      filtros.accesibleConCarrito = accesibleConCarrito === "true";
    if (activo) filtros.activo = activo === "true";
    if (verificado) filtros.verificado = verificado === "true";

    const restaurantes = await prisma.restaurante.findMany({
      where: filtros,
      orderBy: { createdAt: "desc" },
    });

    res.json(restaurantes);
  } catch (error) {
    logger.error("Error al obtener restaurantes:", error);
    res.status(500).json({ error: "Error al obtener restaurantes" });
  }
};

// Actualizar restaurante
const actualizarRestaurante = async (req, res) => {
  const { id } = req.params;

  if (isNaN(parseInt(id, 10))) {
    return res.status(400).json({ error: "ID inválido" });
  }

  try {
    const restaurante = await prisma.restaurante.update({
      where: { id: parseInt(id, 10) },
      data: req.body,
    });

    res.json(restaurante);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Restaurante no encontrado" });
    }
    logger.error("Error al actualizar restaurante:", error);
    res.status(500).json({ error: "Error al actualizar restaurante" });
  }
};

// Eliminar restaurante
const eliminarRestaurante = async (req, res) => {
  const { id } = req.params;

  if (isNaN(parseInt(id, 10))) {
    return res.status(400).json({ error: "ID inválido" });
  }

  try {
    await prisma.restaurante.delete({
      where: { id: parseInt(id, 10) },
    });

    res.json({ mensaje: "Restaurante eliminado correctamente" });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Restaurante no encontrado" });
    }
    logger.error("Error al eliminar restaurante:", error);
    res.status(500).json({ error: "Error al eliminar restaurante" });
  }
};

module.exports = {
  crearRestaurante,
  obtenerRestaurantes,
  actualizarRestaurante,
  eliminarRestaurante,
};
