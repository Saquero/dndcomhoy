# ============================================================
# SCRIPT: crear_mejoras_DCH.ps1
# PROYECTO: Donde Comemos Hoy - Mejoras MVP
# EJECUTAR DESDE: la raiz del proyecto (donde estan backend/, dashboard/, public/)
# USO: .\crear_mejoras_DCH.ps1
# ============================================================

$ErrorActionPreference = "Continue"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  DONDE COMEMOS HOY - Aplicando mejoras MVP" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# --- Verificar raiz del proyecto ---
if (-not (Test-Path "backend") -or -not (Test-Path "dashboard")) {
    Write-Host "ERROR: Ejecuta desde la raiz del proyecto (donde estan backend/ y dashboard/)" -ForegroundColor Red
    exit 1
}

# --- Funcion de backup ---
function Backup-File {
    param([string]$Path)
    if (Test-Path $Path) {
        $backupPath = "$Path.backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
        Copy-Item $Path $backupPath -Force
        Write-Host "   Backup: $backupPath" -ForegroundColor Gray
    }
}

# ============================================================
# PASO 1 — BACKEND: schema.prisma con campo favoritos
# ============================================================
Write-Host ""
Write-Host ">> [1/9] Actualizando schema.prisma con campo favoritos..." -ForegroundColor Yellow

Backup-File "backend\prisma\schema.prisma"

@'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Restaurante {
  id                   Int      @id @default(autoincrement())
  nombre               String   @db.VarChar(255)
  direccion            String   @db.VarChar(500)
  localidad            String   @db.VarChar(100)
  ciudad               String   @db.VarChar(100)
  provincia            String   @db.VarChar(100)
  codigoPostal         String?  @db.VarChar(20)
  pais                 String?  @db.VarChar(100)

  telefonoRestaurante  String?  @db.VarChar(20)
  emailRestaurante     String?  @db.VarChar(255)
  sitioWeb             String?  @db.VarChar(500)
  imagenes             String[]
  horario              String?  @db.VarChar(300)
  slug                 String   @unique @db.VarChar(255)
  descripcion          String   @db.Text

  latitud              Float?
  longitud             Float?

  zonaAmplia           Boolean  @default(false)
  parqueCercano        Boolean  @default(false)
  zonaInfantil         Boolean  @default(false)
  tronaDisponible      Boolean  @default(false)
  cambiadorDisponible  Boolean  @default(false)
  sitioParaCarrito     Boolean  @default(false)
  terrazaSegura        Boolean  @default(false)
  actividadesParaNinos Boolean  @default(false)
  menuInfantil         Boolean  @default(false)
  aptoVegetariano      Boolean  @default(false)
  aptoVegano           Boolean  @default(false)
  sinPantallas         Boolean  @default(false)
  ambienteFamiliar     Boolean  @default(false)
  accesibleConCarrito  Boolean  @default(false)

  activo               Boolean  @default(true)
  verificado           Boolean  @default(false)
  vistas               Int      @default(0)
  favoritos            Int      @default(0)

  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt

  sugerencias          Sugerencia[]

  @@index([localidad])
  @@index([ciudad])
  @@index([activo])
  @@index([localidad, activo])
  @@index([ciudad, activo])
  @@index([vistas])
  @@index([favoritos])
}

model Sugerencia {
  id                    Int      @id @default(autoincrement())

  nombre                String   @db.VarChar(255)
  slug                  String   @unique @db.VarChar(255)
  direccion             String   @db.VarChar(500)
  localidad             String   @db.VarChar(100)
  ciudad                String   @db.VarChar(100)
  provincia             String   @db.VarChar(100)
  codigoPostal          String?  @db.VarChar(20)
  pais                  String?  @db.VarChar(100)

  telefonoRestaurante   String?  @db.VarChar(20)
  emailRestaurante      String?  @db.VarChar(255)
  descripcion           String   @db.Text

  nombreContacto        String   @db.VarChar(100)
  emailContacto         String?  @db.VarChar(255)
  comentarios           String?  @db.Text
  motivoRechazo         String?  @db.Text

  zonaAmplia            Boolean  @default(false)
  parqueCercano         Boolean  @default(false)
  zonaInfantil          Boolean  @default(false)
  tronaDisponible       Boolean  @default(false)
  cambiadorDisponible   Boolean  @default(false)
  sitioParaCarrito      Boolean  @default(false)
  terrazaSegura         Boolean  @default(false)
  actividadesParaNinos  Boolean  @default(false)
  menuInfantil          Boolean  @default(false)
  aptoVegetariano       Boolean  @default(false)
  aptoVegano            Boolean  @default(false)
  sinPantallas          Boolean  @default(false)
  ambienteFamiliar      Boolean  @default(false)
  accesibleConCarrito   Boolean  @default(false)

  latitud               Float?
  longitud              Float?

  estado                EstadoSugerencia @default(PENDIENTE)
  creadaEn              DateTime         @default(now())
  procesadaEn           DateTime?

  restaurante           Restaurante? @relation(fields: [restauranteId], references: [id])
  restauranteId         Int?

  @@index([estado])
  @@index([creadaEn])
}

enum EstadoSugerencia {
  PENDIENTE
  APROBADA
  RECHAZADA
  DUPLICADA
}

