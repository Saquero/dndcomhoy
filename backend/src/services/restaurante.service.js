const prisma = require("../prisma");
const slugify = require("slugify");

// =====================
// NORMALIZACION
// =====================
function normalizeText(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

// =====================
// SINONIMOS DCH
// =====================
function expandQuery(q) {
  if (!q) return [];

  const normalizedQuery = normalizeText(q);
  const words = normalizedQuery.split(/\s+/).filter(Boolean);

  const groups = [
    ["marisco", "pescado", "pescados", "seafood"],
    ["paella", "arroz", "arroces", "caldero"],
    ["italiano", "italiana", "pizza", "pasta"],
    ["hamburguesa", "hamburguesas", "burger", "burgers"],
    ["carne", "carnes", "brasa", "brasas", "parrilla", "asador"],
    ["familiar", "familia", "familias", "ninos", "peques", "infantil"],
    ["terraza", "exterior", "aire libre", "jardin", "jardines"],
    ["parque", "zona verde", "zona infantil", "juegos infantiles"],
    ["vegano", "vegetariano", "vegetariana"],
    ["cafeteria", "cafe", "merienda", "merendar"],
    ["cumpleanos", "cumple", "cumpleanos infantiles"],
    ["ludoteca", "monitores", "talleres"],
    ["parque de bolas", "bolas", "pelotero"],
    ["hinchables", "hinchable", "castillo hinchable"],
    ["trampolines", "trampolin", "camas elasticas"],
    ["toboganes", "tobogan"],
    ["menu infantil", "menu ninos", "menus infantiles"],
    ["padres tranquilos", "comer tranquilos", "tomar algo mientras"],
    ["comer mientras juegan", "mientras juegan", "mientras los ninos"],
    ["terraza con ninos", "terraza familiar"],
    ["ocio infantil", "animacion infantil", "actividades infantiles"],
  ];

  const result = new Set();

  // Añadimos la query completa para tags compuestos:
  // "padres tranquilos", "comer mientras juegan", "parque de bolas", etc.
  result.add(normalizedQuery);

  for (const word of words) {
    result.add(word);
  }

  for (const group of groups) {
    const groupMatches = group.some((term) => {
      const normalizedTerm = normalizeText(term);
      return (
        normalizedQuery.includes(normalizedTerm) ||
        words.includes(normalizedTerm)
      );
    });

    if (groupMatches) {
      group.forEach((term) => result.add(normalizeText(term)));
    }
  }

  return Array.from(result);
}

// =====================
// HELPERS
// =====================
const isFilled = (v) =>
  typeof v === "string" ? v.trim().length > 0 : v != null;

const toStr = (v) =>
  typeof v === "string" ? v.trim() : v == null ? "" : String(v).trim();

const parseBool = (v) => {
  if (v === true) return true;
  if (v === false) return false;

  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    return s === "true" || s === "1" || s === "on" || s === "yes";
  }

  return Boolean(v);
};

const clampInt = (n, min, max, fallback) => {
  const x = Number(n);
  if (!Number.isFinite(x)) return fallback;
  return Math.max(min, Math.min(max, Math.trunc(x)));
};

// =====================
// CREATE
// =====================
exports.crear = async (data) => {
  const slug = slugify(data.nombre, { lower: true, strict: true });

  return prisma.restaurante.create({
    data: {
      ...data,
      slug,
      imagenes: Array.isArray(data.imagenes) ? data.imagenes : [],
    },
  });
};

// =====================
// SEARCH
// =====================
exports.obtenerFiltrados = async (opts = {}) => {
  const q = toStr(opts.q);
  const ciudad = toStr(opts.ciudad);
  const localidad = toStr(opts.localidad);
  const onlyWithCoords = parseBool(opts.onlyWithCoords);
  const matchMode = opts.matchMode === "any" ? "any" : "all";
  const sortBy = toStr(opts.sortBy) || "favoritos_desc";

  const page = clampInt(opts.page, 1, 1000000, 1);
  const pageSize = clampInt(opts.pageSize, 1, 100, 12);
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  const AND = [];

  // =====================
  // TEXTO INTELIGENTE
  // =====================
  if (isFilled(q)) {
    const normalizedQ = normalizeText(q);
    const keywords = expandQuery(q);

    AND.push({
      OR: [
        { nombre: { contains: q, mode: "insensitive" } },
        { descripcion: { contains: q, mode: "insensitive" } },
        { nombre: { contains: normalizedQ, mode: "insensitive" } },
        { descripcion: { contains: normalizedQ, mode: "insensitive" } },
        { tags: { hasSome: keywords } },
      ],
    });

    // Si hay búsqueda textual, no obligamos a cumplir flags.
    opts.ignoreFlags = true;
  }

  if (isFilled(ciudad)) {
    AND.push({ ciudad: { contains: ciudad, mode: "insensitive" } });
  }

  if (isFilled(localidad)) {
    AND.push({ localidad: { contains: localidad, mode: "insensitive" } });
  }

  if (onlyWithCoords) {
    AND.push({ latitud: { not: null } });
    AND.push({ longitud: { not: null } });
  }

  AND.push({ activo: true });

  // =====================
  // FILTROS BOOLEANOS
  // =====================
  const flags = opts.ignoreFlags ? {} : opts.flags || {};
  const flagEntries = Object.entries(flags).filter(([_, v]) => v === true);

  if (flagEntries.length > 0) {
    const flagConditions = flagEntries.map(([k]) => ({ [k]: true }));

    if (matchMode === "any") {
      AND.push({ OR: flagConditions });
    } else {
      AND.push(...flagConditions);
    }
  }

  const where = AND.length > 0 ? { AND } : {};

  const orderMap = {
    nombre_asc: { nombre: "asc" },
    nombre_desc: { nombre: "desc" },
    ciudad_asc: { ciudad: "asc" },
    ciudad_desc: { ciudad: "desc" },
    favoritos_desc: { favoritos: "desc" },
    favoritos_asc: { favoritos: "asc" },
    vistas_desc: { vistas: "desc" },
  };

  const orderBy = orderMap[sortBy] || { favoritos: "desc" };

  const [items, total] = await Promise.all([
    prisma.restaurante.findMany({ where, orderBy, skip, take }),
    prisma.restaurante.count({ where }),
  ]);

  return { items, total, page, pageSize };
};
