# ============================================================
# SCRIPT: crear_public_DCH.ps1
# PROYECTO: Donde Comemos Hoy - Frontend Publico
# EJECUTAR DESDE: la raiz del proyecto (donde estan backend/ y dashboard/)
# USO: .\crear_public_DCH.ps1
# ============================================================

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  DONDE COMEMOS HOY - Creando frontend publico (public/)" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# --- Verificar que estamos en la raiz del proyecto ---
if (-not (Test-Path "backend") -or -not (Test-Path "dashboard")) {
    Write-Host "ERROR: Ejecuta este script desde la raiz del proyecto" -ForegroundColor Red
    Write-Host "       (donde estan las carpetas backend/ y dashboard/)" -ForegroundColor Red
    exit 1
}

# --- Crear estructura de carpetas ---
Write-Host ">> Creando estructura de carpetas..." -ForegroundColor Yellow

$folders = @(
    "public",
    "public\src",
    "public\src\pages",
    "public\src\services",
    "public\src\shared",
    "public\src\types",
    "public\public"
)

foreach ($folder in $folders) {
    if (-not (Test-Path $folder)) {
        New-Item -ItemType Directory -Path $folder -Force | Out-Null
        Write-Host "   Creado: $folder" -ForegroundColor Green
    } else {
        Write-Host "   Ya existe: $folder" -ForegroundColor Gray
    }
}

# ============================================================
# ARCHIVO: public/package.json
# ============================================================
Write-Host ""
Write-Host ">> Escribiendo archivos de configuracion..." -ForegroundColor Yellow

@'
{
  "name": "dch-public",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite --port 5174",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@tanstack/react-query": "^5.85.0",
    "axios": "^1.11.0",
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "react-router-dom": "^7.8.0"
  },
  "devDependencies": {
    "@types/react": "^19.1.10",
    "@types/react-dom": "^19.1.7",
    "@vitejs/plugin-react": "^5.0.0",
    "autoprefixer": "^10.4.21",
    "postcss": "^8.5.6",
    "tailwindcss": "^3.4.14",
    "typescript": "~5.8.3",
    "vite": "^7.1.2"
  }
}
'@ | Set-Content -Path "public\package.json" -Encoding UTF8

# ============================================================
# ARCHIVO: public/index.html
# ============================================================
@'
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Descubre restaurantes perfectos para ir con ninos. Donde Comemos Hoy." />
    <title>Donde Comemos Hoy</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
'@ | Set-Content -Path "public\index.html" -Encoding UTF8

# ============================================================
# ARCHIVO: public/.env
# ============================================================
@'
VITE_API_URL=http://localhost:3000/api
'@ | Set-Content -Path "public\.env" -Encoding UTF8

# ============================================================
# ARCHIVO: public/vite.config.ts
# ============================================================
@'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
  },
});
'@ | Set-Content -Path "public\vite.config.ts" -Encoding UTF8

# ============================================================
# ARCHIVO: public/tsconfig.json
# ============================================================
@'
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
'@ | Set-Content -Path "public\tsconfig.json" -Encoding UTF8

# ============================================================
# ARCHIVO: public/tsconfig.app.json
# ============================================================
@'
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["src"]
}
'@ | Set-Content -Path "public\tsconfig.app.json" -Encoding UTF8

# ============================================================
# ARCHIVO: public/tsconfig.node.json
# ============================================================
@'
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "ES2023",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["vite.config.ts"]
}
'@ | Set-Content -Path "public\tsconfig.node.json" -Encoding UTF8

# ============================================================
# ARCHIVO: public/tailwind.config.js
# ============================================================
@'
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
'@ | Set-Content -Path "public\tailwind.config.js" -Encoding UTF8

# ============================================================
# ARCHIVO: public/postcss.config.js
# ============================================================
@'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
'@ | Set-Content -Path "public\postcss.config.js" -Encoding UTF8

# ============================================================
# ARCHIVO: public/public/favicon.svg
# ============================================================
@'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <text y="26" font-size="28">🍽️</text>
</svg>
'@ | Set-Content -Path "public\public\favicon.svg" -Encoding UTF8

