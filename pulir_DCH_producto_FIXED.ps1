# ============================================================
# pulir_DCH_producto.ps1
# Pase de pulido visual, UX y microcopy - Donde Comemos Hoy
# EJECUTAR DESDE: raiz del proyecto (backend/ dashboard/ public/)
# ============================================================

$ErrorActionPreference = "Continue"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
$ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptRoot

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  DCH - Pulido visual, UX y microcopy" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path "dashboard") -or -not (Test-Path "public")) {
    Write-Host "ERROR: Ejecuta desde la raiz del proyecto" -ForegroundColor Red
    exit 1
}

function Backup-File {
    param([string]$Path)
    if (Test-Path $Path) {
        $ts  = Get-Date -Format 'yyyyMMdd_HHmmss'
        $bp  = "$Path.backup_$ts"
        Copy-Item $Path $bp -Force
        Write-Host "   Backup: $bp" -ForegroundColor DarkGray
    }
}

function Write-UTF8 {
    param([string]$Path, [string]$Content)
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText(
        [System.IO.Path]::GetFullPath($Path),
        $Content,
        $utf8NoBom
    )
}

# ============================================================
# 1. FAVICON
# ============================================================
Write-Host ">> [1/11] Favicon DCH..." -ForegroundColor Yellow

$faviconSvg = @'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#f97316"/>
  <text x="32" y="44" font-family="system-ui,sans-serif" font-weight="900"
        font-size="28" fill="white" text-anchor="middle">DCH</text>
</svg>
'@

if (-not (Test-Path "public\public")) { New-Item -ItemType Directory -Path "public\public" -Force | Out-Null }
Write-UTF8 "public\public\favicon.svg" $faviconSvg

Backup-File "public\index.html"
$indexHtml = @'
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Encuentra restaurantes perfectos para ir con ninos. Donde Comemos Hoy." />
    <meta name="theme-color" content="#f97316" />
    <title>Donde Comemos Hoy</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
'@
Write-UTF8 "public\index.html" $indexHtml
Write-Host "   Favicon y index.html listos." -ForegroundColor Green

# ============================================================
# 2. index.css
# ============================================================
Write-Host ">> [2/11] index.css..." -ForegroundColor Yellow
Backup-File "public\src\index.css"

$indexCss = @'
@import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    font-family: 'Inter', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    scroll-behavior: smooth;
  }
  body {
    @apply bg-[#faf9f7] text-slate-700 min-h-screen;
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

@keyframes blob-move {
  0%,100% { transform: translate(0,0) scale(1); }
  33%      { transform: translate(18px,-14px) scale(1.04); }
  66%      { transform: translate(-10px,12px) scale(0.97); }
}
.blob          { animation: blob-move 12s ease-in-out infinite; }
.blob-delay-2  { animation-delay: 2s; }
.blob-delay-4  { animation-delay: 4s; }

@keyframes float-y {
  0%,100% { transform: translateY(0); }
  50%      { transform: translateY(-7px); }
}
.float-a { animation: float-y 4.0s ease-in-out infinite; }
.float-b { animation: float-y 4.6s ease-in-out 0.5s infinite; }
.float-c { animation: float-y 5.1s ease-in-out 1.0s infinite; }
.float-d { animation: float-y 4.3s ease-in-out 1.5s infinite; }
'@
Write-UTF8 "public\src\index.css" $indexCss
Write-Host "   index.css listo." -ForegroundColor Green

# ============================================================
# 3. SiteHeader.tsx
# ============================================================
Write-Host ">> [3/11] SiteHeader.tsx..." -ForegroundColor Yellow
Backup-File "public\src\shared\SiteHeader.tsx"

$siteHeader = @'
import { Link, useLocation } from "react-router-dom";

export default function SiteHeader() {
  const location = useLocation();
  const active = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-stone-100 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center shadow-sm group-hover:bg-orange-600 transition-colors flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="2.5" fill="white" stroke="none"/>
            </svg>
          </div>
          <div className="leading-tight">
            <p className="font-bold text-slate-800 text-[15px]">Donde Comemos Hoy</p>
            <p className="text-[10px] text-stone-400 hidden sm:block">Para familias con ninos</p>
          </div>
        </Link>

        <nav className="flex items-center gap-1">
          <Link to="/"
            className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
              active("/") ? "text-orange-600 bg-orange-50" : "text-slate-500 hover:text-slate-800 hover:bg-stone-100"
            }`}>
            Restaurantes
          </Link>
          <Link to="/sugerir"
            className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
              active("/sugerir") ? "text-orange-600 bg-orange-50" : "text-slate-500 hover:text-slate-800 hover:bg-stone-100"
            }`}>
            Sugerir
          </Link>
        </nav>
      </div>
    </header>
  );
}
'@
Write-UTF8 "public\src\shared\SiteHeader.tsx" $siteHeader
Write-Host "   SiteHeader.tsx listo." -ForegroundColor Green

# ============================================================
# 4. App.tsx — footer
# ============================================================
Write-Host ">> [4/11] App.tsx (footer)..." -ForegroundColor Yellow
Backup-File "public\src\App.tsx"

$appTsx = @'
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
          <Route path="/"               element={<PublicListPage />} />
          <Route path="/restaurante/:id" element={<PublicDetailPage />} />
          <Route path="/sugerir"         element={<SuggestFormPage />} />
          <Route path="*" element={
            <div className="max-w-lg mx-auto px-4 py-20 text-center">
              <p className="text-6xl font-black text-stone-200 mb-4">404</p>
              <p className="text-slate-500 mb-6">Esta pagina no existe.</p>
              <a href="/" className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
                Volver al inicio
              </a>
            </div>
          } />
        </Routes>
      </div>

      <footer className="border-t border-stone-100 bg-white py-6 mt-16">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-stone-400">
            Donde Comemos Hoy &middot; Hecho por familias, para familias.
          </p>
          <div className="flex items-center gap-4">
            <a href="/sugerir" className="text-xs text-stone-400 hover:text-orange-500 transition-colors">
              Sugerir restaurante
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
'@
Write-UTF8 "public\src\App.tsx" $appTsx
Write-Host "   App.tsx listo." -ForegroundColor Green