model Admin {
  id        Int      @id @default(autoincrement())
  email     String   @unique @db.VarChar(255)
  password  String   @db.VarChar(255)
  nombre    String?  @db.VarChar(100)
  activo    Boolean  @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
'@ | Set-Content -Path "backend\prisma\schema.prisma" -Encoding UTF8

Write-Host "   schema.prisma actualizado." -ForegroundColor Green

# ============================================================
# PASO 2 — BACKEND: restaurante.routes.js con endpoint favorito
# ============================================================
Write-Host ""
Write-Host ">> [2/9] Actualizando rutas del backend..." -ForegroundColor Yellow

Backup-File "backend\src\routes\restaurante.routes.js"

@'
// src/routes/restaurante.routes.js
const express = require("express");
const router = express.Router();
const restauranteController = require("../controllers/restaurante.controller");
const validarRestaurante = require("../middlewares/validarRestaurante");
const authMiddleware = require("../middlewares/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: Restaurantes
 *   description: Endpoints para gestionar restaurantes
 */

// Lista publica
router.get("/", restauranteController.obtenerRestaurantes);

// Detalle por id — PUBLICO (sin auth)
router.get("/:id", restauranteController.obtenerRestaurantePorId);

// Favorito — PUBLICO (incrementa contador)
router.post("/:id/favorito", restauranteController.incrementarFavorito);

// Crear (admin)
router.post(
  "/",
  authMiddleware,
  validarRestaurante,
  restauranteController.crearRestaurante
);

// Actualizar (admin)
router.put(
  "/:id",
  authMiddleware,
  validarRestaurante,
  restauranteController.actualizarRestaurante
);

// Eliminar (admin)
router.delete(
  "/:id",
  authMiddleware,
  restauranteController.eliminarRestaurante
);

// Re-geocodificar (admin)
router.post(
  "/:id/regeocode",
  authMiddleware,
  restauranteController.regeocodificar
);

module.exports = router;
'@ | Set-Content -Path "backend\src\routes\restaurante.routes.js" -Encoding UTF8

Write-Host "   restaurante.routes.js actualizado." -ForegroundColor Green

# ============================================================
# PASO 3 — BACKEND: restaurante.controller.js con incrementarFavorito
# ============================================================
Write-Host ""
Write-Host ">> [3/9] Actualizando controller de restaurantes..." -ForegroundColor Yellow

Backup-File "backend\src\controllers\restaurante.controller.js"

@'
const prisma = require("../prisma");
const logger = require("../logger");
const { geocodeAddress } = require("../utils/geocoding");
const restauranteService = require("../services/restaurante.service");

function slugify(text) {
  return String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normNumberOrDelete(obj, key) {
  if (obj[key] === "" || obj[key] === null || obj[key] === undefined) {
    delete obj[key];
  } else if (typeof obj[key] === "string") {
    const n = Number(obj[key]);
    if (Number.isFinite(n)) obj[key] = n;
    else delete obj[key];
  } else if (typeof obj[key] === "number") {
    // ok
  } else {
    delete obj[key];
  }
}

/** POST /api/restaurantes */
async function crearRestaurante(req, res) {
  try {
    const body = { ...req.body };

    if (!body.nombre) {
      return res.status(400).json({ error: "El campo 'nombre' es obligatorio" });
    }

    if (!body.pais) body.pais = "Espana";
    body.slug = slugify(body.nombre);

    if (!Array.isArray(body.imagenes)) body.imagenes = [];

    normNumberOrDelete(body, "latitud");
    normNumberOrDelete(body, "longitud");

    const coordsMissing = body.latitud === undefined || body.longitud === undefined;
    if (coordsMissing) {
      const geo = await geocodeAddress({
        direccion: body.direccion,
        localidad: body.localidad,
        ciudad: body.ciudad,
        provincia: body.provincia,
        codigoPostal: body.codigoPostal,
        pais: body.pais,
      });
      if (geo && Number.isFinite(geo.lat) && Number.isFinite(geo.lon)) {
        body.latitud = geo.lat;
        body.longitud = geo.lon;
      }
    }

    Object.keys(body).forEach((k) => body[k] === undefined && delete body[k]);

    const restaurante = await prisma.restaurante.create({ data: body });
    return res.status(201).json(restaurante);
  } catch (error) {
    if (error.code === "P2002" && error.meta?.target?.includes("slug")) {
      return res.status(409).json({ error: "Ya existe un restaurante con ese nombre (slug duplicado)" });
    }
    logger.error("Error al crear restaurante: %o", error);
    return res.status(500).json({ error: "Error al crear restaurante" });
  }
}

/** GET /api/restaurantes */
async function obtenerRestaurantes(req, res) {
  try {
    const {
      q, search, ciudad, localidad,
      onlyWithCoords, soloConCoordenadas,
      matchMode, sortBy, page, pageSize,
      ...rawFlags
    } = req.query;

    const qFinal = q ?? search;
    const onlyWithCoordsFinal = String(onlyWithCoords ?? soloConCoordenadas) === "true";

    const FLAG_KEYS = [
      "zonaAmplia", "parqueCercano", "zonaInfantil", "tronaDisponible",
      "cambiadorDisponible", "sitioParaCarrito", "terrazaSegura",
      "actividadesParaNinos", "menuInfantil", "aptoVegetariano",
      "aptoVegano", "sinPantallas", "ambienteFamiliar", "accesibleConCarrito",
    ];
    const flags = {};
    for (const k of FLAG_KEYS) {
      const v = rawFlags[k];
      if (v === "true" || v === true) flags[k] = true;
    }

    // Soportar sortBy=favoritos_desc
    const validSortBy = [
      "nombre_asc", "nombre_desc", "ciudad_asc", "ciudad_desc",
      "favoritos_desc", "favoritos_asc", "vistas_desc",
    ];
    const sortByFinal = validSortBy.includes(sortBy) ? sortBy : "favoritos_desc";

    const opts = {
      q: qFinal ? String(qFinal) : undefined,
      ciudad: ciudad || undefined,
      localidad: localidad || undefined,
      onlyWithCoords: onlyWithCoordsFinal,
      matchMode: matchMode === "any" ? "any" : "all",
      sortBy: sortByFinal,
      page: Number(page) || 1,
      pageSize: Number(pageSize) || 12,
      flags,
    };

    const { items, total, page: curPage, pageSize: curSize } =
      await restauranteService.obtenerFiltrados(opts);

    const totalPages = Math.max(1, Math.ceil(total / curSize));

    return res.json({
      data: items,
      meta: { total, page: curPage, pageSize: curSize, totalPages },
    });
  } catch (err) {
    logger.error("Error al obtener restaurantes: %o", err);
    return res.status(500).json({ error: "Error al obtener restaurantes" });
  }
}

/** GET /api/restaurantes/:id */
async function obtenerRestaurantePorId(req, res) {
  const { id } = req.params;
  const parsed = parseInt(id, 10);
  if (isNaN(parsed)) {
    return res.status(400).json({ error: "ID invalido" });
  }
  try {
    const r = await prisma.restaurante.findUnique({ where: { id: parsed } });
    if (!r) return res.status(404).json({ error: "Restaurante no encontrado" });

    // Incrementar vistas
    prisma.restaurante.update({
      where: { id: parsed },
      data: { vistas: { increment: 1 } },
    }).catch(() => {});

    return res.json(r);
  } catch (err) {
    logger.error("Error al obtener restaurante por id: %o", err);
    return res.status(500).json({ error: "Error al obtener restaurante" });
  }
}

/** POST /api/restaurantes/:id/favorito */
async function incrementarFavorito(req, res) {
  const { id } = req.params;
  const parsed = parseInt(id, 10);
  if (isNaN(parsed)) {
    return res.status(400).json({ error: "ID invalido" });
  }
  try {
    const r = await prisma.restaurante.update({
      where: { id: parsed },
      data: { favoritos: { increment: 1 } },
      select: { id: true, favoritos: true },
    });
    return res.json({ id: r.id, favoritos: r.favoritos });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Restaurante no encontrado" });
    }
    logger.error("Error al incrementar favorito: %o", error);
    return res.status(500).json({ error: "Error al incrementar favorito" });
  }
}

/** PUT /api/restaurantes/:id */
async function actualizarRestaurante(req, res) {
  const { id } = req.params;
  if (isNaN(parseInt(id, 10))) {
    return res.status(400).json({ error: "ID invalido" });
  }

  try {
    const body = { ...req.body };
    if (!body.pais) body.pais = "Espana";

    if (body.nombre !== undefined) {
      if (!body.nombre) {
        return res.status(400).json({ error: "El campo 'nombre' no puede ser vacio" });
      }
      body.slug = slugify(body.nombre);
    }

    if (body.imagenes !== undefined && !Array.isArray(body.imagenes)) {
      body.imagenes = [];
    }

    normNumberOrDelete(body, "latitud");
    normNumberOrDelete(body, "longitud");

    const coordsMissing = body.latitud === undefined || body.longitud === undefined;
    const addressTouched = ["direccion", "localidad", "ciudad", "provincia", "codigoPostal", "pais"].some(
      (f) => body[f] !== undefined
    );

    if (coordsMissing && addressTouched) {
      const geo = await geocodeAddress({
        direccion: body.direccion,
        localidad: body.localidad,
        ciudad: body.ciudad,
        provincia: body.provincia,
        codigoPostal: body.codigoPostal,
        pais: body.pais,
      });
      if (geo && Number.isFinite(geo.lat) && Number.isFinite(geo.lon)) {
        body.latitud = geo.lat;
        body.longitud = geo.lon;
      }
    }

    Object.keys(body).forEach((k) => body[k] === undefined && delete body[k]);

    const restaurante = await prisma.restaurante.update({
      where: { id: parseInt(id, 10) },
      data: body,
    });
    return res.json(restaurante);
  } catch (error) {
    if (error.code === "P2025")
      return res.status(404).json({ error: "Restaurante no encontrado" });
    if (error.code === "P2002" && error.meta?.target?.includes("slug")) {
      return res.status(409).json({ error: "Ya existe un restaurante con ese nombre (slug duplicado)" });
    }
    logger.error("Error al actualizar restaurante: %o", error);
    return res.status(500).json({ error: "Error al actualizar restaurante" });
  }
}

/** DELETE /api/restaurantes/:id */
async function eliminarRestaurante(req, res) {
  const { id } = req.params;
  if (isNaN(parseInt(id, 10)))
    return res.status(400).json({ error: "ID invalido" });

  try {
    await prisma.restaurante.delete({ where: { id: parseInt(id, 10) } });
    return res.json({ mensaje: "Restaurante eliminado correctamente" });
  } catch (error) {
    if (error.code === "P2025")
      return res.status(404).json({ error: "Restaurante no encontrado" });
    logger.error("Error al eliminar restaurante: %o", error);
    return res.status(500).json({ error: "Error al eliminar restaurante" });
  }
}

/** POST /api/restaurantes/:id/regeocode */
async function regeocodificar(req, res) {
  const { id } = req.params;
  if (isNaN(parseInt(id, 10)))
    return res.status(400).json({ error: "ID invalido" });

  try {
    const r = await prisma.restaurante.findUnique({ where: { id: parseInt(id, 10) } });
    if (!r) return res.status(404).json({ error: "Restaurante no encontrado" });

    const geo = await geocodeAddress({
      direccion: r.direccion,
      localidad: r.localidad,
      ciudad: r.ciudad,
      provincia: r.provincia,
      codigoPostal: r.codigoPostal,
      pais: r.pais || "Espana",
    });

    if (!geo) return res.status(422).json({ error: "No se pudieron obtener coordenadas" });

    const actualizado = await prisma.restaurante.update({
      where: { id: r.id },
      data: { latitud: geo.lat, longitud: geo.lon },
    });

    return res.json(actualizado);
  } catch (error) {
    logger.error("Error al re-geocodificar restaurante: %o", error);
    return res.status(500).json({ error: "Error al re-geocodificar" });
  }
}

module.exports = {
  crearRestaurante,
  obtenerRestaurantes,
  obtenerRestaurantePorId,
  actualizarRestaurante,
  eliminarRestaurante,
  regeocodificar,
  incrementarFavorito,
};
'@ | Set-Content -Path "backend\src\controllers\restaurante.controller.js" -Encoding UTF8

Write-Host "   restaurante.controller.js actualizado." -ForegroundColor Green

# ============================================================
# PASO 4 — BACKEND: restaurante.service.js con sortBy favoritos
# ============================================================
Write-Host ""
Write-Host ">> [4/9] Actualizando servicio de restaurantes (sortBy favoritos)..." -ForegroundColor Yellow

Backup-File "backend\src\services\restaurante.service.js"

@'
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
'@ | Set-Content -Path "backend\src\services\restaurante.service.js" -Encoding UTF8

Write-Host "   restaurante.service.js actualizado." -ForegroundColor Green

# ============================================================
# PASO 5 — PUBLIC: utils/favorites.ts
# ============================================================
Write-Host ""
Write-Host ">> [5/9] Creando utilidades del frontend publico..." -ForegroundColor Yellow

if (-not (Test-Path "public\src\utils")) {
    New-Item -ItemType Directory -Path "public\src\utils" -Force | Out-Null
}

@'
const STORAGE_KEY = "dch:favorites";

export function getFavorites(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function isFavorite(id: number): boolean {
  return getFavorites().includes(id);
}

export function toggleFavorite(id: number): { added: boolean } {
  const current = getFavorites();
  const isAlreadyFav = current.includes(id);
  if (isAlreadyFav) {
    const updated = current.filter((f) => f !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return { added: false };
  } else {
    const updated = [...current, id];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return { added: true };
  }
}
'@ | Set-Content -Path "public\src\utils\favorites.ts" -Encoding UTF8

Write-Host "   favorites.ts creado." -ForegroundColor Green

# ============================================================
# PASO 6 — PUBLIC: tipos actualizados con favoritos
# ============================================================
Write-Host ""
Write-Host ">> [6/9] Actualizando tipos TypeScript del frontend publico..." -ForegroundColor Yellow

Backup-File "public\src\types\index.ts"

@'
export interface Restaurante {
  id: number;
  nombre: string;
  slug: string;
  direccion: string;
  localidad: string;
  ciudad: string;
  provincia: string;
  codigoPostal?: string | null;
  pais?: string | null;
  telefonoRestaurante?: string | null;
  emailRestaurante?: string | null;
  sitioWeb?: string | null;
  imagenes: string[];
  horario?: string | null;
  descripcion: string;
  latitud?: number | null;
  longitud?: number | null;
  zonaAmplia: boolean;
  parqueCercano: boolean;
  zonaInfantil: boolean;
  tronaDisponible: boolean;
  cambiadorDisponible: boolean;
  sitioParaCarrito: boolean;
  terrazaSegura: boolean;
  actividadesParaNinos: boolean;
  menuInfantil: boolean;
  aptoVegetariano: boolean;
  aptoVegano: boolean;
  sinPantallas: boolean;
  ambienteFamiliar: boolean;
  accesibleConCarrito: boolean;
  activo: boolean;
  verificado: boolean;
  vistas: number;
  favoritos: number;
  createdAt: string;
  updatedAt: string;
}

export interface RestaurantesResponse {
  data: Restaurante[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface FiltrosRestaurante {
  q?: string;
  ciudad?: string;
  localidad?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  zonaAmplia?: boolean;
  parqueCercano?: boolean;
  zonaInfantil?: boolean;
  tronaDisponible?: boolean;
  cambiadorDisponible?: boolean;
  sitioParaCarrito?: boolean;
  terrazaSegura?: boolean;
  actividadesParaNinos?: boolean;
  menuInfantil?: boolean;
  aptoVegetariano?: boolean;
  aptoVegano?: boolean;
  sinPantallas?: boolean;
  ambienteFamiliar?: boolean;
  accesibleConCarrito?: boolean;
}

export interface SugerenciaPayload {
  nombre: string;
  direccion: string;
  localidad: string;
  ciudad: string;
  provincia: string;
  codigoPostal?: string;
  descripcion: string;
  nombreContacto: string;
  emailContacto?: string;
  comentarios?: string;
  zonaAmplia?: boolean;
  parqueCercano?: boolean;
  zonaInfantil?: boolean;
  tronaDisponible?: boolean;
  cambiadorDisponible?: boolean;
  sitioParaCarrito?: boolean;
  terrazaSegura?: boolean;
  actividadesParaNinos?: boolean;
  menuInfantil?: boolean;
  aptoVegetariano?: boolean;
  aptoVegano?: boolean;
  sinPantallas?: boolean;
  ambienteFamiliar?: boolean;
  accesibleConCarrito?: boolean;
}
'@ | Set-Content -Path "public\src\types\index.ts" -Encoding UTF8

# ============================================================
# PASO 7 — PUBLIC: servicio con endpoint favorito
# ============================================================

Backup-File "public\src\services\restauranteService.ts"

@'
import api from "./api";
import type { FiltrosRestaurante, Restaurante, RestaurantesResponse } from "../types";

export async function getRestaurantes(filtros: FiltrosRestaurante = {}): Promise<RestaurantesResponse> {
  const params: Record<string, string | number | boolean> = {};

  if (filtros.q)         params.q         = filtros.q;
  if (filtros.ciudad)    params.ciudad     = filtros.ciudad;
  if (filtros.localidad) params.localidad  = filtros.localidad;
  if (filtros.page)      params.page       = filtros.page;
  if (filtros.pageSize)  params.pageSize   = filtros.pageSize;
  if (filtros.sortBy)    params.sortBy     = filtros.sortBy;

  const boolKeys: (keyof FiltrosRestaurante)[] = [
    "zonaAmplia", "parqueCercano", "zonaInfantil", "tronaDisponible",
    "cambiadorDisponible", "sitioParaCarrito", "terrazaSegura",
    "actividadesParaNinos", "menuInfantil", "aptoVegetariano",
    "aptoVegano", "sinPantallas", "ambienteFamiliar", "accesibleConCarrito",
  ];

  for (const k of boolKeys) {
    if (filtros[k] === true) params[k] = true;
  }

  const { data } = await api.get<RestaurantesResponse>("/restaurantes", { params });
  return data;
}

export async function getRestauranteById(id: number): Promise<Restaurante> {
  const { data } = await api.get<Restaurante>(`/restaurantes/${id}`);
  return data;
}

export async function postFavorito(id: number): Promise<{ id: number; favoritos: number }> {
  const { data } = await api.post(`/restaurantes/${id}/favorito`);
  return data;
}
'@ | Set-Content -Path "public\src\services\restauranteService.ts" -Encoding UTF8

Write-Host "   Tipos y servicios actualizados." -ForegroundColor Green

# ============================================================
# PASO 8 — PUBLIC: PublicListPage.tsx — UI mejorada con favoritos y badges
# ============================================================
Write-Host ""
Write-Host ">> [7/9] Reescribiendo frontend publico (UI mejorada, favoritos, badges)..." -ForegroundColor Yellow

Backup-File "public\src\pages\PublicListPage.tsx"

@'
import { useState, useCallback, useEffect } from "react";
import { useQuery, keepPreviousData, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getRestaurantes, postFavorito } from "../services/restauranteService";
import type { FiltrosRestaurante, Restaurante } from "../types";
import { isFavorite, toggleFavorite } from "../utils/favorites";

const FILTROS_OPCIONES = [
  { key: "zonaInfantil",         label: "Zona infantil" },
  { key: "menuInfantil",         label: "Menu infantil" },
  { key: "tronaDisponible",      label: "Trona" },
  { key: "cambiadorDisponible",  label: "Cambiador" },
  { key: "sitioParaCarrito",     label: "Caben carritos" },
  { key: "terrazaSegura",        label: "Terraza segura" },
  { key: "parqueCercano",        label: "Parque cercano" },
  { key: "actividadesParaNinos", label: "Actividades" },
  { key: "zonaAmplia",           label: "Espacio amplio" },
  { key: "accesibleConCarrito",  label: "Accesible" },
  { key: "aptoVegetariano",      label: "Vegetariano" },
  { key: "aptoVegano",           label: "Vegano" },
] as const;

type FlagKey = typeof FILTROS_OPCIONES[number]["key"];

function getBadge(r: Restaurante): { label: string; color: string } | null {
  const f = r.favoritos ?? 0;
  if (f >= 50) return { label: "Top de la zona", color: "bg-red-500 text-white" };
  if (f >= 30) return { label: "Top familias", color: "bg-orange-500 text-white" };
  if (f >= 15) return { label: "Favorito familias", color: "bg-amber-400 text-white" };
  if (f >= 5)  return { label: "Recomendado", color: "bg-green-500 text-white" };

  const flagCount = [
    r.zonaInfantil, r.menuInfantil, r.tronaDisponible, r.cambiadorDisponible,
    r.sitioParaCarrito, r.terrazaSegura, r.actividadesParaNinos, r.zonaAmplia,
    r.parqueCercano, r.accesibleConCarrito, r.ambienteFamiliar,
  ].filter(Boolean).length;

  if (r.zonaInfantil && r.menuInfantil) return { label: "Ideal ninos", color: "bg-blue-500 text-white" };
  if (flagCount >= 7)                   return { label: "Perfecto familias", color: "bg-purple-500 text-white" };

  return null;
}

function FavButton({ restaurante }: { restaurante: Restaurante }) {
  const [fav, setFav] = useState(() => isFavorite(restaurante.id));
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => postFavorito(restaurante.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurantes"] });
    },
  });

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const { added } = toggleFavorite(restaurante.id);
    setFav(!fav);
    if (added) {
      mutation.mutate();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`absolute top-2 left-2 rounded-full w-8 h-8 flex items-center justify-center text-base shadow transition-all ${
        fav ? "bg-red-500 text-white scale-110" : "bg-white/90 text-slate-400 hover:text-red-400"
      }`}
      title={fav ? "Quitar de favoritos" : "Guardar como favorito"}
    >
      {fav ? "heart" : "heart"}
    </button>
  );
}

const CHIPS_VISIBLE = [
  { key: "zonaInfantil",    label: "Zona infantil" },
  { key: "menuInfantil",    label: "Menu infantil" },
  { key: "tronaDisponible", label: "Trona" },
  { key: "cambiadorDisponible", label: "Cambiador" },
  { key: "terrazaSegura",   label: "Terraza" },
  { key: "parqueCercano",   label: "Parque" },
] as const;

function RestauranteCard({ r }: { r: Restaurante }) {
  const imagen = r.imagenes?.[0];
  const mapsUrl = r.latitud && r.longitud
    ? `https://www.google.com/maps?q=${r.latitud},${r.longitud}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.nombre + " " + r.direccion + " " + r.ciudad)}`;
  const badge = getBadge(r);
  const [favLocal, setFavLocal] = useState(() => isFavorite(r.id));
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => postFavorito(r.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["restaurantes"] }),
  });

  const handleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const { added } = toggleFavorite(r.id);
    setFavLocal(!favLocal);
    if (added) mutation.mutate();
  };

  const visibleChips = CHIPS_VISIBLE.filter(c => r[c.key as keyof typeof r] === true);

  return (
    <div className="group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col">
      {/* Imagen */}
      <div className="relative h-48 bg-gradient-to-br from-orange-50 to-amber-50 overflow-hidden flex-shrink-0">
        {imagen ? (
          <img
            src={imagen}
            alt={r.nombre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1">
            <span className="text-4xl">restaurant</span>
            <span className="text-xs text-slate-400">Sin imagen</span>
          </div>
        )}

        {/* Overlay gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        {/* Badge */}
        {badge && (
          <span className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full shadow ${badge.color}`}>
            {badge.label}
          </span>
        )}

        {/* Verificado */}
        {r.verificado && !badge && (
          <span className="absolute top-3 right-3 bg-green-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow">
            Verificado
          </span>
        )}

        {/* Boton favorito */}
        <button
          onClick={handleFav}
          className={`absolute top-3 left-3 rounded-full w-8 h-8 flex items-center justify-center text-sm shadow-md transition-all border ${
            favLocal
              ? "bg-red-500 text-white border-red-500 scale-110"
              : "bg-white/90 text-slate-400 border-white hover:text-red-400"
          }`}
          title={favLocal ? "Quitar de favoritos" : "Guardar"}
        >
          {favLocal ? "+" : "-"}
        </button>

        {/* Favoritos counter */}
        {(r.favoritos ?? 0) > 0 && (
          <div className="absolute bottom-2 right-3 flex items-center gap-0.5 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
            <span>fav</span>
            <span>{r.favoritos}</span>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4 flex flex-col flex-1">
        <div className="mb-2">
          <h2 className="font-bold text-slate-800 text-base leading-tight line-clamp-1">{r.nombre}</h2>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
            <span>pin</span>
            {r.localidad}, {r.ciudad}
          </p>
        </div>

        <p className="text-sm text-slate-500 line-clamp-2 mb-3 leading-relaxed">{r.descripcion}</p>

        {/* Chips caracteristicas */}
        {visibleChips.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {visibleChips.map(c => (
              <span key={c.key} className="text-[11px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full border border-orange-100 font-medium">
                {c.label}
              </span>
            ))}
          </div>
        )}

        {/* Botones */}
        <div className="mt-auto flex gap-2">
          <Link
            to={`/restaurante/${r.id}`}
            className="flex-1 text-center bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
          >
            Ver detalles
          </Link>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2.5 border border-slate-200 rounded-xl text-slate-500 hover:text-orange-600 hover:border-orange-200 hover:bg-orange-50 transition-all text-xs font-medium"
          >
            <span>map</span>
            <span className="hidden sm:inline">Maps</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default function PublicListPage() {
  const [search, setSearch]       = useState("");
  const [ciudad, setCiudad]       = useState("");
  const [page, setPage]           = useState(1);
  const [activeFlags, setActiveFlags] = useState<Partial<Record<FlagKey, boolean>>>({});
  const [searchInput, setSearchInput] = useState("");
  const [favCount, setFavCount]   = useState(0);

  useEffect(() => {
    const { getFavorites } = require("../utils/favorites");
    setFavCount(getFavorites().length);
  }, []);

  const filtros: FiltrosRestaurante = {
    q: search || undefined,
    ciudad: ciudad || undefined,
    page,
    pageSize: 12,
    sortBy: "favoritos_desc",
    ...activeFlags,
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["restaurantes", filtros],
    queryFn: () => getRestaurantes(filtros),
    placeholderData: keepPreviousData,
  });

  const toggleFlag = useCallback((key: FlagKey) => {
    setActiveFlags(prev => {
      const next = { ...prev };
      if (next[key]) delete next[key];
      else next[key] = true;
      return next;
    });
    setPage(1);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const restaurantes = data?.data ?? [];
  const meta = data?.meta;
  const hasFilters = Object.keys(activeFlags).length > 0 || search || ciudad;

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      {/* Hero */}
      <section className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mb-3 leading-tight">
          Encuentra donde comer
          <span className="text-orange-500"> en familia</span>
        </h1>
        <p className="text-slate-500 text-base max-w-md mx-auto">
          Restaurantes comodas, espaciosos y divertidos para ir con ninos.
        </p>
        {favCount > 0 && (
          <p className="text-sm text-orange-500 font-medium mt-2">
            Tienes {favCount} favorito{favCount !== 1 ? "s" : ""} guardado{favCount !== 1 ? "s" : ""}
          </p>
        )}
      </section>

      {/* Buscador */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-5">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Buscar restaurante o zona..."
            className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
          />
          <input
            type="text"
            value={ciudad}
            onChange={e => { setCiudad(e.target.value); setPage(1); }}
            placeholder="Ciudad"
            className="w-28 sm:w-36 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
          />
        </div>
        <button
          type="submit"
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors whitespace-nowrap"
        >
          Buscar
        </button>
      </form>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-8">
        {FILTROS_OPCIONES.map(({ key, label }) => {
          const isOn = !!activeFlags[key];
          return (
            <button
              key={key}
              onClick={() => toggleFlag(key)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                isOn
                  ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:border-orange-300 hover:text-orange-600"
              }`}
            >
              {label}
            </button>
          );
        })}
        {hasFilters && (
          <button
            onClick={() => { setActiveFlags({}); setSearch(""); setSearchInput(""); setCiudad(""); setPage(1); }}
            className="text-xs text-slate-400 hover:text-red-500 px-2 py-1.5 transition-colors"
          >
            Limpiar todo
          </button>
        )}
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="h-48 bg-slate-100 animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-slate-100 rounded animate-pulse w-1/2" />
                <div className="h-3 bg-slate-100 rounded animate-pulse" />
                <div className="h-3 bg-slate-100 rounded animate-pulse w-5/6" />
              </div>
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <p className="text-3xl mb-3">error</p>
          <p className="text-slate-500 font-medium">No se pudo conectar con el servidor</p>
          <p className="text-sm text-slate-400 mt-1">Comprueba que el backend esta arrancado en el puerto 3000</p>
        </div>
      )}

      {!isLoading && !isError && restaurantes.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <p className="text-3xl mb-3">search</p>
          <p className="text-slate-600 font-medium">No encontramos restaurantes</p>
          <p className="text-sm text-slate-400 mt-1">Prueba cambiando los filtros o la ciudad</p>
          <Link to="/sugerir" className="mt-5 inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2 rounded-xl text-sm transition-colors">
            Sugerir un restaurante
          </Link>
        </div>
      )}

      {!isLoading && !isError && restaurantes.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-500">
              {meta?.total ?? 0} restaurante{(meta?.total ?? 0) !== 1 ? "s" : ""}
              {hasFilters ? " con estos filtros" : ""}
            </p>
            <p className="text-xs text-slate-400">Ordenados por popularidad</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {restaurantes.map(r => <RestauranteCard key={r.id} r={r} />)}
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-10">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium disabled:opacity-40 hover:border-orange-300 hover:text-orange-600 transition-colors bg-white"
              >
                Anterior
              </button>
              <span className="text-sm text-slate-500">
                Pagina {page} de {meta.totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                disabled={page >= meta.totalPages}
                className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium disabled:opacity-40 hover:border-orange-300 hover:text-orange-600 transition-colors bg-white"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}

      {/* CTA */}
      <section className="mt-16 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-2xl p-8 text-center">
        <p className="text-2xl mb-2">share</p>
        <h2 className="font-bold text-slate-800 text-lg mb-2">
          Conoces un restaurante genial para familias?
        </h2>
        <p className="text-slate-500 text-sm mb-5">
          Cuentanoslo y lo revisamos. Si cumple los criterios, lo publicamos.
        </p>
        <Link
          to="/sugerir"
          className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
        >
          Sugerir restaurante
        </Link>
      </section>
    </main>
  );
}
'@ | Set-Content -Path "public\src\pages\PublicListPage.tsx" -Encoding UTF8