Write-Host "   Archivos de configuracion escritos." -ForegroundColor Green

# ============================================================
# ARCHIVO: public/src/types/index.ts
# ============================================================
Write-Host ""
Write-Host ">> Escribiendo tipos TypeScript..." -ForegroundColor Yellow

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

Write-Host "   Tipos escritos." -ForegroundColor Green

# ============================================================
# ARCHIVO: public/src/services/api.ts
# ============================================================
Write-Host ""
Write-Host ">> Escribiendo servicios..." -ForegroundColor Yellow

@'
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL as string;

if (!API_URL) {
  console.error("[DCH] VITE_API_URL no definida. Revisa public/.env");
}

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

export default api;
'@ | Set-Content -Path "public\src\services\api.ts" -Encoding UTF8

# ============================================================
# ARCHIVO: public/src/services/restauranteService.ts
# ============================================================
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
'@ | Set-Content -Path "public\src\services\restauranteService.ts" -Encoding UTF8

# ============================================================
# ARCHIVO: public/src/services/sugerenciaService.ts
# ============================================================
@'
import api from "./api";
import type { SugerenciaPayload } from "../types";

export async function enviarSugerencia(payload: SugerenciaPayload): Promise<void> {
  await api.post("/sugerencias", payload);
}
'@ | Set-Content -Path "public\src\services\sugerenciaService.ts" -Encoding UTF8

Write-Host "   Servicios escritos." -ForegroundColor Green

# ============================================================
# ARCHIVO: public/src/shared/SiteHeader.tsx
# ============================================================
Write-Host ""
Write-Host ">> Escribiendo componentes compartidos..." -ForegroundColor Yellow

@'
import { Link, useLocation } from "react-router-dom";