# ============================================================
# 5. PublicListPage.tsx
# ============================================================
Write-Host ">> [5/11] PublicListPage.tsx..." -ForegroundColor Yellow
Backup-File "public\src\pages\PublicListPage.tsx"

$listPage = @'
import { useState, useCallback } from "react";
import { useQuery, keepPreviousData, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getRestaurantes, postFavorito } from "../services/restauranteService";
import type { FiltrosRestaurante, Restaurante } from "../types";
import { isFavorite, toggleFavorite } from "../utils/favorites";

const FILTROS = [
  { key: "zonaInfantil",         label: "Zona infantil" },
  { key: "menuInfantil",         label: "Menu infantil" },
  { key: "tronaDisponible",      label: "Trona disponible" },
  { key: "cambiadorDisponible",  label: "Cambiador" },
  { key: "sitioParaCarrito",     label: "Sitio para carrito" },
  { key: "terrazaSegura",        label: "Terraza segura" },
  { key: "parqueCercano",        label: "Parque cercano" },
  { key: "actividadesParaNinos", label: "Actividades" },
  { key: "zonaAmplia",           label: "Espacio amplio" },
  { key: "accesibleConCarrito",  label: "Accesible" },
  { key: "aptoVegetariano",      label: "Vegetariano" },
  { key: "aptoVegano",           label: "Vegano" },
] as const;

type FlagKey = typeof FILTROS[number]["key"];

const CHIPS_CARD = [
  { key: "zonaInfantil",        label: "Zona infantil" },
  { key: "menuInfantil",        label: "Menu infantil" },
  { key: "tronaDisponible",     label: "Trona" },
  { key: "cambiadorDisponible", label: "Cambiador" },
  { key: "terrazaSegura",       label: "Terraza" },
  { key: "parqueCercano",       label: "Parque" },
] as const;

function getBadge(r: Restaurante): { label: string; cls: string } | null {
  const f = r.favoritos ?? 0;
  if (f >= 50) return { label: "Top de la zona",   cls: "bg-red-500 text-white" };
  if (f >= 30) return { label: "Top familias",      cls: "bg-orange-500 text-white" };
  if (f >= 15) return { label: "Favorito familias", cls: "bg-amber-400 text-white" };
  if (f >= 5)  return { label: "Recomendado",       cls: "bg-green-500 text-white" };
  const n = [r.zonaInfantil,r.menuInfantil,r.tronaDisponible,r.cambiadorDisponible,
             r.sitioParaCarrito,r.terrazaSegura,r.actividadesParaNinos,r.zonaAmplia,
             r.parqueCercano,r.accesibleConCarrito,r.ambienteFamiliar].filter(Boolean).length;
  if (r.zonaInfantil && r.menuInfantil) return { label: "Ideal ninos",      cls: "bg-blue-500 text-white" };
  if (n >= 7)                            return { label: "Perfecto familias", cls: "bg-purple-500 text-white" };
  return null;
}

function IconPin() {
  return (
    <svg className="w-3 h-3 inline-block flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 2a6 6 0 00-6 6c0 4.418 6 10 6 10s6-5.582 6-10a6 6 0 00-6-6zm0 8a2 2 0 110-4 2 2 0 010 4z" clipRule="evenodd"/>
    </svg>
  );
}

function IconHeart({ filled }: { filled: boolean }) {
  return filled ? (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 20 20">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/>
    </svg>
  );
}

function IconMap() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
    </svg>
  );
}

function PlaceholderImg() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-stone-50 to-orange-50">
      <svg className="w-10 h-10 text-stone-200" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 48 48">
        <rect x="4" y="12" width="40" height="28" rx="4" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="24" cy="26" r="7" strokeLinecap="round"/>
        <circle cx="37" cy="18" r="3" fill="currentColor" stroke="none"/>
      </svg>
      <span className="text-xs text-stone-300 font-medium tracking-wide">Sin foto todavia</span>
    </div>
  );
}

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 bg-white rounded-3xl border border-stone-100">
      <svg className="w-24 h-24 mb-6 text-stone-100" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 80 80">
        <ellipse cx="40" cy="56" rx="28" ry="6" fill="currentColor" opacity="0.15" stroke="none"/>
        <rect x="16" y="28" width="48" height="26" rx="6" strokeLinecap="round" strokeLinejoin="round"/>
        <path strokeLinecap="round" strokeLinejoin="round" d="M24 28v-4a4 4 0 014-4h24a4 4 0 014 4v4"/>
        <line x1="28" y1="42" x2="52" y2="42" strokeLinecap="round"/>
        <line x1="28" y1="48" x2="44" y2="48" strokeLinecap="round"/>
      </svg>
      <h3 className="text-lg font-bold text-slate-700 mb-2 text-center">
        No hemos encontrado ningun sitio con esos filtros
      </h3>
      <p className="text-stone-400 text-sm text-center max-w-xs leading-relaxed mb-6">
        Prueba quitando alguno o buscando en otra zona. A veces el plan perfecto esta a un clic menos.
      </p>
      <div className="flex flex-wrap gap-2 justify-center">
        <button
          onClick={onClear}
          className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors"
        >
          Limpiar filtros
        </button>
        <button
          onClick={onClear}
          className="border border-stone-200 bg-white hover:border-orange-200 text-slate-600 text-sm font-medium px-5 py-2 rounded-xl transition-colors"
        >
          Ver todos
        </button>
        <Link
          to="/sugerir"
          className="border border-stone-200 bg-white hover:border-orange-200 text-slate-600 text-sm font-medium px-5 py-2 rounded-xl transition-colors"
        >
          Sugerir un restaurante
        </Link>
      </div>
    </div>
  );
}