Write-Host "   PublicListPage.tsx actualizado." -ForegroundColor Green

# ============================================================
# PASO 9 — PUBLIC: PublicDetailPage.tsx mejorada con favorito
# ============================================================

Backup-File "public\src\pages\PublicDetailPage.tsx"

@'
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRestauranteById, postFavorito } from "../services/restauranteService";
import { isFavorite, toggleFavorite } from "../utils/favorites";

const CARACTERISTICAS = [
  { key: "zonaInfantil",         label: "Zona infantil" },
  { key: "menuInfantil",         label: "Menu infantil" },
  { key: "tronaDisponible",      label: "Trona disponible" },
  { key: "cambiadorDisponible",  label: "Cambiador de panales" },
  { key: "sitioParaCarrito",     label: "Caben carritos" },
  { key: "terrazaSegura",        label: "Terraza segura" },
  { key: "parqueCercano",        label: "Parque cercano" },
  { key: "actividadesParaNinos", label: "Actividades para ninos" },
  { key: "zonaAmplia",           label: "Espacio amplio" },
  { key: "accesibleConCarrito",  label: "Accesible con carrito" },
  { key: "ambienteFamiliar",     label: "Ambiente familiar" },
  { key: "sinPantallas",         label: "Sin pantallas" },
  { key: "aptoVegetariano",      label: "Opciones vegetarianas" },
  { key: "aptoVegano",           label: "Opciones veganas" },
] as const;