export default function SiteHeader() {
  const location = useLocation();

  const navLink = (to: string, label: string) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={`text-sm font-semibold transition-colors px-3 py-1.5 rounded-full ${
          isActive
            ? "bg-orange-100 text-orange-700"
            : "text-slate-600 hover:text-orange-600"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-orange-100 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-2xl">🍽️</span>
          <div>
            <p className="font-bold text-slate-800 leading-tight text-sm sm:text-base">
              Donde Comemos Hoy
            </p>
            <p className="text-[10px] text-orange-500 font-medium leading-tight hidden sm:block">
              Restaurantes para familias con ninos
            </p>
          </div>
        </Link>
        <nav className="flex items-center gap-1">
          {navLink("/", "Restaurantes")}
          {navLink("/sugerir", "Sugerir")}
        </nav>
      </div>
    </header>
  );
}
'@ | Set-Content -Path "public\src\shared\SiteHeader.tsx" -Encoding UTF8

# ============================================================
# ARCHIVO: public/src/shared/ChipCaracteristica.tsx
# ============================================================
@'
interface Props {
  activo: boolean;
  emoji: string;
  label: string;
}

export default function ChipCaracteristica({ activo, emoji, label }: Props) {
  if (!activo) return null;
  return (
    <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 text-xs font-medium px-2.5 py-1 rounded-full border border-orange-100">
      <span>{emoji}</span>
      <span>{label}</span>
    </span>
  );
}
'@ | Set-Content -Path "public\src\shared\ChipCaracteristica.tsx" -Encoding UTF8

Write-Host "   Componentes compartidos escritos." -ForegroundColor Green

# ============================================================
# ARCHIVO: public/src/pages/PublicListPage.tsx
# ============================================================
Write-Host ""
Write-Host ">> Escribiendo paginas..." -ForegroundColor Yellow

@'
import { useState, useCallback } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getRestaurantes } from "../services/restauranteService";
import type { FiltrosRestaurante, Restaurante } from "../types";
import ChipCaracteristica from "../shared/ChipCaracteristica";

const FILTROS_OPCIONES = [
  { key: "zonaInfantil",        emoji: "🛝", label: "Zona infantil" },
  { key: "menuInfantil",        emoji: "👶", label: "Menu infantil" },
  { key: "tronaDisponible",     emoji: "🪑", label: "Trona" },
  { key: "cambiadorDisponible", emoji: "🧷", label: "Cambiador" },
  { key: "sitioParaCarrito",    emoji: "🛒", label: "Caben carritos" },
  { key: "terrazaSegura",       emoji: "☀️",  label: "Terraza segura" },
  { key: "parqueCercano",       emoji: "🌳", label: "Parque cercano" },
  { key: "actividadesParaNinos",emoji: "🎨", label: "Actividades" },
  { key: "zonaAmplia",          emoji: "🏠", label: "Espacio amplio" },
  { key: "accesibleConCarrito", emoji: "♿", label: "Accesible" },
  { key: "aptoVegetariano",     emoji: "🥦", label: "Vegetariano" },
  { key: "aptoVegano",          emoji: "🌱", label: "Vegano" },
] as const;

type FlagKey = typeof FILTROS_OPCIONES[number]["key"];

function RestauranteCard({ r }: { r: Restaurante }) {
  const imagen = r.imagenes?.[0];
  const mapsUrl = r.latitud && r.longitud
    ? `https://www.google.com/maps?q=${r.latitud},${r.longitud}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.nombre + " " + r.ciudad)}`;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      <div className="relative h-44 bg-orange-50 overflow-hidden">
        {imagen ? (
          <img
            src={imagen}
            alt={r.nombre}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">
            🍽️
          </div>
        )}
        {r.verificado && (
          <span className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            ✓ Verificado
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="mb-1">
          <h2 className="font-bold text-slate-800 text-base leading-tight">{r.nombre}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            📍 {r.localidad}, {r.ciudad}
          </p>
        </div>
        <p className="text-sm text-slate-600 line-clamp-2 mb-3">{r.descripcion}</p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          <ChipCaracteristica activo={r.zonaInfantil}        emoji="🛝" label="Zona infantil" />
          <ChipCaracteristica activo={r.menuInfantil}        emoji="👶" label="Menu infantil" />
          <ChipCaracteristica activo={r.tronaDisponible}     emoji="🪑" label="Trona" />
          <ChipCaracteristica activo={r.cambiadorDisponible} emoji="🧷" label="Cambiador" />
          <ChipCaracteristica activo={r.terrazaSegura}       emoji="☀️" label="Terraza" />
          <ChipCaracteristica activo={r.parqueCercano}       emoji="🌳" label="Parque cercano" />
        </div>
        <div className="mt-auto flex gap-2">
          <Link
            to={`/restaurante/${r.id}`}
            className="flex-1 text-center bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold py-2 rounded-xl transition-colors"
          >
            Ver detalles
          </Link>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 border border-slate-200 rounded-xl text-slate-500 hover:text-orange-500 hover:border-orange-200 transition-colors text-sm"
            title="Abrir en Maps"
          >
            🗺️
          </a>
        </div>
      </div>
    </div>
  );
}

export default function PublicListPage() {
  const [search, setSearch]   = useState("");
  const [ciudad, setCiudad]   = useState("");
  const [page, setPage]       = useState(1);
  const [activeFlags, setActiveFlags] = useState<Partial<Record<FlagKey, boolean>>>({});
  const [searchInput, setSearchInput] = useState("");

  const filtros: FiltrosRestaurante = {
    q: search || undefined,
    ciudad: ciudad || undefined,
    page,
    pageSize: 12,
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

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      {/* Hero */}
      <section className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mb-3 leading-tight">
          Encuentra un sitio para comer<br className="hidden sm:block" />
          <span className="text-orange-500"> toda la familia</span>
        </h1>
        <p className="text-slate-500 text-base max-w-md mx-auto">
          Restaurantes pensados para venir con ninos. Comodidad, espacio y buena comida.
        </p>
      </section>

      {/* Buscador */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-5">
        <input
          type="text"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          placeholder="Buscar restaurante..."
          className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
        <input
          type="text"
          value={ciudad}
          onChange={e => { setCiudad(e.target.value); setPage(1); }}
          placeholder="Ciudad"
          className="w-32 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
        <button
          type="submit"
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
        >
          Buscar
        </button>
      </form>

      {/* Filtros chips */}
      <div className="flex flex-wrap gap-2 mb-8">
        {FILTROS_OPCIONES.map(({ key, emoji, label }) => {
          const isOn = !!activeFlags[key];
          return (
            <button
              key={key}
              onClick={() => toggleFlag(key)}
              className={`inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                isOn
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-white text-slate-600 border-slate-200 hover:border-orange-300 hover:text-orange-600"
              }`}
            >
              {emoji} {label}
            </button>
          );
        })}
        {(Object.keys(activeFlags).length > 0 || search || ciudad) && (
          <button
            onClick={() => { setActiveFlags({}); setSearch(""); setSearchInput(""); setCiudad(""); setPage(1); }}
            className="text-xs text-slate-400 hover:text-red-500 px-2 py-1.5 transition-colors"
          >
            ✕ Limpiar
          </button>
        )}
      </div>

      {/* Estado */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 h-72 animate-pulse" />
          ))}
        </div>
      )}

      {isError && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">😕</p>
          <p className="text-slate-500">No se pudo conectar con el servidor.</p>
          <p className="text-sm text-slate-400 mt-1">Comprueba que el backend esta arrancado en puerto 3000.</p>
        </div>
      )}

      {!isLoading && !isError && restaurantes.length === 0 && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-slate-600 font-medium">No encontramos restaurantes con esos filtros.</p>
          <p className="text-sm text-slate-400 mt-1">Prueba cambiando la busqueda o los filtros.</p>
          <Link to="/sugerir" className="mt-4 inline-block text-orange-500 font-semibold hover:underline text-sm">
            ¿Lo conoces? Sugierenoslo →
          </Link>
        </div>
      )}

      {!isLoading && !isError && restaurantes.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-500">
              {meta?.total ?? 0} restaurante{(meta?.total ?? 0) !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {restaurantes.map(r => <RestauranteCard key={r.id} r={r} />)}
          </div>

          {/* Paginacion */}
          {meta && meta.totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-10">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium disabled:opacity-40 hover:border-orange-300 hover:text-orange-600 transition-colors"
              >
                ← Anterior
              </button>
              <span className="text-sm text-slate-500">
                {page} / {meta.totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                disabled={page >= meta.totalPages}
                className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium disabled:opacity-40 hover:border-orange-300 hover:text-orange-600 transition-colors"
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}

      {/* CTA sugerir */}
      <section className="mt-16 bg-orange-50 border border-orange-100 rounded-2xl p-8 text-center">
        <p className="text-2xl mb-2">🤗</p>
        <h2 className="font-bold text-slate-800 text-lg mb-1">
          ¿Conoces un restaurante genial para familias?
        </h2>
        <p className="text-slate-500 text-sm mb-4">
          Cuentanoslo y lo revisamos para anadirlo.
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

# ============================================================
# ARCHIVO: public/src/pages/PublicDetailPage.tsx
# ============================================================
@'
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getRestauranteById } from "../services/restauranteService";
import ChipCaracteristica from "../shared/ChipCaracteristica";

const CARACTERISTICAS = [
  { key: "zonaInfantil",         emoji: "🛝", label: "Zona infantil" },
  { key: "menuInfantil",         emoji: "👶", label: "Menu infantil" },
  { key: "tronaDisponible",      emoji: "🪑", label: "Trona disponible" },
  { key: "cambiadorDisponible",  emoji: "🧷", label: "Cambiador de panales" },
  { key: "sitioParaCarrito",     emoji: "🛒", label: "Caben carritos" },
  { key: "terrazaSegura",        emoji: "☀️",  label: "Terraza segura" },
  { key: "parqueCercano",        emoji: "🌳", label: "Parque cercano" },
  { key: "actividadesParaNinos", emoji: "🎨", label: "Actividades para ninos" },
  { key: "zonaAmplia",           emoji: "🏠", label: "Espacio amplio" },
  { key: "accesibleConCarrito",  emoji: "♿", label: "Accesible con carrito" },
  { key: "ambienteFamiliar",     emoji: "👨‍👩‍👧", label: "Ambiente familiar" },
  { key: "sinPantallas",         emoji: "📵", label: "Sin pantallas" },
  { key: "aptoVegetariano",      emoji: "🥦", label: "Opciones vegetarianas" },
  { key: "aptoVegano",           emoji: "🌱", label: "Opciones veganas" },
] as const;

export default function PublicDetailPage() {
  const { id } = useParams<{ id: string }>();
  const numId = Number(id);

  const { data: r, isLoading, isError } = useQuery({
    queryKey: ["restaurante", numId],
    queryFn: () => getRestauranteById(numId),
    enabled: !isNaN(numId),
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="h-64 bg-slate-100 rounded-2xl animate-pulse mb-6" />
        <div className="space-y-3">
          <div className="h-6 bg-slate-100 rounded w-2/3 animate-pulse" />
          <div className="h-4 bg-slate-100 rounded w-1/3 animate-pulse" />
        </div>
      </div>
    );
  }

  if (isError || !r) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-4xl mb-3">😕</p>
        <p className="text-slate-600 font-medium">Restaurante no encontrado.</p>
        <Link to="/" className="mt-4 inline-block text-orange-500 font-semibold hover:underline text-sm">
          ← Volver al listado
        </Link>
      </div>
    );
  }

  const mapsUrl = r.latitud && r.longitud
    ? `https://www.google.com/maps?q=${r.latitud},${r.longitud}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.nombre + " " + r.ciudad)}`;

  const chips = CARACTERISTICAS.filter(c => r[c.key as keyof typeof r] === true);

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      {/* Back */}
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-orange-500 mb-6 transition-colors">
        ← Volver
      </Link>

      {/* Imagen */}
      {r.imagenes && r.imagenes.length > 0 ? (
        <div className="rounded-2xl overflow-hidden h-64 sm:h-80 mb-6 bg-orange-50">
          <img
            src={r.imagenes[0]}
            alt={r.nombre}
            className="w-full h-full object-cover"
            onError={(e) => { (e.currentTarget.parentElement!).innerHTML = '<div class="w-full h-full flex items-center justify-center text-6xl">🍽️</div>'; }}
          />
        </div>
      ) : (
        <div className="rounded-2xl h-64 sm:h-80 mb-6 bg-orange-50 flex items-center justify-center text-6xl">
          🍽️
        </div>
      )}

      {/* Cabecera */}
      <div className="mb-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">{r.nombre}</h1>
            <p className="text-slate-500 text-sm mt-1">📍 {r.direccion}, {r.localidad}, {r.ciudad}</p>
          </div>
          {r.verificado && (
            <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full border border-green-200">
              ✓ Verificado
            </span>
          )}
        </div>
      </div>

      {/* Descripcion */}
      <p className="text-slate-600 leading-relaxed mb-6">{r.descripcion}</p>

      {/* Chips caracteristicas */}
      {chips.length > 0 && (
        <section className="mb-6">
          <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wide mb-3">
            Perfecto para familias porque...
          </h2>
          <div className="flex flex-wrap gap-2">
            {chips.map(c => (
              <ChipCaracteristica key={c.key} activo={true} emoji={c.emoji} label={c.label} />
            ))}
          </div>
        </section>
      )}

      {/* Info adicional */}
      <section className="bg-slate-50 rounded-2xl p-5 mb-6 space-y-2">
        {r.horario && (
          <div className="flex gap-2 text-sm">
            <span>🕐</span>
            <span className="text-slate-600">{r.horario}</span>
          </div>
        )}
        {r.telefonoRestaurante && (
          <div className="flex gap-2 text-sm">
            <span>📞</span>
            <a href={`tel:${r.telefonoRestaurante}`} className="text-orange-500 hover:underline">
              {r.telefonoRestaurante}
            </a>
          </div>
        )}
        {r.emailRestaurante && (
          <div className="flex gap-2 text-sm">
            <span>✉️</span>
            <a href={`mailto:${r.emailRestaurante}`} className="text-orange-500 hover:underline">
              {r.emailRestaurante}
            </a>
          </div>
        )}
        {r.sitioWeb && (
          <div className="flex gap-2 text-sm">
            <span>🌐</span>
            <a href={r.sitioWeb} target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">
              Sitio web
            </a>
          </div>
        )}
      </section>

      {/* Botones accion */}
      <div className="flex flex-col sm:flex-row gap-3">
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-center bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          🗺️ Abrir en Maps
        </a>
        <Link
          to="/"
          className="flex-1 text-center border border-slate-200 hover:border-orange-300 text-slate-600 hover:text-orange-600 font-semibold py-3 rounded-xl transition-colors"
        >
          Ver mas restaurantes
        </Link>
      </div>
    </main>
  );
}
'@ | Set-Content -Path "public\src\pages\PublicDetailPage.tsx" -Encoding UTF8

