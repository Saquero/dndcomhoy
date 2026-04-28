// src/services/sugerencia.service.js
const prisma = require("../prisma");
const slugify = require("slugify");

const VALID_ESTADOS = ["PENDIENTE", "APROBADA", "RECHAZADA", "DUPLICADA"];

// slugify util local
function makeSlug(nombre) {
  try {
    return slugify(nombre, { lower: true, strict: true });
  } catch {
    return nombre.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  }
}

// Crear sugerencia nueva
exports.crearSugerencia = async (data) => {
  const slug = makeSlug(data.nombre) + "-" + Date.now();
  return prisma.sugerencia.create({
    data: { ...data, slug },
  });
};

// Listar con paginacion y filtros
exports.obtenerTodos = async ({ page = 1, pageSize = 20, estado, search } = {}) => {
  const p    = Math.max(1, Number(page));
  const size = Math.min(100, Math.max(1, Number(pageSize)));
  const skip = (p - 1) * size;

  const AND = [];

  if (estado && VALID_ESTADOS.includes(estado.toUpperCase())) {
    AND.push({ estado: estado.toUpperCase() });
  }

  if (search && search.trim()) {
    AND.push({
      OR: [
        { nombre:   { contains: search, mode: "insensitive" } },
        { ciudad:   { contains: search, mode: "insensitive" } },
        { nombreContacto: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  const where = AND.length > 0 ? { AND } : {};

  const [items, total] = await Promise.all([
    prisma.sugerencia.findMany({
      where,
      orderBy: { creadaEn: "desc" },
      skip,
      take: size,
    }),
    prisma.sugerencia.count({ where }),
  ]);

  return {
    data: items,
    meta: {
      total,
      page: p,
      pageSize: size,
      pages: Math.max(1, Math.ceil(total / size)),
    },
  };
};

// Obtener por id
exports.obtenerPorId = async (id) => {
  return prisma.sugerencia.findUnique({ where: { id: parseInt(id, 10) } });
};

// Actualizar campos (patch libre)
exports.actualizarSugerencia = async (id, data) => {
  return prisma.sugerencia.update({
    where: { id: parseInt(id, 10) },
    data,
  });
};

// Cambiar estado â€” acepta datos extra (motivoRechazo, procesadaEn, etc)
exports.actualizarEstado = async (id, estado, extraData = {}) => {
  const estadoUpper = String(estado).toUpperCase();
  if (!VALID_ESTADOS.includes(estadoUpper)) return null;

  const updateData = {
    estado: estadoUpper,
    procesadaEn: new Date(),
    ...extraData,
  };

  return prisma.sugerencia.update({
    where: { id: parseInt(id, 10) },
    data: updateData,
  });
};

// Eliminar
exports.eliminarSugerencia = async (id) => {
  return prisma.sugerencia.delete({ where: { id: parseInt(id, 10) } });
};