export default function PublicDetailPage() {
  const { id } = useParams<{ id: string }>();
  const numId = Number(id);
  const queryClient = useQueryClient();
  const [favLocal, setFavLocal] = useState(() => isFavorite(numId));

  const { data: r, isLoading, isError } = useQuery({
    queryKey: ["restaurante", numId],
    queryFn: () => getRestauranteById(numId),
    enabled: !isNaN(numId),
  });

  const mutation = useMutation({
    mutationFn: () => postFavorito(numId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurante", numId] });
    },
  });

  const handleFav = () => {
    const { added } = toggleFavorite(numId);
    setFavLocal(!favLocal);
    if (added) mutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="h-72 bg-slate-100 rounded-2xl animate-pulse mb-6" />
        <div className="space-y-3">
          <div className="h-7 bg-slate-100 rounded w-2/3 animate-pulse" />
          <div className="h-4 bg-slate-100 rounded w-1/3 animate-pulse" />
          <div className="h-4 bg-slate-100 rounded animate-pulse" />
          <div className="h-4 bg-slate-100 rounded w-5/6 animate-pulse" />
        </div>
      </div>
    );
  }

  if (isError || !r) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-600 font-medium mb-4">Restaurante no encontrado.</p>
        <Link to="/" className="text-orange-500 font-semibold hover:underline text-sm">
          Volver al listado
        </Link>
      </div>
    );
  }

  const mapsUrl = r.latitud && r.longitud
    ? `https://www.google.com/maps?q=${r.latitud},${r.longitud}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.nombre + " " + r.direccion + " " + r.ciudad)}`;

  const chips = CARACTERISTICAS.filter(c => r[c.key as keyof typeof r] === true);

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-orange-500 mb-6 transition-colors">
        Volver al listado
      </Link>

      {/* Imagen */}
      <div className="rounded-2xl overflow-hidden h-64 sm:h-80 mb-6 bg-gradient-to-br from-orange-50 to-amber-50 relative">
        {r.imagenes && r.imagenes.length > 0 ? (
          <img
            src={r.imagenes[0]}
            alt={r.nombre}
            className="w-full h-full object-cover"
            onError={(e) => {
              const el = e.currentTarget;
              el.style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-400">
            <span className="text-5xl">restaurant</span>
            <span className="text-sm">Sin imagen disponible</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>

      {/* Cabecera con favorito */}
      <div className="mb-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 leading-tight">{r.nombre}</h1>
            <p className="text-slate-400 text-sm mt-1">
              {r.direccion}, {r.localidad}, {r.ciudad}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {r.verificado && (
              <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full border border-green-200">
                Verificado
              </span>
            )}
            <button
              onClick={handleFav}
              className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl border transition-all ${
                favLocal
                  ? "bg-red-50 text-red-500 border-red-200"
                  : "bg-white text-slate-500 border-slate-200 hover:border-red-200 hover:text-red-400"
              }`}
            >
              {favLocal ? "Guardado" : "Guardar"}
            </button>
          </div>
        </div>
        {(r.favoritos ?? 0) > 0 && (
          <p className="text-sm text-orange-500 font-medium mt-2">
            {r.favoritos} {r.favoritos === 1 ? "familia lo ha guardado" : "familias lo han guardado"}
          </p>
        )}
      </div>

      {/* Descripcion */}
      <p className="text-slate-600 leading-relaxed mb-6 text-base">{r.descripcion}</p>

      {/* Chips */}
      {chips.length > 0 && (
        <section className="mb-6">
          <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wide mb-3">
            Por que es ideal para familias
          </h2>
          <div className="flex flex-wrap gap-2">
            {chips.map(c => (
              <span key={c.key} className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-700 text-sm font-medium px-3 py-1.5 rounded-full border border-orange-100">
                {c.label}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Info */}
      <section className="bg-slate-50 rounded-2xl p-5 mb-6 space-y-3">
        {r.horario && (
          <div className="flex gap-3 text-sm items-start">
            <span className="text-slate-400 w-4 flex-shrink-0">clock</span>
            <span className="text-slate-600">{r.horario}</span>
          </div>
        )}
        {r.telefonoRestaurante && (
          <div className="flex gap-3 text-sm items-center">
            <span className="text-slate-400 w-4 flex-shrink-0">tel</span>
            <a href={`tel:${r.telefonoRestaurante}`} className="text-orange-500 hover:underline font-medium">
              {r.telefonoRestaurante}
            </a>
          </div>
        )}
        {r.emailRestaurante && (
          <div className="flex gap-3 text-sm items-center">
            <span className="text-slate-400 w-4 flex-shrink-0">mail</span>
            <a href={`mailto:${r.emailRestaurante}`} className="text-orange-500 hover:underline">
              {r.emailRestaurante}
            </a>
          </div>
        )}
        {r.sitioWeb && (
          <div className="flex gap-3 text-sm items-center">
            <span className="text-slate-400 w-4 flex-shrink-0">web</span>
            <a href={r.sitioWeb} target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">
              Visitar sitio web
            </a>
          </div>
        )}
      </section>

      {/* Botones */}
      <div className="flex flex-col sm:flex-row gap-3">
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-center bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          Abrir en Google Maps
        </a>
        <Link
          to="/"
          className="flex-1 text-center border border-slate-200 hover:border-orange-300 text-slate-600 hover:text-orange-600 font-semibold py-3 rounded-xl transition-colors bg-white"
        >
          Ver mas restaurantes
        </Link>
      </div>
    </main>
  );
}
'@ | Set-Content -Path "public\src\pages\PublicDetailPage.tsx" -Encoding UTF8

Write-Host "   PublicDetailPage.tsx actualizado." -ForegroundColor Green

# ============================================================
# DASHBOARD: sugerenciaService con rechazar+motivo
# ============================================================
Write-Host ""
Write-Host ">> [8/9] Actualizando dashboard (sugerencias + HomePage)..." -ForegroundColor Yellow

Backup-File "dashboard\src\services\sugerenciaService.ts"

@'
// src/services/sugerenciaService.ts
import api from "./api";

export type Estado = "PENDIENTE" | "APROBADA" | "RECHAZADA" | "DUPLICADA";

export type Sugerencia = {
  id: number;
  nombre: string;
  slug: string;
  direccion: string;
  localidad: string;
  ciudad: string;
  provincia: string;
  codigoPostal?: string | null;
  pais?: string | null;
  descripcion: string;
  nombreContacto: string;
  emailContacto?: string | null;
  comentarios?: string | null;
  zonaAmplia: boolean;
  parqueCercano: boolean;
  zonaInfantil: boolean;
  tronaDisponible: boolean;
  cambiadorDisponible: boolean;
  sitioParaCarrito: boolean;
  terrazaSegura: boolean;
  actividadesParaNinos: boolean;
  menuInfantil: boolean;
  aptoVegetariano: boolean;
  aptoVegano: boolean;
  sinPantallas: boolean;
  ambienteFamiliar: boolean;
  accesibleConCarrito: boolean;
  latitud?: number | null;
  longitud?: number | null;
  estado: Estado;
  creadaEn: string;
  procesadaEn?: string | null;
  restauranteId?: number | null;
};

export type SugerenciasResponse = {
  data: Sugerencia[];
  meta: { total: number; page: number; pageSize: number; pages: number };
};

export async function getSugerencias(params: {
  page?: number;
  pageSize?: number;
  estado?: Estado;
  search?: string;
}) {
  const { data } = await api.get<SugerenciasResponse>("/sugerencias", { params });
  return data;
}

export async function updateSugerenciaEstado(id: number, estado: Estado) {
  const { data } = await api.patch<Sugerencia>(`/sugerencias/${id}`, { estado });
  return data;
}

export async function rechazarSugerencia(id: number, motivo?: string) {
  const { data } = await api.patch<Sugerencia>(`/sugerencias/${id}`, {
    estado: "RECHAZADA",
    motivoRechazo: motivo || "",
  });
  return data;
}

export async function aprobarSugerencia(id: number) {
  const { data } = await api.post<{ mensaje: string; restaurante: any }>(
    `/sugerencias/${id}/aprobar`
  );
  return data;
}
'@ | Set-Content -Path "dashboard\src\services\sugerenciaService.ts" -Encoding UTF8

# ============================================================
# DASHBOARD: restauranteService con favoritos en tipo
# ============================================================

Backup-File "dashboard\src\services\restauranteService.ts"

# Leer el archivo actual y agregar favoritos al tipo
$rsContent = Get-Content "dashboard\src\services\restauranteService.ts" -Raw -Encoding UTF8
if ($rsContent -notmatch "favoritos") {
    $rsContent = $rsContent -replace "(  vistas: number;)", "  vistas: number;`n  favoritos: number;"
    $rsContent | Set-Content "dashboard\src\services\restauranteService.ts" -Encoding UTF8
    Write-Host "   restauranteService.ts: campo favoritos anadido al tipo." -ForegroundColor Green
} else {
    Write-Host "   restauranteService.ts: favoritos ya existe." -ForegroundColor Gray
}

# ============================================================
# DASHBOARD: SugerenciasPage mejorada con rechazo+motivo y auto-close
# ============================================================

Backup-File "dashboard\src\pages\SugerenciasPage.tsx"

@'
// dashboard/src/pages/SugerenciasPage.tsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSugerencias,
  aprobarSugerencia,
  rechazarSugerencia,
  type Sugerencia,
  type Estado,
} from "../services/sugerenciaService";

const ESTADO_LABELS: Record<Estado, string> = {
  PENDIENTE: "Pendiente",
  APROBADA: "Aprobada",
  RECHAZADA: "Rechazada",
  DUPLICADA: "Duplicada",
};

const ESTADO_COLORS: Record<Estado, string> = {
  PENDIENTE: "bg-yellow-100 text-yellow-800",
  APROBADA: "bg-green-100 text-green-800",
  RECHAZADA: "bg-red-100 text-red-800",
  DUPLICADA: "bg-gray-100 text-gray-700",
};

const FLAG_LABELS: Record<string, string> = {
  zonaAmplia: "Zona amplia",
  parqueCercano: "Parque cercano",
  zonaInfantil: "Zona infantil",
  tronaDisponible: "Trona",
  cambiadorDisponible: "Cambiador",
  sitioParaCarrito: "Sitio carrito",
  terrazaSegura: "Terraza segura",
  actividadesParaNinos: "Actividades ninos",
  menuInfantil: "Menu infantil",
  aptoVegetariano: "Vegetariano",
  aptoVegano: "Vegano",
  sinPantallas: "Sin pantallas",
  ambienteFamiliar: "Ambiente familiar",
  accesibleConCarrito: "Accesible carrito",
};

const FLAG_KEYS = Object.keys(FLAG_LABELS);

function SugerenciaDetalle({
  s,
  onClose,
}: {
  s: Sugerencia;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [motivo, setMotivo] = useState("");
  const [showMotivoInput, setShowMotivoInput] = useState(false);

  const aprobar = useMutation({
    mutationFn: () => aprobarSugerencia(s.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sugerencias"] });
      onClose();
    },
  });

  const rechazar = useMutation({
    mutationFn: () => rechazarSugerencia(s.id, motivo),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sugerencias"] });
      onClose();
    },
  });

  const flags = FLAG_KEYS.filter((k) => s[k as keyof Sugerencia] === true);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white rounded-t-2xl">
          <div>
            <h2 className="font-bold text-slate-800 text-lg">{s.nombre}</h2>
            <p className="text-xs text-slate-400">{s.ciudad} — {new Date(s.creadaEn).toLocaleDateString("es-ES")}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl font-bold w-8 h-8 flex items-center justify-center">
            x
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-1">Descripcion</p>
            <p className="text-sm text-slate-600 leading-relaxed">{s.descripcion}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-slate-400 font-medium mb-0.5">Direccion</p>
              <p className="text-slate-700">{s.direccion}</p>
              <p className="text-slate-500 text-xs">{s.localidad}, {s.ciudad}, {s.provincia}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium mb-0.5">Contacto</p>
              <p className="text-slate-700">{s.nombreContacto}</p>
              {s.emailContacto && <p className="text-slate-500 text-xs">{s.emailContacto}</p>}
            </div>
          </div>

          {flags.length > 0 && (
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-2">Caracteristicas</p>
              <div className="flex flex-wrap gap-1.5">
                {flags.map((k) => (
                  <span key={k} className="text-xs bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full border border-orange-100">
                    {FLAG_LABELS[k]}
                  </span>
                ))}
              </div>
            </div>
          )}

          {s.comentarios && (
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-1">Comentarios</p>
              <p className="text-sm text-slate-600 italic">{s.comentarios}</p>
            </div>
          )}

          {/* Acciones */}
          {s.estado === "PENDIENTE" && (
            <div className="pt-2 space-y-3">
              {!showMotivoInput ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => aprobar.mutate()}
                    disabled={aprobar.isPending}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
                  >
                    {aprobar.isPending ? "Aprobando..." : "Aprobar y publicar"}
                  </button>
                  <button
                    onClick={() => setShowMotivoInput(true)}
                    className="flex-1 border border-red-200 text-red-600 hover:bg-red-50 font-semibold py-2.5 rounded-xl text-sm transition-colors"
                  >
                    Rechazar
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-600 block">
                    Motivo del rechazo {s.emailContacto ? "(se guardara para el contacto)" : ""}
                  </label>
                  <textarea
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    placeholder="Describe brevemente por que se rechaza..."
                    rows={3}
                    className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => rechazar.mutate()}
                      disabled={rechazar.isPending}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
                    >
                      {rechazar.isPending ? "Rechazando..." : "Confirmar rechazo"}
                    </button>
                    <button
                      onClick={() => setShowMotivoInput(false)}
                      className="px-4 border rounded-xl text-sm text-slate-500 hover:bg-slate-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {(aprobar.isError || rechazar.isError) && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-xl">
                  Error al procesar la sugerencia. Intenta de nuevo.
                </p>
              )}
            </div>
          )}

          {s.estado !== "PENDIENTE" && (
            <div className={`text-sm font-medium px-4 py-2.5 rounded-xl text-center ${ESTADO_COLORS[s.estado]}`}>
              Sugerencia {ESTADO_LABELS[s.estado].toLowerCase()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SugerenciasPage() {
  const [page, setPage] = useState(1);
  const [estadoFiltro, setEstadoFiltro] = useState<Estado | "">("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Sugerencia | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["sugerencias", page, estadoFiltro, search],
    queryFn: () =>
      getSugerencias({
        page,
        pageSize: 20,
        estado: estadoFiltro || undefined,
        search: search || undefined,
      }),
    staleTime: 10_000,
  });

  const sugerencias = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800">Sugerencias</h1>
        {meta && (
          <span className="text-sm text-slate-500">{meta.total} en total</span>
        )}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 w-48"
        />
        <select
          value={estadoFiltro}
          onChange={(e) => { setEstadoFiltro(e.target.value as Estado | ""); setPage(1); }}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 bg-white"
        >
          <option value="">Todos los estados</option>
          <option value="PENDIENTE">Pendientes</option>
          <option value="APROBADA">Aprobadas</option>
          <option value="RECHAZADA">Rechazadas</option>
          <option value="DUPLICADA">Duplicadas</option>
        </select>
      </div>

      {/* Lista */}
      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && sugerencias.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          No hay sugerencias con estos filtros.
        </div>
      )}

      {!isLoading && sugerencias.length > 0 && (
        <div className="space-y-2">
          {sugerencias.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelected(s)}
              className="w-full text-left rounded-xl border bg-white hover:shadow-sm hover:border-orange-200 transition-all p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-800 truncate">{s.nombre}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${ESTADO_COLORS[s.estado]}`}>
                      {ESTADO_LABELS[s.estado]}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {s.ciudad} &middot; {s.nombreContacto} &middot; {new Date(s.creadaEn).toLocaleDateString("es-ES")}
                  </p>
                </div>
                <span className="text-slate-300 text-sm flex-shrink-0">Ver</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Paginacion */}
      {meta && meta.pages > 1 && (
        <div className="flex justify-center items-center gap-3 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-4 py-2 rounded-xl border text-sm disabled:opacity-40 hover:bg-slate-50"
          >
            Anterior
          </button>
          <span className="text-sm text-slate-500">
            {page} / {meta.pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(meta.pages, p + 1))}
            disabled={page >= meta.pages}
            className="px-4 py-2 rounded-xl border text-sm disabled:opacity-40 hover:bg-slate-50"
          >
            Siguiente
          </button>
        </div>
      )}

      {/* Modal detalle */}
      {selected && (
        <SugerenciaDetalle s={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
'@ | Set-Content -Path "dashboard\src\pages\SugerenciasPage.tsx" -Encoding UTF8

Write-Host "   SugerenciasPage.tsx actualizado." -ForegroundColor Green

# ============================================================
# DASHBOARD: HomePage mejorada con card "mas favorito"
# ============================================================

Backup-File "dashboard\src\pages\HomePage.tsx"

@'
// dashboard/src/pages/HomePage.tsx
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getRestaurantes, type RestaurantesResponse } from "../services/restauranteService";
import { getSugerencias, type SugerenciasResponse } from "../services/sugerenciaService";

function StatCard({
  label, value, sub, to, accent = false, loading,
}: {
  label: string; value: string; sub?: string; to?: string; accent?: boolean; loading?: boolean;
}) {
  const inner = (
    <div className={`rounded-2xl p-5 border shadow-sm hover:shadow-md transition-all ${accent ? "bg-orange-50 border-orange-100" : "bg-white"}`}>
      <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">{label}</p>
      {loading ? (
        <div className="h-8 w-24 bg-slate-100 rounded animate-pulse mt-1" />
      ) : (
        <>
          <p className="text-3xl font-extrabold text-slate-800">{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </>
      )}
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : inner;
}

export default function HomePage() {
  const totalQ = useQuery<RestaurantesResponse>({
    queryKey: ["home-total"],
    queryFn: () => getRestaurantes({ page: 1, pageSize: 1 }),
    staleTime: 30_000,
  });

  const coordsQ = useQuery<RestaurantesResponse>({
    queryKey: ["home-coords"],
    queryFn: () => getRestaurantes({ page: 1, pageSize: 1, onlyWithCoords: true } as any),
    staleTime: 30_000,
  });

  const pendingQ = useQuery<SugerenciasResponse>({
    queryKey: ["home-pending"],
    queryFn: () => getSugerencias({ page: 1, pageSize: 1, estado: "PENDIENTE" }),
    staleTime: 30_000,
  });

  const topFavQ = useQuery<RestaurantesResponse>({
    queryKey: ["home-top-fav"],
    queryFn: () => getRestaurantes({ page: 1, pageSize: 1, sortBy: "favoritos_desc" } as any),
    staleTime: 30_000,
  });

  const total = totalQ.data?.meta?.total ?? 0;
  const withCoords = coordsQ.data?.meta?.total ?? 0;
  const pendientes = pendingQ.data?.meta?.total ?? 0;
  const topFav = topFavQ.data?.data?.[0];

  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Panel de control</h1>
        <p className="text-slate-400 text-sm mt-0.5">Resumen de Donde Comemos Hoy</p>
      </div>

      {/* Stats principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Restaurantes"
          value={String(total)}
          sub="En base de datos"
          loading={totalQ.isLoading}
          to="/restaurantes"
        />
        <StatCard
          label="Sugerencias pendientes"
          value={String(pendientes)}
          sub={pendientes > 0 ? "Por revisar" : "Al dia"}
          loading={pendingQ.isLoading}
          to="/sugerencias"
          accent={pendientes > 0}
        />
        <StatCard
          label="Con coordenadas"
          value={`${withCoords} / ${total}`}
          sub={total > 0 ? `${Math.round((withCoords / total) * 100)}% listos para mapa` : "Sin datos"}
          loading={coordsQ.isLoading || totalQ.isLoading}
        />
        <StatCard
          label="Sin coordenadas"
          value={String(Math.max(0, total - withCoords))}
          sub="Pendientes de geocodificar"
          loading={coordsQ.isLoading || totalQ.isLoading}
        />
      </div>

      {/* Top favorito */}
      {topFav && !topFavQ.isLoading && (topFav.favoritos ?? 0) > 0 && (
        <section>
          <h2 className="font-semibold text-slate-700 mb-3">Restaurante mas popular</h2>
          <div className="bg-white rounded-2xl border p-4 flex items-center gap-4 hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
              top
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-800 truncate">{topFav.nombre}</p>
              <p className="text-xs text-slate-400">{topFav.ciudad}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-bold text-orange-500 text-lg">{topFav.favoritos}</p>
              <p className="text-xs text-slate-400">favoritos</p>
            </div>
          </div>
        </section>
      )}

      {/* Acceso rapido */}
      <section>
        <h2 className="font-semibold text-slate-700 mb-3">Acceso rapido</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link to="/restaurantes/nuevo" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm py-3 rounded-xl text-center transition-colors">
            + Nuevo restaurante
          </Link>
          <Link to="/sugerencias" className="bg-white border border-slate-200 hover:border-orange-200 text-slate-700 font-semibold text-sm py-3 rounded-xl text-center transition-colors">
            Ver sugerencias
          </Link>
          <Link to="/restaurantes" className="bg-white border border-slate-200 hover:border-orange-200 text-slate-700 font-semibold text-sm py-3 rounded-xl text-center transition-colors">
            Ver restaurantes
          </Link>
        </div>
      </section>
    </div>
  );
}
'@ | Set-Content -Path "dashboard\src\pages\HomePage.tsx" -Encoding UTF8

Write-Host "   HomePage.tsx actualizado." -ForegroundColor Green

# ============================================================
# EXTRA A — BACKEND: sugerencia.controller.js con motivoRechazo
# ============================================================
Write-Host ""
Write-Host ">> [Extra A] Actualizando sugerencia.controller.js (motivoRechazo)..." -ForegroundColor Yellow

Backup-File "backend\src\controllers\sugerencia.controller.js"

@'
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

// PATCH estado — acepta motivoRechazo opcional
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

// POST aprobar — convierte sugerencia en restaurante
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
'@ | Set-Content -Path "backend\src\controllers\sugerencia.controller.js" -Encoding UTF8

Write-Host "   sugerencia.controller.js actualizado." -ForegroundColor Green

# ============================================================
# EXTRA B — BACKEND: sugerencia.service.js — actualizarEstado con datos extra
# ============================================================
Write-Host ""
Write-Host ">> [Extra B] Actualizando sugerencia.service.js..." -ForegroundColor Yellow

Backup-File "backend\src\services\sugerencia.service.js"

@'
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

// Cambiar estado — acepta datos extra (motivoRechazo, procesadaEn, etc)
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
'@ | Set-Content -Path "backend\src\services\sugerencia.service.js" -Encoding UTF8

Write-Host "   sugerencia.service.js actualizado." -ForegroundColor Green

# ============================================================
# EXTRA C — DASHBOARD: RestaurantesPage con columna favoritos
# ============================================================
Write-Host ""
Write-Host ">> [Extra C] Actualizando RestaurantesPage del dashboard..." -ForegroundColor Yellow

Backup-File "dashboard\src\pages\RestaurantesPage.tsx"

@'
// dashboard/src/pages/RestaurantesPage.tsx
import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getRestaurantes,
  deleteRestaurante,
  type Restaurante,
  type RestaurantesResponse,
} from "../services/restauranteService";
import FiltersBar, { type Filters, type FamilyFlags, type SortKey } from "../components/FiltersBar";
import Map, { type MarkerItem } from "../components/map";

const DEFAULT_FLAGS: FamilyFlags = {
  zonaAmplia: false, parqueCercano: false, zonaInfantil: false,
  tronaDisponible: false, cambiadorDisponible: false, sitioParaCarrito: false,
  terrazaSegura: false, actividadesParaNinos: false, menuInfantil: false,
  aptoVegetariano: false, aptoVegano: false, sinPantallas: false,
  ambienteFamiliar: false, accesibleConCarrito: false,
};

const INITIAL_FILTERS: Filters = {
  q: "", ciudad: "", onlyWithCoords: false, matchMode: "all",
  flags: DEFAULT_FLAGS, sortBy: "nombre_asc",
};

const PAGE_SIZE = 15;

function buildParams(filters: Filters, page: number) {
  const p: Record<string, unknown> = {
    page, pageSize: PAGE_SIZE,
    sortBy: filters.sortBy,
  };
  if (filters.q)        p.q             = filters.q;
  if (filters.ciudad)   p.ciudad        = filters.ciudad;
  if (filters.onlyWithCoords) p.onlyWithCoords = true;
  if (filters.matchMode !== "all") p.matchMode = filters.matchMode;
  Object.entries(filters.flags).forEach(([k, v]) => { if (v) p[k] = true; });
  return p;
}

export default function RestaurantesPage() {
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);
  const [page, setPage] = useState(1);
  const [showMap, setShowMap] = useState(false);

  const setFiltersAndReset = useCallback(
    (updater: (prev: Filters) => Filters) => {
      setFilters(updater);
      setPage(1);
    },
    []
  );

  const qc = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery<RestaurantesResponse>({
    queryKey: ["restaurantes-admin", filters, page],
    queryFn: () => getRestaurantes(buildParams(filters, page)),
    staleTime: 15_000,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRestaurante,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["restaurantes-admin"] }),
  });

  const restaurantes = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;

  // Ciudades para el selector del filtro
  const ciudades = [...new Set(restaurantes.map((r) => r.ciudad).filter(Boolean))].sort();

  // Items para el mapa
  const mapItems: MarkerItem[] = restaurantes
    .filter((r) => r.latitud != null && r.longitud != null)
    .map((r) => ({
      id: r.id, nombre: r.nombre,
      latitud: r.latitud!, longitud: r.longitud!,
      direccion: r.direccion, ciudad: r.ciudad,
    }));

  const handleDelete = (r: Restaurante) => {
    if (!confirm(`Eliminar "${r.nombre}"? Esta accion no se puede deshacer.`)) return;
    deleteMutation.mutate(r.id);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Restaurantes</h1>
          {meta && (
            <p className="text-sm text-slate-400 mt-0.5">{meta.total} en total</p>
          )}
        </div>
        <Link
          to="/restaurantes/nuevo"
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-colors"
        >
          + Nuevo
        </Link>
      </div>

      {/* Filtros */}
      <FiltersBar
        filters={filters}
        setFilters={setFiltersAndReset}
        ciudades={ciudades}
        onRefetch={() => refetch()}
        showMap={showMap}
        setShowMap={setShowMap}
      />

      {/* Mapa */}
      {showMap && mapItems.length > 0 && <Map items={mapItems} />}

      {/* Errores */}
      {isError && (
        <div className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-200">
          Error al cargar restaurantes. Comprueba la conexion con el backend.
        </div>
      )}

      {/* Tabla */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : restaurantes.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">
          No hay restaurantes con estos filtros.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                <th className="text-left px-4 py-3 font-semibold">Nombre</th>
                <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Ciudad</th>
                <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Localidad</th>
                <th className="text-center px-4 py-3 font-semibold">Fav</th>
                <th className="text-center px-4 py-3 font-semibold hidden sm:table-cell">Mapa</th>
                <th className="text-center px-4 py-3 font-semibold hidden sm:table-cell">Estado</th>
                <th className="text-right px-4 py-3 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {restaurantes.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800 truncate max-w-[180px]">{r.nombre}</p>
                    <p className="text-xs text-slate-400">{r.direccion?.substring(0, 40)}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-slate-600">{r.ciudad}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-slate-500">{r.localidad}</td>

                  {/* Columna Favoritos */}
                  <td className="px-4 py-3 text-center">
                    {(r.favoritos ?? 0) > 0 ? (
                      <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full">
                        {r.favoritos}
                      </span>
                    ) : (
                      <span className="text-slate-300 text-xs">—</span>
                    )}
                  </td>

                  {/* Mapa */}
                  <td className="px-4 py-3 text-center hidden sm:table-cell">
                    {r.latitud && r.longitud ? (
                      <span className="text-green-500 text-xs font-medium">OK</span>
                    ) : (
                      <span className="text-slate-300 text-xs">Sin coords</span>
                    )}
                  </td>

                  {/* Estado */}
                  <td className="px-4 py-3 text-center hidden sm:table-cell">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      r.activo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {r.activo ? "Activo" : "Inactivo"}
                    </span>
                    {r.verificado && (
                      <span className="ml-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        Ver.
                      </span>
                    )}
                  </td>

                  {/* Acciones */}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        to={`/restaurantes/${r.id}/editar`}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium hover:bg-slate-50 transition-colors"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(r)}
                        disabled={deleteMutation.isPending}
                        className="px-3 py-1.5 rounded-lg border border-red-200 text-red-500 text-xs font-medium hover:bg-red-50 transition-colors disabled:opacity-40"
                      >
                        Borrar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginacion */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-4 py-2 rounded-xl border text-sm disabled:opacity-40 hover:bg-slate-50 transition-colors"
          >
            Anterior
          </button>
          <span className="text-sm text-slate-500">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-4 py-2 rounded-xl border text-sm disabled:opacity-40 hover:bg-slate-50 transition-colors"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
'@ | Set-Content -Path "dashboard\src\pages\RestaurantesPage.tsx" -Encoding UTF8

Write-Host "   RestaurantesPage.tsx actualizado con columna favoritos." -ForegroundColor Green

# ============================================================
# EXTRA D — PUBLIC: index.css sin Google Fonts (evita error CORS/lentitud)
# ============================================================
Write-Host ""
Write-Host ">> [Extra D] Arreglando public/src/index.css..." -ForegroundColor Yellow

Backup-File "public\src\index.css"

@'
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    @apply bg-slate-50 text-slate-800 min-h-screen;
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  }
}

@layer utilities {
  .line-clamp-1 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}
'@ | Set-Content -Path "public\src\index.css" -Encoding UTF8

Write-Host "   index.css arreglado (sin dependencia de Google Fonts)." -ForegroundColor Green

# ============================================================
# EXTRA E — PUBLIC: App.tsx con footer y rutas correctas
# ============================================================
Write-Host ""
Write-Host ">> [Extra E] Actualizando public/src/App.tsx..." -ForegroundColor Yellow

Backup-File "public\src\App.tsx"

@'
import { Routes, Route } from "react-router-dom";
import SiteHeader from "./shared/SiteHeader";
import PublicListPage from "./pages/PublicListPage";
import PublicDetailPage from "./pages/PublicDetailPage";
import SuggestFormPage from "./pages/SuggestFormPage";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <SiteHeader />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<PublicListPage />} />
          <Route path="/restaurante/:id" element={<PublicDetailPage />} />
          <Route path="/sugerir" element={<SuggestFormPage />} />
          <Route
            path="*"
            element={
              <div className="max-w-lg mx-auto px-4 py-24 text-center">
                <p className="text-6xl font-extrabold text-slate-200 mb-4">404</p>
                <p className="text-slate-500 mb-6">Esta pagina no existe.</p>
                <a
                  href="/"
                  className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
                >
                  Volver al inicio
                </a>
              </div>
            }
          />
        </Routes>
      </div>
      <footer className="border-t border-slate-100 py-6 text-center text-xs text-slate-400 bg-white">
        2025 Donde Comemos Hoy &middot; Hecho para familias
      </footer>
    </div>
  );
}
'@ | Set-Content -Path "public\src\App.tsx" -Encoding UTF8

Write-Host "   App.tsx actualizado." -ForegroundColor Green

# ============================================================
# EXTRA F — PUBLIC: SiteHeader.tsx sin emojis rotos
# ============================================================
Write-Host ""
Write-Host ">> [Extra F] Actualizando SiteHeader.tsx..." -ForegroundColor Yellow

Backup-File "public\src\shared\SiteHeader.tsx"

@'
import { Link, useLocation } from "react-router-dom";

export default function SiteHeader() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0">
            DCH
          </div>
          <div className="hidden sm:block">
            <p className="font-bold text-slate-800 text-sm leading-tight">
              Donde Comemos Hoy
            </p>
            <p className="text-[10px] text-orange-400 font-medium leading-tight">
              Restaurantes para familias
            </p>
          </div>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          <Link
            to="/"
            className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
              isActive("/")
                ? "bg-orange-50 text-orange-600"
                : "text-slate-600 hover:text-orange-600 hover:bg-orange-50"
            }`}
          >
            Restaurantes
          </Link>
          <Link
            to="/sugerir"
            className={`text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors ${
              isActive("/sugerir")
                ? "bg-orange-500 text-white"
                : "bg-orange-500 text-white hover:bg-orange-600"
            }`}
          >
            Sugerir
          </Link>
        </nav>
      </div>
    </header>
  );
}
'@ | Set-Content -Path "public\src\shared\SiteHeader.tsx" -Encoding UTF8