# ============================================================
# ARCHIVO: public/src/pages/SuggestFormPage.tsx
# ============================================================
@'
import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { enviarSugerencia } from "../services/sugerenciaService";
import type { SugerenciaPayload } from "../types";

const CARACTERISTICAS = [
  { key: "zonaInfantil",         emoji: "🛝", label: "Zona infantil" },
  { key: "menuInfantil",         emoji: "👶", label: "Menu infantil" },
  { key: "tronaDisponible",      emoji: "🪑", label: "Trona disponible" },
  { key: "cambiadorDisponible",  emoji: "🧷", label: "Cambiador" },
  { key: "sitioParaCarrito",     emoji: "🛒", label: "Sitio para carrito" },
  { key: "terrazaSegura",        emoji: "☀️",  label: "Terraza segura" },
  { key: "parqueCercano",        emoji: "🌳", label: "Parque cercano" },
  { key: "actividadesParaNinos", emoji: "🎨", label: "Actividades para ninos" },
  { key: "zonaAmplia",           emoji: "🏠", label: "Zona amplia" },
  { key: "accesibleConCarrito",  emoji: "♿", label: "Accesible con carrito" },
  { key: "ambienteFamiliar",     emoji: "👨‍👩‍👧", label: "Ambiente familiar" },
  { key: "sinPantallas",         emoji: "📵", label: "Sin pantallas" },
  { key: "aptoVegetariano",      emoji: "🥦", label: "Opciones vegetarianas" },
  { key: "aptoVegano",           emoji: "🌱", label: "Opciones veganas" },
] as const;

