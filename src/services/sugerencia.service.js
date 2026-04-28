const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const slugify = require("slugify");

/**
 * Crear una nueva sugerencia
 * @param {Object} data
 * @returns {Promise<Object>}
 */
exports.crearSugerencia = async (data) => {
  try {
    const slug = slugify(data.nombre, { lower: true, strict: true });

    return await prisma.sugerencia.create({
      data: {
        nombre: data.nombre,
        direccion: data.direccion,
        descripcion: data.descripcion,
        localidad: data.localidad,
        ciudad: data.ciudad,
        provincia: data.provincia,
        nombreContacto: data.nombreContacto,
        emailContacto: data.emailContacto || null,
        comentarios: data.comentarios || null,

        zonaAmplia: data.zonaAmplia || false,
        parqueCercano: data.parqueCercano || false,
        zonaInfantil: data.zonaInfantil || false,
        tronaDisponible: data.tronaDisponible || false,
        cambiadorDisponible: data.cambiadorDisponible || false,
        sitioParaCarrito: data.sitioParaCarrito || false,
        terrazaSegura: data.terrazaSegura || false,
        actividadesParaNinos: data.actividadesParaNinos || false,
        menuInfantil: data.menuInfantil || false,
        aptoVegetariano: data.aptoVegetariano || false,
        aptoVegano: data.aptoVegano || false,
        sinPantallas: data.sinPantallas || false,
        ambienteFamiliar: data.ambienteFamiliar || false,
        accesibleConCarrito: data.accesibleConCarrito || false,

        slug,
      },
    });
  } catch (error) {
    throw new Error("Error creando sugerencia: " + error.message);
  }
};

/**
 * Obtener todas las sugerencias ordenadas por fecha de creación (desc)
 * @returns {Promise<Array>}
 */
exports.obtenerSugerencias = async () => {
  try {
    return await prisma.sugerencia.findMany({
      orderBy: { creadaEn: "desc" },
    });
  } catch (error) {
    throw new Error("Error obteniendo sugerencias: " + error.message);
  }
};

/**
 * Obtener sugerencia por ID
 * @param {number|string} id
 * @returns {Promise<Object>}
 */
exports.obtenerPorId = async (id) => {
  try {
    return await prisma.sugerencia.findUnique({
      where: { id: Number(id) },
    });
  } catch (error) {
    throw new Error("Error obteniendo sugerencia por ID: " + error.message);
  }
};

/**
 * Actualizar sugerencia por ID
 * @param {number|string} id
 * @param {Object} data
 * @returns {Promise<Object>}
 */
exports.actualizarSugerencia = async (id, data) => {
  try {
    const actualizaSlug =
      data.nombre && typeof data.nombre === "string"
        ? slugify(data.nombre, { lower: true, strict: true })
        : undefined;

    return await prisma.sugerencia.update({
      where: { id: Number(id) },
      data: {
        ...data,
        slug: actualizaSlug || undefined,
      },
    });
  } catch (error) {
    throw new Error("Error actualizando sugerencia: " + error.message);
  }
};

/**
 * Eliminar sugerencia por ID
 * @param {number|string} id
 * @returns {Promise<Object>}
 */
exports.eliminar = async (id) => {
  try {
    return await prisma.sugerencia.delete({
      where: { id: Number(id) },
    });
  } catch (error) {
    throw new Error("Error eliminando sugerencia: " + error.message);
  }
};