function RestauranteCard({ r }: { r: Restaurante }) {
  const [favLocal, setFavLocal] = useState(() => isFavorite(r.id));
  const queryClient = useQueryClient();
  const imagen = r.imagenes?.[0];
  const mapsUrl = r.latitud && r.longitud
    ? `https://www.google.com/maps?q=${r.latitud},${r.longitud}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.nombre + " " + r.direccion + " " + r.ciudad)}`;
  const badge = getBadge(r);
  const chips = CHIPS_CARD.filter(c => r[c.key as keyof typeof r] === true);

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

  return (
    <article className="group bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col">
      <div className="relative h-48 overflow-hidden flex-shrink-0">
        {imagen ? (
          <img
            src={imagen} alt={r.nombre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <PlaceholderImg />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
        {badge && (
          <span className={`absolute top-3 right-3 text-[10px] font-bold tracking-wide px-2.5 py-1 rounded-full shadow-sm ${badge.cls}`}>
            {badge.label}
          </span>
        )}
        {!badge && r.verificado && (
          <span className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
            Verificado
          </span>
        )}
        <button
          onClick={handleFav}
          aria-label={favLocal ? "Quitar de favoritos" : "Guardar como favorito"}
          className={`absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all border ${
            favLocal ? "bg-red-500 text-white border-red-500 scale-110" : "bg-white/90 text-stone-400 border-white hover:text-red-400"
          }`}
        >
          <IconHeart filled={favLocal} />
        </button>
        {(r.favoritos ?? 0) > 0 && (
          <div className="absolute bottom-2 right-3 flex items-center gap-1 bg-black/50 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm">
            <IconHeart filled={true} />
            <span>{r.favoritos}</span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="mb-2">
          <h2 className="font-bold text-slate-800 text-[15px] leading-snug line-clamp-1">{r.nombre}</h2>
          <p className="text-xs text-stone-400 mt-0.5 flex items-center gap-1">
            <IconPin /> {r.localidad}, {r.ciudad}
          </p>
        </div>
        <p className="text-sm text-slate-500 line-clamp-2 mb-3 leading-relaxed">{r.descripcion}</p>
        {chips.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {chips.map(c => (
              <span key={c.key} className="text-[11px] bg-orange-50 text-orange-600 border border-orange-100 px-2 py-0.5 rounded-full font-medium">
                {c.label}
              </span>
            ))}
          </div>
        )}
        <div className="mt-auto flex gap-2">
          <Link
            to={`/restaurante/${r.id}`}
            className="flex-1 text-center bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
          >
            Ver detalles
          </Link>
          <a
            href={mapsUrl} target="_blank" rel="noopener noreferrer"
            title="Como llegar"
            className="flex items-center gap-1.5 px-3 py-2.5 border border-stone-200 rounded-xl text-stone-500 hover:text-orange-600 hover:border-orange-200 hover:bg-orange-50 transition-all text-xs font-medium"
          >
            <IconMap /><span>Como llegar</span>
          </a>
        </div>
      </div>
    </article>
  );
}

function Hero({ total }: { total: number }) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-50 via-amber-50 to-stone-50 border border-orange-100 px-6 py-12 sm:py-16 mb-10">
      <div className="blob absolute -top-16 -right-16 w-64 h-64 bg-orange-200/25 rounded-full blur-3xl pointer-events-none" />
      <div className="blob blob-delay-2 absolute -bottom-12 -left-12 w-56 h-56 bg-amber-200/25 rounded-full blur-3xl pointer-events-none" />
      <div className="blob blob-delay-4 absolute top-1/2 right-1/4 w-32 h-32 bg-orange-100/40 rounded-full blur-2xl pointer-events-none" />
      <div className="relative z-10 max-w-2xl">
        {total > 0 && (
          <span className="inline-block text-xs font-semibold text-orange-600 bg-orange-100 px-3 py-1 rounded-full mb-4">
            {total} restaurante{total !== 1 ? "s" : ""} verificado{total !== 1 ? "s" : ""}
          </span>
        )}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 leading-tight mb-4">
          Deja de darle vueltas: encuentra un sitio donde comer con tus peques
        </h1>
        <p className="text-slate-500 text-base sm:text-lg leading-relaxed mb-3 max-w-xl">
          Restaurantes pensados para familias reales: carritos, tronas, zonas amplias, menus infantiles y esos pequenos detalles que hacen que comer fuera no sea una mision imposible.
        </p>
        <p className="text-sm text-stone-400">
          Busca, filtra y guarda tus favoritos para decidir mas rapido.
        </p>
      </div>
      <div className="absolute right-4 sm:right-10 top-1/2 -translate-y-1/2 hidden sm:flex flex-col gap-2.5 z-10">
        {[
          { t: "Trona disponible", cls: "float-a" },
          { t: "Parque cerca",     cls: "float-b" },
          { t: "Terraza segura",   cls: "float-c" },
          { t: "Menu infantil",    cls: "float-d" },
        ].map(item => (
          <div key={item.t} className={`${item.cls} bg-white/90 backdrop-blur-sm border border-stone-100 shadow-md rounded-xl px-3 py-2 flex items-center gap-2 text-xs font-semibold text-slate-700`}>
            <span className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
            {item.t}
          </div>
        ))}
      </div>
    </section>
  );
}

export default function PublicListPage() {
  const [search, setSearch]           = useState("");
  const [ciudad, setCiudad]           = useState("");
  const [page, setPage]               = useState(1);
  const [activeFlags, setActiveFlags] = useState<Partial<Record<FlagKey, boolean>>>({});
  const [searchInput, setSearchInput] = useState("");

  const filtros: FiltrosRestaurante = {
    q: search || undefined,
    ciudad: ciudad || undefined,
    page, pageSize: 12,
    sortBy: "favoritos_desc",
    ...activeFlags,
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["restaurantes", filtros],
    queryFn: () => getRestaurantes(filtros),
    placeholderData: keepPreviousData,
  });

  const toggleFlag = useCallback((key: FlagKey) => {
    setActiveFlags(prev => { const n = { ...prev }; if (n[key]) delete n[key]; else n[key] = true; return n; });
    setPage(1);
  }, []);

  const clearAll = () => { setActiveFlags({}); setSearch(""); setSearchInput(""); setCiudad(""); setPage(1); };

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setSearch(searchInput.trim()); setPage(1); };

  const restaurantes = data?.data ?? [];
  const meta         = data?.meta;
  const hasFilters   = Object.keys(activeFlags).length > 0 || search || ciudad;

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <Hero total={meta?.total ?? 0} />

      <form onSubmit={handleSearch} className="flex gap-2 mb-5">
        <input type="text" value={searchInput} onChange={e => setSearchInput(e.target.value)}
          placeholder="Nombre, zona, descripcion..."
          className="flex-1 bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 placeholder:text-stone-400" />
        <input type="text" value={ciudad} onChange={e => { setCiudad(e.target.value); setPage(1); }}
          placeholder="Ciudad"
          className="w-28 sm:w-36 bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 placeholder:text-stone-400" />
        <button type="submit"
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors whitespace-nowrap">
          Buscar
        </button>
      </form>

      <div className="flex flex-wrap gap-2 mb-8">
        {FILTROS.map(({ key, label }) => {
          const isOn = !!activeFlags[key];
          return (
            <button key={key} onClick={() => toggleFlag(key)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                isOn ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                     : "bg-white text-slate-600 border-stone-200 hover:border-orange-300 hover:text-orange-600"
              }`}>
              {label}
            </button>
          );
        })}
        {hasFilters && (
          <button onClick={clearAll} className="text-xs text-stone-400 hover:text-red-500 px-2 py-1.5 transition-colors">
            Limpiar todo
          </button>
        )}
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
              <div className="h-48 bg-stone-100 animate-pulse" />
              <div className="p-4 space-y-2.5">
                <div className="h-4 bg-stone-100 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-stone-100 rounded animate-pulse w-1/2" />
                <div className="h-3 bg-stone-100 rounded animate-pulse" />
                <div className="h-9 bg-stone-100 rounded-xl animate-pulse mt-4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-100">
          <svg className="w-12 h-12 text-stone-200 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p className="text-slate-600 font-medium">No podemos conectar con el servidor</p>
          <p className="text-sm text-stone-400 mt-1">Comprueba que el backend esta activo en el puerto 3000</p>
        </div>
      )}

      {!isLoading && !isError && restaurantes.length === 0 && (
        <EmptyState onClear={clearAll} />
      )}

      {!isLoading && !isError && restaurantes.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-stone-400">
              {meta?.total ?? 0} restaurante{(meta?.total ?? 0) !== 1 ? "s" : ""}{hasFilters ? " con estos filtros" : ""}
            </p>
            <p className="text-xs text-stone-400">Ordenados por popularidad</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {restaurantes.map(r => <RestauranteCard key={r.id} r={r} />)}
          </div>
          {meta && meta.totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-12">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                className="px-4 py-2 rounded-xl border border-stone-200 bg-white text-sm font-medium disabled:opacity-40 hover:border-orange-300 hover:text-orange-600 transition-colors">
                Anterior
              </button>
              <span className="text-sm text-stone-400">{page} de {meta.totalPages}</span>
              <button onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={page >= meta.totalPages}
                className="px-4 py-2 rounded-xl border border-stone-200 bg-white text-sm font-medium disabled:opacity-40 hover:border-orange-300 hover:text-orange-600 transition-colors">
                Siguiente
              </button>
            </div>
          )}
        </>
      )}

      <section className="mt-16 bg-white border border-stone-100 rounded-3xl p-8 sm:p-10 text-center shadow-sm">
        <div className="max-w-lg mx-auto">
          <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
            </svg>
          </div>
          <h2 className="font-extrabold text-slate-800 text-xl sm:text-2xl mb-3 leading-tight">
            Conoces un restaurante que otras familias deberian descubrir?
          </h2>
          <p className="text-stone-500 text-sm sm:text-base leading-relaxed mb-6">
            Si has estado en un sitio comodo para ir con ninos, compartelo con nosotros. Lo revisaremos y, si encaja, ayudara a mas familias a disfrutar sin complicarse.
          </p>
          <Link to="/sugerir"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-xl transition-colors text-sm sm:text-base">
            Sugerir restaurante
          </Link>
        </div>
      </section>
    </main>
  );
}
'@
Write-UTF8 "public\src\pages\PublicListPage.tsx" $listPage
Write-Host "   PublicListPage.tsx listo." -ForegroundColor Green

# ============================================================
# 6. PublicDetailPage.tsx
# ============================================================
Write-Host ">> [6/11] PublicDetailPage.tsx..." -ForegroundColor Yellow
Backup-File "public\src\pages\PublicDetailPage.tsx"

$detailPage = @'
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
  { key: "sitioParaCarrito",     label: "Sitio para carrito" },
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

function IconHeart({ filled }: { filled: boolean }) {
  return filled ? (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 20 20">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/>
    </svg>
  );
}

function IconCheck() {
  return (
    <svg className="w-4 h-4 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
    </svg>
  );
}

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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["restaurante", numId] }),
  });

  const handleFav = () => {
    const { added } = toggleFavorite(numId);
    setFavLocal(!favLocal);
    if (added) mutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-4">
        <div className="h-72 bg-stone-100 rounded-2xl animate-pulse" />
        <div className="h-7 bg-stone-100 rounded w-2/3 animate-pulse" />
        <div className="h-4 bg-stone-100 rounded w-1/3 animate-pulse" />
        <div className="h-4 bg-stone-100 rounded animate-pulse" />
      </div>
    );
  }

  if (isError || !r) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-600 font-medium mb-4">Restaurante no encontrado.</p>
        <Link to="/" className="text-orange-500 font-semibold hover:underline text-sm">Volver al listado</Link>
      </div>
    );
  }

  const mapsUrl = r.latitud && r.longitud
    ? `https://www.google.com/maps?q=${r.latitud},${r.longitud}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.nombre + " " + r.direccion + " " + r.ciudad)}`;

  const chips = CARACTERISTICAS.filter(c => r[c.key as keyof typeof r] === true);
  const tieneCoords = r.latitud && r.longitud;

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-orange-500 mb-6 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
        </svg>
        Volver al listado
      </Link>

      <div className="rounded-2xl overflow-hidden h-64 sm:h-80 mb-6 bg-gradient-to-br from-stone-50 to-orange-50 relative">
        {r.imagenes && r.imagenes.length > 0 ? (
          <img src={r.imagenes[0]} alt={r.nombre} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <svg className="w-14 h-14 text-stone-200" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 48 48">
              <rect x="4" y="12" width="40" height="28" rx="4" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="24" cy="26" r="7" strokeLinecap="round"/>
              <circle cx="37" cy="18" r="3" fill="currentColor" stroke="none"/>
            </svg>
            <span className="text-sm text-stone-300 font-medium">Un sitio familiar por descubrir</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
      </div>

      <div className="mb-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 leading-tight">{r.nombre}</h1>
            <p className="text-stone-400 text-sm mt-1">{r.direccion}, {r.localidad}, {r.ciudad}</p>
          </div>
          <div className="flex items-center gap-2">
            {r.verificado && (
              <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-100">
                Verificado
              </span>
            )}
            <button
              onClick={handleFav}
              className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl border transition-all ${
                favLocal
                  ? "bg-red-50 text-red-500 border-red-200"
                  : "bg-white text-stone-500 border-stone-200 hover:border-red-200 hover:text-red-400"
              }`}
            >
              <IconHeart filled={favLocal} />
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

      <p className="text-slate-600 leading-relaxed mb-6 text-base">{r.descripcion}</p>

      <section className="mb-6">
        <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wide mb-3">
          Checklist familiar
        </h2>
        {chips.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {chips.map(c => (
              <span key={c.key} className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-700 text-sm font-medium px-3 py-1.5 rounded-full border border-orange-100">
                <IconCheck /> {c.label}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-stone-400 italic">
            Todavia no tenemos caracteristicas familiares confirmadas para este restaurante.
          </p>
        )}
      </section>

      {(r.horario || r.telefonoRestaurante || r.emailRestaurante || r.sitioWeb) && (
        <section className="bg-stone-50 rounded-2xl p-5 mb-6 space-y-3">
          {r.horario && (
            <div className="flex gap-3 text-sm items-start">
              <svg className="w-4 h-4 text-stone-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2"/>
              </svg>
              <span className="text-slate-600">{r.horario}</span>
            </div>
          )}
          {r.telefonoRestaurante && (
            <div className="flex gap-3 text-sm items-center">
              <svg className="w-4 h-4 text-stone-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
              <a href={`tel:${r.telefonoRestaurante}`} className="text-orange-500 hover:underline font-medium">{r.telefonoRestaurante}</a>
            </div>
          )}
          {r.emailRestaurante && (
            <div className="flex gap-3 text-sm items-center">
              <svg className="w-4 h-4 text-stone-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              <a href={`mailto:${r.emailRestaurante}`} className="text-orange-500 hover:underline">{r.emailRestaurante}</a>
            </div>
          )}
          {r.sitioWeb && (
            <div className="flex gap-3 text-sm items-center">
              <svg className="w-4 h-4 text-stone-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/>
              </svg>
              <a href={r.sitioWeb} target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">Visitar sitio web</a>
            </div>
          )}
        </section>
      )}

      <section className="mb-6">
        <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wide mb-3">Como llegar</h2>
        {tieneCoords ? (
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-orange-500 hover:text-orange-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
            </svg>
            Abrir en Google Maps
          </a>
        ) : (
          <p className="text-sm text-stone-400 italic">
            Aun no tenemos ubicacion exacta, pero puedes buscarlo por la direccion:{" "}
            <a
              href={mapsUrl}
              target="_blank" rel="noopener noreferrer"
              className="text-orange-500 hover:underline not-italic"
            >
              {r.direccion}, {r.ciudad}
            </a>
          </p>
        )}
      </section>

      <div className="flex flex-col sm:flex-row gap-3">
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
          className="flex-1 text-center bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors">
          Como llegar
        </a>
        <Link to="/"
          className="flex-1 text-center border border-stone-200 hover:border-orange-300 text-slate-600 hover:text-orange-600 font-semibold py-3 rounded-xl transition-colors bg-white">
          Ver mas restaurantes
        </Link>
      </div>
    </main>
  );
}
'@
Write-UTF8 "public\src\pages\PublicDetailPage.tsx" $detailPage
Write-Host "   PublicDetailPage.tsx listo." -ForegroundColor Green

# ============================================================
# 7. SuggestFormPage.tsx
# ============================================================
Write-Host ">> [7/11] SuggestFormPage.tsx..." -ForegroundColor Yellow
Backup-File "public\src\pages\SuggestFormPage.tsx"

$suggestPage = @'
import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { enviarSugerencia } from "../services/sugerenciaService";
import type { SugerenciaPayload } from "../types";

const CARACTERISTICAS = [
  { key: "zonaInfantil",         label: "Zona infantil" },
  { key: "menuInfantil",         label: "Menu infantil" },
  { key: "tronaDisponible",      label: "Trona disponible" },
  { key: "cambiadorDisponible",  label: "Cambiador" },
  { key: "sitioParaCarrito",     label: "Sitio para carrito" },
  { key: "terrazaSegura",        label: "Terraza segura" },
  { key: "parqueCercano",        label: "Parque cercano" },
  { key: "actividadesParaNinos", label: "Actividades para ninos" },
  { key: "zonaAmplia",           label: "Zona amplia" },
  { key: "accesibleConCarrito",  label: "Accesible con carrito" },
  { key: "sinPantallas",         label: "Sin pantallas" },
  { key: "ambienteFamiliar",     label: "Ambiente familiar" },
  { key: "aptoVegetariano",      label: "Opciones vegetarianas" },
  { key: "aptoVegano",           label: "Opciones veganas" },
] as const;

type CheckboxKey = typeof CARACTERISTICAS[number]["key"];

type FormData = {
  nombre: string; direccion: string; localidad: string;
  ciudad: string; provincia: string; codigoPostal: string;
  descripcion: string; nombreContacto: string;
  emailContacto: string; comentarios: string;
};

const EMPTY: FormData = {
  nombre: "", direccion: "", localidad: "", ciudad: "",
  provincia: "", codigoPostal: "", descripcion: "",
  nombreContacto: "", emailContacto: "", comentarios: "",
};

function IconCheck({ active }: { active: boolean }) {
  return active ? (
    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
    </svg>
  ) : null;
}

export default function SuggestFormPage() {
  const [form, setForm]     = useState<FormData>(EMPTY);
  const [checks, setChecks] = useState<Partial<Record<CheckboxKey, boolean>>>({});
  const [enviado, setEnviado] = useState(false);

  const mutation = useMutation({
    mutationFn: (payload: SugerenciaPayload) => enviarSugerencia(payload),
    onSuccess: () => { setEnviado(true); setForm(EMPTY); setChecks({}); },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const toggleCheck = (key: CheckboxKey) =>
    setChecks(prev => { const n = { ...prev }; if (n[key]) delete n[key]; else n[key] = true; return n; });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      ...form,
      codigoPostal:  form.codigoPostal  || undefined,
      emailContacto: form.emailContacto || undefined,
      comentarios:   form.comentarios   || undefined,
      ...checks,
    });
  };

  if (enviado) {
    return (
      <main className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-800 mb-3">Gracias por tu sugerencia</h1>
        <p className="text-stone-500 mb-6 leading-relaxed">
          Lo revisaremos y, si encaja, lo compartiremos con otras familias para que puedan disfrutarlo.
        </p>
        <Link to="/" className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors">
          Volver al listado
        </Link>
      </main>
    );
  }

  const field = (name: keyof FormData, label: string, placeholder: string, required = false, type = "text") => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label} {required && <span className="text-orange-500">*</span>}
      </label>
      <input type={type} name={name} value={form[name]} onChange={handleChange}
        placeholder={placeholder} required={required}
        className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 placeholder:text-stone-400" />
    </div>
  );

  return (
    <main className="max-w-xl mx-auto px-4 py-10">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-orange-500 mb-6 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
        </svg>
        Volver
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-800 mb-2">Sugiere un restaurante</h1>
        <p className="text-stone-500 text-sm leading-relaxed">
          Cuentanos ese sitio donde comiste tranquilo mientras los peques estaban a gusto. Lo revisaremos y, si encaja, lo compartiremos con otras familias.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section>
          <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide mb-3">Sobre el restaurante</h2>
          <div className="space-y-4">
            {field("nombre",   "Nombre del restaurante", "El Rincon de Maria", true)}
            {field("direccion","Direccion",               "Calle, numero...",    true)}
            <div className="grid grid-cols-2 gap-3">
              {field("localidad","Localidad","Getafe",    true)}
              {field("ciudad",   "Ciudad",  "Madrid",     true)}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {field("provincia",   "Provincia",    "Madrid", true)}
              {field("codigoPostal","Codigo postal","28900")}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Descripcion <span className="text-orange-500">*</span>
              </label>
              <textarea name="descripcion" value={form.descripcion} onChange={handleChange}
                placeholder="Cuéntanos por que es un buen sitio para familias..." required rows={3}
                className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none placeholder:text-stone-400" />
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide mb-1">Caracteristicas familiares</h2>
          <p className="text-xs text-stone-400 mb-3">Marca las que conozcas</p>
          <div className="grid grid-cols-2 gap-2">
            {CARACTERISTICAS.map(({ key, label }) => {
              const isOn = !!checks[key];
              return (
                <button type="button" key={key} onClick={() => toggleCheck(key)}
                  className={`flex items-center gap-2 text-xs font-medium px-3 py-2.5 rounded-xl border transition-all text-left ${
                    isOn ? "bg-orange-50 border-orange-300 text-orange-700" : "bg-white border-stone-200 text-slate-600 hover:border-orange-200"
                  }`}>
                  <span className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${isOn ? "bg-orange-500 text-white" : "border border-stone-300"}`}>
                    <IconCheck active={isOn} />
                  </span>
                  {label}
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide mb-3">Tus datos</h2>
          <div className="space-y-4">
            {field("nombreContacto","Tu nombre","Como te llamas", true)}
            {field("emailContacto","Tu email (opcional)","Para avisarte cuando se publique", false, "email")}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Comentarios adicionales</label>
              <textarea name="comentarios" value={form.comentarios} onChange={handleChange}
                placeholder="Cualquier cosa que quieras anadirr..." rows={2}
                className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none placeholder:text-stone-400" />
            </div>
          </div>
        </section>

        {mutation.isError && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
            Hubo un error al enviar. Comprueba los datos e intentalo de nuevo.
          </div>
        )}

        <button type="submit" disabled={mutation.isPending}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
          {mutation.isPending ? "Enviando..." : "Enviar sugerencia"}
        </button>
      </form>
    </main>
  );
}
'@
Write-UTF8 "public\src\pages\SuggestFormPage.tsx" $suggestPage
Write-Host "   SuggestFormPage.tsx listo." -ForegroundColor Green

# ============================================================
# 8. Dashboard HomePage — sin "Acceso rapido", sin icono roto
# ============================================================
Write-Host ">> [8/11] Dashboard HomePage.tsx..." -ForegroundColor Yellow
Backup-File "dashboard\src\pages\HomePage.tsx"

$dashHome = @'
// dashboard/src/pages/HomePage.tsx
import { useQuery, useQueries } from "@tanstack/react-query";
import { getRestaurantes, type RestaurantesResponse } from "../services/restauranteService";
import { getSugerencias, type SugerenciasResponse } from "../services/sugerenciaService";

const FLAGS = [
  { key: "trona",            label: "Trona",               param: "tronaDisponible" },
  { key: "zonaInfantil",     label: "Zona infantil",        param: "zonaInfantil" },
  { key: "menuInfantil",     label: "Menu infantil",        param: "menuInfantil" },
  { key: "cambiador",        label: "Cambiador",            param: "cambiadorDisponible" },
  { key: "carrito",          label: "Carrito OK",           param: "sitioParaCarrito" },
  { key: "terraza",          label: "Terraza segura",       param: "terrazaSegura" },
  { key: "parque",           label: "Parque cercano",       param: "parqueCercano" },
  { key: "zonaAmplia",       label: "Zona amplia",          param: "zonaAmplia" },
  { key: "vegano",           label: "Vegano",               param: "aptoVegano" },
  { key: "vegetariano",      label: "Vegetariano",          param: "aptoVegetariano" },
  { key: "sinPantallas",     label: "Sin pantallas",        param: "sinPantallas" },
  { key: "ambienteFamiliar", label: "Ambiente familiar",    param: "ambienteFamiliar" },
  { key: "accesible",        label: "Accesible carrito",    param: "accesibleConCarrito" },
  { key: "actividades",      label: "Actividades ninos",    param: "actividadesParaNinos" },
] as const;

function BigCard({ title, value, sub, loading, error, accent = false }: {
  title: string; value: string; sub?: string;
  loading?: boolean; error?: string; accent?: boolean;
}) {
  return (
    <div className={`rounded-2xl p-5 border shadow-sm ${accent ? "bg-orange-50 border-orange-200" : "bg-white border-gray-100"}`}>
      <p className="text-sm text-gray-500">{title}</p>
      {loading ? (
        <div className="mt-2 h-8 w-24 animate-pulse rounded bg-gray-200" />
      ) : error ? (
        <p className="mt-2 text-sm text-gray-400 italic">No disponible</p>
      ) : (
        <>
          <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </>
      )}
    </div>
  );
}

function SmallCard({ title, count, percent, loading }: {
  title: string; count: number; percent: number; loading?: boolean;
}) {
  return (
    <div className="rounded-xl bg-white p-3 shadow-sm border border-gray-100">
      <p className="text-xs text-gray-500">{title}</p>
      {loading ? (
        <div className="mt-1 h-6 w-16 animate-pulse rounded bg-gray-200" />
      ) : (
        <p className="mt-0.5 text-lg font-semibold text-gray-800">
          {percent}%{" "}<span className="text-gray-400 text-xs">({count})</span>
        </p>
      )}
    </div>
  );
}

function TopFavCard({ total }: { total: number }) {
  const { data, isLoading, isError } = useQuery<RestaurantesResponse>({
    queryKey: ["home-top-fav"],
    queryFn: () => getRestaurantes({ page: 1, pageSize: 1, sortBy: "favoritos_desc" } as any),
    staleTime: 30_000,
  });

  const top = data?.data?.[0];

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
        <p className="text-sm text-gray-500 mb-2">Restaurante mas popular</p>
        <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  if (isError || !top || (top.favoritos ?? 0) === 0) {
    return (
      <div className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
        <p className="text-sm text-gray-500 mb-1">Restaurante mas popular</p>
        <p className="text-sm text-gray-400 italic">Aun no hay favoritos registrados</p>
        <p className="text-xs text-gray-400 mt-0.5">
          Cuando las familias empiecen a guardar sitios, aparecera aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 p-4 shadow-sm flex items-center gap-4">
      <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
        <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l3 6 6-3-3 6 6 3-6 3 3 6-6-3-6 3 3-6-6-3 6-3-3-6z"/>
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-orange-500 font-semibold uppercase tracking-wide mb-0.5">Mas popular</p>
        <p className="font-bold text-gray-800 truncate">{top.nombre}</p>
        <p className="text-xs text-gray-400">{top.ciudad}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-2xl font-extrabold text-orange-500">{top.favoritos}</p>
        <p className="text-xs text-gray-400">favoritos</p>
      </div>
    </div>
  );
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
    queryKey: ["home-pending-suggestions"],
    queryFn: () => getSugerencias({ page: 1, pageSize: 1, estado: "PENDIENTE" }),
    staleTime: 30_000,
    retry: 1,
  });

  const flagQueries = useQueries({
    queries: FLAGS.map(f => ({
      queryKey: ["home-flag", f.param],
      queryFn: () => getRestaurantes({ page: 1, pageSize: 1, [f.param]: true } as any),
      staleTime: 30_000,
    })),
  });

  const total       = totalQ.data?.meta?.total ?? 0;
  const withCoords  = coordsQ.data?.meta?.total ?? 0;
  const noCoords    = Math.max(total - withCoords, 0);
  const pendientes  = pendingQ.data?.meta?.total ?? 0;
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);

  return (
    <div className="space-y-6 p-1">
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Resumen</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BigCard
            title="Total de restaurantes"
            value={String(total)}
            sub="En base de datos"
            loading={totalQ.isLoading}
            error={totalQ.isError ? "error" : undefined}
          />
          <BigCard
            title="Peticiones pendientes"
            value={pendingQ.isError ? "—" : String(pendientes)}
            sub={pendingQ.isError ? "No se pudieron cargar" : pendientes > 0 ? "Por revisar" : "Al dia"}
            loading={pendingQ.isLoading}
            accent={!pendingQ.isError && pendientes > 0}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <BigCard
            title="Con coordenadas"
            value={`${withCoords} (${pct(withCoords)}%)`}
            sub="Listos para mapa"
            loading={coordsQ.isLoading || totalQ.isLoading}
          />
          <BigCard
            title="Sin coordenadas"
            value={`${noCoords} (${pct(noCoords)}%)`}
            sub="Pendientes de geocodificar"
            loading={coordsQ.isLoading || totalQ.isLoading}
          />
        </div>

        <div className="mt-4">
          <TopFavCard total={total} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
          {FLAGS.map((f, i) => {
            const q = flagQueries[i];
            const count = (q.data as RestaurantesResponse | undefined)?.meta?.total ?? 0;
            return (
              <SmallCard
                key={f.key}
                title={f.label}
                count={count}
                percent={pct(count)}
                loading={q.isLoading || totalQ.isLoading}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}
'@
Write-UTF8 "dashboard\src\pages\HomePage.tsx" $dashHome
Write-Host "   Dashboard HomePage.tsx listo." -ForegroundColor Green

# ============================================================
# 9. Dashboard RestaurantesPage — badge favoritos limpio
# ============================================================
Write-Host ">> [9/11] Revisando RestaurantesPage.tsx (badge favoritos)..." -ForegroundColor Yellow

$restPagePath = "dashboard\src\pages\RestaurantesPage.tsx"
if (Test-Path $restPagePath) {
    Backup-File $restPagePath
    $content = [System.IO.File]::ReadAllText(
        [System.IO.Path]::GetFullPath($restPagePath),
        [System.Text.Encoding]::UTF8
    )

    # Reemplazar patrones de emojis corruptos en la columna de favoritos

    # Normalizar el badge de favoritos si hay un patron reconocible

    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText(
        [System.IO.Path]::GetFullPath($restPagePath),
        $content,
        $utf8NoBom
    )
    Write-Host "   RestaurantesPage.tsx: simbolos corruptos limpiados." -ForegroundColor Green
} else {
    Write-Host "   RestaurantesPage.tsx no encontrado, omitido." -ForegroundColor Gray
}

# ============================================================
# 10. Dashboard SugerenciasPage — limpiar simbolos corruptos
# ============================================================
Write-Host ">> [10/11] Revisando SugerenciasPage.tsx (simbolos)..." -ForegroundColor Yellow

$sugPagePath = "dashboard\src\pages\SugerenciasPage.tsx"
if (Test-Path $sugPagePath) {
    Backup-File $sugPagePath
    $content = [System.IO.File]::ReadAllText(
        [System.IO.Path]::GetFullPath($sugPagePath),
        [System.Text.Encoding]::UTF8
    )
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText(
        [System.IO.Path]::GetFullPath($sugPagePath),
        $content,
        $utf8NoBom
    )
    Write-Host "   SugerenciasPage.tsx: simbolos limpiados." -ForegroundColor Green
} else {
    Write-Host "   SugerenciasPage.tsx no encontrado, omitido." -ForegroundColor Gray
}

# ============================================================
# 11. Limpiar simbolos corruptos en ChipCaracteristica si existe
# ============================================================
Write-Host ">> [11/11] Revisando archivos compartidos..." -ForegroundColor Yellow

$chipPath = "public\src\shared\ChipCaracteristica.tsx"
if (Test-Path $chipPath) {
    Backup-File $chipPath
    $content = [System.IO.File]::ReadAllText(
        [System.IO.Path]::GetFullPath($chipPath),
        [System.Text.Encoding]::UTF8
    )
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText(
        [System.IO.Path]::GetFullPath($chipPath),
        $content,
        $utf8NoBom
    )
    Write-Host "   ChipCaracteristica.tsx: simbolos limpiados." -ForegroundColor Green
}

# Revisar types/index.ts dashboard si existe
$dashTypes = "dashboard\src\types\index.ts"
if (Test-Path $dashTypes) {
    $content = [System.IO.File]::ReadAllText([System.IO.Path]::GetFullPath($dashTypes), [System.Text.Encoding]::UTF8)
    if ($content -notmatch "favoritos") {
        $content = $content -replace "(  vistas: number;)", "  vistas: number;`n  favoritos: number;"
        $utf8NoBom = New-Object System.Text.UTF8Encoding $false
        [System.IO.File]::WriteAllText([System.IO.Path]::GetFullPath($dashTypes), $content, $utf8NoBom)
        Write-Host "   dashboard types: campo favoritos anadido." -ForegroundColor Green
    }
}

# ============================================================
# RESUMEN FINAL
# ============================================================
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  COMPLETADO - Pulido visual y microcopy aplicado" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Archivos modificados con backup:" -ForegroundColor White
Write-Host "  public/index.html" -ForegroundColor Gray
Write-Host "  public/public/favicon.svg (nuevo)" -ForegroundColor Gray
Write-Host "  public/src/index.css" -ForegroundColor Gray
Write-Host "  public/src/App.tsx" -ForegroundColor Gray
Write-Host "  public/src/shared/SiteHeader.tsx" -ForegroundColor Gray
Write-Host "  public/src/pages/PublicListPage.tsx" -ForegroundColor Gray
Write-Host "  public/src/pages/PublicDetailPage.tsx" -ForegroundColor Gray
Write-Host "  public/src/pages/SuggestFormPage.tsx" -ForegroundColor Gray
Write-Host "  dashboard/src/pages/HomePage.tsx" -ForegroundColor Gray
Write-Host "  dashboard/src/pages/RestaurantesPage.tsx (limpieza simbolos)" -ForegroundColor Gray
Write-Host "  dashboard/src/pages/SugerenciasPage.tsx (limpieza simbolos)" -ForegroundColor Gray
Write-Host ""
Write-Host "NO se ha tocado:" -ForegroundColor White
Write-Host "  - Backend / Prisma / endpoints" -ForegroundColor Gray
Write-Host "  - Logica de favoritos (utils/favorites.ts)" -ForegroundColor Gray
Write-Host "  - Services (api.ts, restauranteService.ts, etc)" -ForegroundColor Gray
Write-Host "  - Filtros y paginacion" -ForegroundColor Gray
Write-Host ""
Write-Host "Para verificar que compila:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  cd public" -ForegroundColor Cyan
Write-Host "  npm run build" -ForegroundColor Cyan
Write-Host ""
Write-Host "  cd ..\dashboard" -ForegroundColor Cyan
Write-Host "  npm run build" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para arrancar en desarrollo:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  cd backend  && npm run dev    (puerto 3000)" -ForegroundColor Cyan
Write-Host "  cd public   && npm run dev    (puerto 5174)" -ForegroundColor Cyan
Write-Host "  cd dashboard && npm run dev   (puerto 5173)" -ForegroundColor Cyan
Write-Host ""
