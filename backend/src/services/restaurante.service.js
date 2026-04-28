// src/services/restaurante.service.js
const prisma = require("../prisma");
const slugify = require("slugify");

const isFilled = (v) => typeof v === "string" ? v.trim().length > 0 : v != null;
const toStr    = (v) => typeof v === "string" ? v.trim() : v == null ? "" : String(v).trim();
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

exports.crear = async (data) => {
  const slug = slugify(data.nombre, { lower: true, strict: true });
  return prisma.restaurante.create({
    data: { ...data, slug, imagenes: Array.isArray(data.imagenes) ? data.imagenes : [] },
  });
};

exports.obtenerFiltrados = async (opts = {}) => {
  const q          = toStr(opts.q);
  const ciudad     = toStr(opts.ciudad);
  const localidad  = toStr(opts.localidad);
  const onlyWithCoords = parseBool(opts.onlyWithCoords);
  const matchMode  = opts.matchMode === "any" ? "any" : "all";
  const sortBy     = toStr(opts.sortBy) || "favoritos_desc";

  const page     = clampInt(opts.page, 1, 1_000_000, 1);
  const pageSize = clampInt(opts.pageSize, 1, 100, 12);
  const skip     = (page - 1) * pageSize;
  const take     = pageSize;

  const AND = [];

  if (isFilled(q)) {
    AND.push({
      OR: [
        { nombre:    { contains: q, mode: "insensitive" } },
        { direccion: { contains: q, mode: "insensitive" } },
        { localidad: { contains: q, mode: "insensitive" } },
        { ciudad:    { contains: q, mode: "insensitive" } },
        { descripcion: { contains: q, mode: "insensitive" } },
      ],
    });
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

  const flags = opts.flags || {};
  const flagEntries = Object.entries(flags).filter(([, v]) => v === true);

  if (flagEntries.length > 0) {
    const flagConditions = flagEntries.map(([k]) => ({ [k]: true }));
    if (matchMode === "any") {
      AND.push({ OR: flagConditions });
    } else {
      AND.push(...flagConditions);
    }
  }

  const where = AND.length > 0 ? { AND } : {};

  // Ordenamiento con soporte para favoritos
  const orderMap = {
    nombre_asc:      { nombre: "asc" },
    nombre_desc:     { nombre: "desc" },
    ciudad_asc:      { ciudad: "asc" },
    ciudad_desc:     { ciudad: "desc" },
    favoritos_desc:  { favoritos: "desc" },
    favoritos_asc:   { favoritos: "asc" },
    vistas_desc:     { vistas: "desc" },
  };
  const orderBy = orderMap[sortBy] ?? { favoritos: "desc" };

  const [items, total] = await Promise.all([
    prisma.restaurante.findMany({ where, orderBy, skip, take }),
    prisma.restaurante.count({ where }),
  ]);

  return { items, total, page, pageSize };
};