type CheckboxKey = typeof CARACTERISTICAS[number]["key"];

type FormData = {
  nombre: string;
  direccion: string;
  localidad: string;
  ciudad: string;
  provincia: string;
  codigoPostal: string;
  descripcion: string;
  nombreContacto: string;
  emailContacto: string;
  comentarios: string;
};

const INITIAL_FORM: FormData = {
  nombre: "",
  direccion: "",
  localidad: "",
  ciudad: "",
  provincia: "",
  codigoPostal: "",
  descripcion: "",
  nombreContacto: "",
  emailContacto: "",
  comentarios: "",
};

export default function SuggestFormPage() {
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [checks, setChecks] = useState<Partial<Record<CheckboxKey, boolean>>>({});
  const [enviado, setEnviado] = useState(false);

  const mutation = useMutation({
    mutationFn: (payload: SugerenciaPayload) => enviarSugerencia(payload),
    onSuccess: () => {
      setEnviado(true);
      setForm(INITIAL_FORM);
      setChecks({});
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleCheck = (key: CheckboxKey) => {
    setChecks(prev => {
      const next = { ...prev };
      if (next[key]) delete next[key];
      else next[key] = true;
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: SugerenciaPayload = {
      ...form,
      codigoPostal: form.codigoPostal || undefined,
      emailContacto: form.emailContacto || undefined,
      comentarios: form.comentarios || undefined,
      ...checks,
    };
    mutation.mutate(payload);
  };

  if (enviado) {
    return (
      <main className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-extrabold text-slate-800 mb-3">
          iGracias por tu sugerencia!
        </h1>
        <p className="text-slate-500 mb-6">
          Revisaremos el restaurante y, si cumple los criterios, lo anadiremos a la lista.
        </p>
        <Link
          to="/"
          className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
        >
          Volver al listado
        </Link>
      </main>
    );
  }

  const field = (
    name: keyof FormData,
    label: string,
    placeholder: string,
    required = false,
    type = "text"
  ) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label} {required && <span className="text-orange-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={form[name]}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
      />
    </div>
  );

  return (
    <main className="max-w-xl mx-auto px-4 py-10">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-orange-500 mb-6 transition-colors">
        ← Volver
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-800 mb-1">Sugiere un restaurante</h1>
        <p className="text-slate-500 text-sm">
          Si conoces un sitio perfecto para ir con ninos, cuentanoslo. Lo revisamos y, si encaja, lo publicamos.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <section>
          <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wide mb-3">Sobre el restaurante</h2>
          <div className="space-y-4">
            {field("nombre", "Nombre del restaurante", "Ej: La Casita de Maria", true)}
            {field("direccion", "Direccion", "Calle, numero...", true)}
            <div className="grid grid-cols-2 gap-3">
              {field("localidad", "Localidad", "Ej: Getafe", true)}
              {field("ciudad", "Ciudad", "Ej: Madrid", true)}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {field("provincia", "Provincia", "Ej: Madrid", true)}
              {field("codigoPostal", "Codigo postal", "Ej: 28900")}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Descripcion <span className="text-orange-500">*</span>
              </label>
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                placeholder="Cuéntanos por qué es un buen sitio para familias..."
                required
                rows={3}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wide mb-3">Caracteristicas familiares</h2>
          <div className="grid grid-cols-2 gap-2">
            {CARACTERISTICAS.map(({ key, emoji, label }) => {
              const isOn = !!checks[key];
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => toggleCheck(key)}
                  className={`flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-xl border transition-colors text-left ${
                    isOn
                      ? "bg-orange-50 border-orange-300 text-orange-700"
                      : "bg-white border-slate-200 text-slate-600 hover:border-orange-200"
                  }`}
                >
                  <span>{emoji}</span>
                  <span>{label}</span>
                  {isOn && <span className="ml-auto text-orange-500">✓</span>}
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wide mb-3">Tus datos</h2>
          <div className="space-y-4">
            {field("nombreContacto", "Tu nombre", "Como te llamas", true)}
            {field("emailContacto", "Tu email (opcional)", "Para avisarte cuando se publique", false, "email")}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Comentarios adicionales</label>
              <textarea
                name="comentarios"
                value={form.comentarios}
                onChange={handleChange}
                placeholder="Cualquier cosa que quieras contarnos..."
                rows={2}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
              />
            </div>
          </div>
        </section>

        {mutation.isError && (
          <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
            ❌ Hubo un error al enviar. Comprueba los datos e intentalo de nuevo.
          </p>
        )}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
        >
          {mutation.isPending ? "Enviando..." : "Enviar sugerencia"}
        </button>
      </form>
    </main>
  );
}
'@ | Set-Content -Path "public\src\pages\SuggestFormPage.tsx" -Encoding UTF8

Write-Host "   Paginas escritas." -ForegroundColor Green

# ============================================================
# ARCHIVO: public/src/index.css
# ============================================================
Write-Host ""
Write-Host ">> Escribiendo estilos y entrypoint..." -ForegroundColor Yellow

@'
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    font-family: 'Inter', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  body {
    @apply bg-slate-50 text-slate-800 min-h-screen;
  }
}

@layer utilities {
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}
'@ | Set-Content -Path "public\src\index.css" -Encoding UTF8

# ============================================================
# ARCHIVO: public/src/App.tsx
# ============================================================
@'
import { Routes, Route } from "react-router-dom";
import SiteHeader from "./shared/SiteHeader";
import PublicListPage from "./pages/PublicListPage";
import PublicDetailPage from "./pages/PublicDetailPage";
import SuggestFormPage from "./pages/SuggestFormPage";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<PublicListPage />} />
          <Route path="/restaurante/:id" element={<PublicDetailPage />} />
          <Route path="/sugerir" element={<SuggestFormPage />} />
          <Route
            path="*"
            element={
              <div className="max-w-lg mx-auto px-4 py-20 text-center">
                <p className="text-5xl mb-4">404</p>
                <p className="text-slate-500 mb-4">Pagina no encontrada.</p>
                <a href="/" className="text-orange-500 font-semibold hover:underline">Volver al inicio</a>
              </div>
            }
          />
        </Routes>
      </div>
      <footer className="border-t border-slate-100 py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Donde Comemos Hoy · Hecho con 🧡 para familias con ninos
      </footer>
    </div>
  );
}
'@ | Set-Content -Path "public\src\App.tsx" -Encoding UTF8

# ============================================================
# ARCHIVO: public/src/main.tsx
# ============================================================
@'
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 30_000,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
'@ | Set-Content -Path "public\src\main.tsx" -Encoding UTF8

Write-Host "   main.tsx y App.tsx escritos." -ForegroundColor Green

# ============================================================
# INSTALAR DEPENDENCIAS
# ============================================================
Write-Host ""
Write-Host ">> Instalando dependencias npm en public/..." -ForegroundColor Yellow
Write-Host "   (esto puede tardar 1-2 minutos)" -ForegroundColor Gray

Set-Location "public"

$npmResult = npm install 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR en npm install. Salida:" -ForegroundColor Red
    Write-Host $npmResult -ForegroundColor Red
    Write-Host ""
    Write-Host "Intenta manualmente: cd public && npm install" -ForegroundColor Yellow
    Set-Location ".."
} else {
    Write-Host "   Dependencias instaladas correctamente." -ForegroundColor Green
    Set-Location ".."
}

# ============================================================
# RESUMEN FINAL
# ============================================================
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  COMPLETADO - Estructura public/ creada" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "ARCHIVOS CREADOS:" -ForegroundColor White
Write-Host "  public/.env" -ForegroundColor Gray
Write-Host "  public/index.html" -ForegroundColor Gray
Write-Host "  public/package.json" -ForegroundColor Gray
Write-Host "  public/vite.config.ts" -ForegroundColor Gray
Write-Host "  public/tailwind.config.js" -ForegroundColor Gray
Write-Host "  public/postcss.config.js" -ForegroundColor Gray
Write-Host "  public/tsconfig*.json (3 archivos)" -ForegroundColor Gray
Write-Host "  public/src/main.tsx" -ForegroundColor Gray
Write-Host "  public/src/App.tsx" -ForegroundColor Gray
Write-Host "  public/src/index.css" -ForegroundColor Gray
Write-Host "  public/src/types/index.ts" -ForegroundColor Gray
Write-Host "  public/src/services/api.ts" -ForegroundColor Gray
Write-Host "  public/src/services/restauranteService.ts" -ForegroundColor Gray
Write-Host "  public/src/services/sugerenciaService.ts" -ForegroundColor Gray
Write-Host "  public/src/shared/SiteHeader.tsx" -ForegroundColor Gray
Write-Host "  public/src/shared/ChipCaracteristica.tsx" -ForegroundColor Gray
Write-Host "  public/src/pages/PublicListPage.tsx" -ForegroundColor Gray
Write-Host "  public/src/pages/PublicDetailPage.tsx" -ForegroundColor Gray
Write-Host "  public/src/pages/SuggestFormPage.tsx" -ForegroundColor Gray
Write-Host ""
Write-Host "PARA ARRANCAR EL FRONTEND PUBLICO:" -ForegroundColor Yellow
Write-Host "  cd public" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "  Abre: http://localhost:5174" -ForegroundColor Cyan
Write-Host ""
Write-Host "RECUERDA tener el backend arrancado en puerto 3000:" -ForegroundColor Yellow
Write-Host "  cd backend && npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "SI HAY ERROR DE CORS en el backend, anade en app.js/server.js:" -ForegroundColor Yellow
Write-Host "  app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'] }))" -ForegroundColor White
Write-Host ""
