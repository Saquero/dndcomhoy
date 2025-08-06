const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const slugify = require("slugify");

/**
 * Crear un nuevo restaurante
 * @param {Object} data - Datos del restaurante
 * @returns {Promise<Object>} Nuevo restaurante creado
 */
exports.crear = async (data) => {
  try {
    const slug = slugify(data.nombre, { lower: true, strict: true });

    return await prisma.restaurante.create({
      data: {
        ...data,
        slug,
        imagenes: Array.isArray(data.imagenes) ? data.imagenes : [],
      },
    });
  } catch (error) {
    throw new Error("Error creando restaurante: " + error.message);
  }
};

/**
 * Obtener restaurantes con filtros opcionales
 * @param {Object} query - Filtros de búsqueda
 * @returns {Promise<Array>} Lista de restaurantes
 */
exports.obtenerTodos = async (query = {}) => {
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
    } = query;

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

    return await prisma.restaurante.findMany({
      where: filtros,
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    throw new Error("Error obteniendo restaurantes: " + error.message);
  }
};

/**
 * Obtener restaurante por ID
 * @param {number|string} id
 * @returns {Promise<Object>}
 */
exports.obtenerPorId = async (id) => {
  try {
    return await prisma.restaurante.findUnique({
      where: { id: Number(id) },
    });
  } catch (error) {
    throw new Error("Error obteniendo restaurante por ID: " + error.message);
  }
};

/**
 * Obtener restaurante por slug
 * @param {string} slug
 * @returns {Promise<Object>}
 */
exports.obtenerPorSlug = async (slug) => {
  try {
    return await prisma.restaurante.findUnique({
      where: { slug },
    });
  } catch (error) {
    throw new Error("Error obteniendo restaurante por slug: " + error.message);
  }
};

/**
 * Actualizar restaurante por ID
 * @param {number|string} id
 * @param {Object} data
 * @returns {Promise<Object>}
 */
exports.actualizar = async (id, data) => {
  try {
    const actualizaSlug =
      data.nombre && typeof data.nombre === "string"
        ? slugify(data.nombre, { lower: true, strict: true })
        : undefined;

    return await prisma.restaurante.update({
      where: { id: Number(id) },
      data: {
        ...data,
        slug: actualizaSlug || undefined,
        imagenes: Array.isArray(data.imagenes) ? data.imagenes : undefined,
      },
    });
  } catch (error) {
    throw new Error("Error actualizando restaurante: " + error.message);
  }
};

/**
 * Eliminar restaurante por ID
 * @param {number|string} id
 * @returns {Promise<Object>}
 */
exports.eliminar = async (id) => {
  try {
    return await prisma.restaurante.delete({
      where: { id: Number(id) },
    });
  } catch (error) {
    throw new Error("Error eliminando restaurante: " + error.message);
  }
};