Write-Host "   SiteHeader.tsx actualizado." -ForegroundColor Green

# ============================================================
# PASO 9 — Ejecutar migracion Prisma
# ============================================================
Write-Host ""
Write-Host ">> [9/9] Ejecutando migracion de Prisma..." -ForegroundColor Yellow
Write-Host "   (Esto requiere que la base de datos este disponible)" -ForegroundColor Gray
Write-Host ""

Set-Location "backend"
$migrateResult = npx prisma migrate dev --name add_favoritos 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   Migracion ejecutada correctamente." -ForegroundColor Green
} else {
    Write-Host "   La migracion no se pudo ejecutar automaticamente." -ForegroundColor Yellow
    Write-Host "   Ejecuta manualmente:" -ForegroundColor Yellow
    Write-Host "   cd backend && npx prisma migrate dev --name add_favoritos" -ForegroundColor White
}
Set-Location ".."

# ============================================================
# RESUMEN FINAL
# ============================================================
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  COMPLETADO - Mejoras aplicadas al proyecto" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "CAMBIOS APLICADOS:" -ForegroundColor White
Write-Host "  [Backend]" -ForegroundColor Yellow
Write-Host "  - schema.prisma: campo favoritos Int @default(0)" -ForegroundColor Gray
Write-Host "  - restaurante.controller.js: endpoint POST /:id/favorito" -ForegroundColor Gray
Write-Host "  - restaurante.routes.js: ruta publica para favorito" -ForegroundColor Gray
Write-Host "  - restaurante.service.js: sortBy favoritos_desc/asc, vistas_desc" -ForegroundColor Gray
Write-Host ""
Write-Host "  [Frontend Publico]" -ForegroundColor Yellow
Write-Host "  - utils/favorites.ts: getFavorites, isFavorite, toggleFavorite" -ForegroundColor Gray
Write-Host "  - types/index.ts: campo favoritos en Restaurante" -ForegroundColor Gray
Write-Host "  - restauranteService.ts: postFavorito()" -ForegroundColor Gray
Write-Host "  - PublicListPage.tsx: UI mejorada, badges, favoritos, sortBy" -ForegroundColor Gray
Write-Host "  - PublicDetailPage.tsx: favorito en detalle, conteo visible" -ForegroundColor Gray
Write-Host ""
Write-Host "  [Dashboard]" -ForegroundColor Yellow
Write-Host "  - SugerenciasPage.tsx: modal con aprobar/rechazar+motivo, auto-close" -ForegroundColor Gray
Write-Host "  - sugerenciaService.ts: rechazarSugerencia(id, motivo)" -ForegroundColor Gray
Write-Host "  - HomePage.tsx: stats mejoradas, card top favorito, acceso rapido" -ForegroundColor Gray
Write-Host "  - restauranteService.ts: campo favoritos en tipo Restaurante" -ForegroundColor Gray
Write-Host ""
Write-Host "SIGUIENTES PASOS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1. Si la migracion no se ejecuto automaticamente:" -ForegroundColor White
Write-Host "     cd backend && npx prisma migrate dev --name add_favoritos" -ForegroundColor Cyan
Write-Host ""
Write-Host "  2. Arrancar backend:" -ForegroundColor White
Write-Host "     cd backend && npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "  3. Arrancar frontend publico:" -ForegroundColor White
Write-Host "     cd public && npm run dev" -ForegroundColor Cyan
Write-Host "     Abre: http://localhost:5174" -ForegroundColor Cyan
Write-Host ""
Write-Host "  4. Arrancar dashboard:" -ForegroundColor White
Write-Host "     cd dashboard && npm run dev" -ForegroundColor Cyan
Write-Host "     Abre: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "  5. CORS: verifica que el backend permita el puerto 5174" -ForegroundColor White
Write-Host "     app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'] }))" -ForegroundColor Cyan
Write-Host ""
