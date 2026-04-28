# ============================================================
# SCRIPT: mejorar_visual_public.ps1
# Mejora tono visual y textos del frontend publico
# Toca SOLO: PublicListPage.tsx, SiteHeader.tsx, index.css, App.tsx (footer)
# EJECUTAR DESDE: raiz del proyecto
# ============================================================

$ErrorActionPreference = "Continue"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  DCH - Mejora visual frontend publico" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path "public")) {
    Write-Host "ERROR: Ejecuta desde la raiz del proyecto (donde esta public/)" -ForegroundColor Red
    exit 1
}

function Backup-File {
    param([string]$Path)
    if (Test-Path $Path) {
        $ts = Get-Date -Format 'yyyyMMdd_HHmmss'
        $bp = "$Path.backup_$ts"
        Copy-Item $Path $bp -Force
        Write-Host "   Backup: $bp" -ForegroundColor Gray
    }
}

# ============================================================
# 1. index.css
# ============================================================
Write-Host ""
Write-Host ">> [1/4] Escribiendo index.css..." -ForegroundColor Yellow
Backup-File "public\src\index.css"

@'
@import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    font-family: 'Inter', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    @apply bg-[#faf9f7] text-slate-800 min-h-screen;
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

/* Blob decorativo animado */
@keyframes blob-move {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33%       { transform: translate(20px, -15px) scale(1.04); }
  66%       { transform: translate(-10px, 12px) scale(0.97); }
}

.blob {
  animation: blob-move 10s ease-in-out infinite;
}

.blob-delay-2 { animation-delay: 2s; }
.blob-delay-4 { animation-delay: 4s; }

/* Tarjeta flotante del hero */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-6px); }
}

.float-card {
  animation: float 4s ease-in-out infinite;
}
.float-card-b { animation: float 4.5s ease-in-out 0.5s infinite; }
.float-card-c { animation: float 5s   ease-in-out 1s   infinite; }
.float-card-d { animation: float 4.2s ease-in-out 1.5s infinite; }

/* Scroll suave */
html { scroll-behavior: smooth; }
'@ | Set-Content -Path "public\src\index.css" -Encoding UTF8
Write-Host "   index.css listo." -ForegroundColor Green

# ============================================================
# 2. SiteHeader.tsx
# ============================================================
Write-Host ""
Write-Host ">> [2/4] Escribiendo SiteHeader.tsx..." -ForegroundColor Yellow
Backup-File "public\src\shared\SiteHeader.tsx"

@'
import { Link, useLocation } from "react-router-dom";

export default function SiteHeader() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-100 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:bg-orange-600 transition-colors">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 2C8 2 4 6 4 10c0 5 8 12 8 12s8-7 8-12c0-4-4-8-8-8z" />
              <circle cx="12" cy="10" r="2.5" fill="currentColor" stroke="none" />
            </svg>
          </div>
          <div className="leading-tight">
            <p className="font-bold text-slate-800 text-sm sm:text-[15px]">Donde Comemos Hoy</p>
            <p className="text-[10px] text-stone-400 hidden sm:block">Para familias con ninos</p>
          </div>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          <Link
            to="/"
            className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
              isActive("/")
                ? "text-orange-600 bg-orange-50"
                : "text-slate-500 hover:text-slate-800 hover:bg-stone-100"
            }`}
          >
            Restaurantes
          </Link>
          <Link
            to="/sugerir"
            className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
              isActive("/sugerir")
                ? "text-orange-600 bg-orange-50"
                : "text-slate-500 hover:text-slate-800 hover:bg-stone-100"
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
Write-Host "   SiteHeader.tsx listo." -ForegroundColor Green

# ============================================================
# 3. App.tsx — footer mejorado
# ============================================================
Write-Host ""
Write-Host ">> [3/4] Actualizando App.tsx (footer)..." -ForegroundColor Yellow
Backup-File "public\src\App.tsx"

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
                <p className="text-6xl font-black text-stone-200 mb-4">404</p>
                <p className="text-slate-500 mb-6">Esta pagina no existe.</p>
                <a
                  href="/"
                  className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
                >
                  Volver al inicio
                </a>
              </div>
            }
          />
        </Routes>
      </div>

      <footer className="border-t border-stone-100 bg-white py-6 mt-16">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-stone-400 text-center sm:text-left">
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
'@ | Set-Content -Path "public\src\App.tsx" -Encoding UTF8
Write-Host "   App.tsx (footer) listo." -ForegroundColor Green

# ============================================================
# 4. PublicListPage.tsx — hero mejorado + cards calidas
# ============================================================
Write-Host ""
Write-Host ">> [4/4] Escribiendo PublicListPage.tsx (hero + cards)..." -ForegroundColor Yellow
Backup-File "public\src\pages\PublicListPage.tsx"

@'
import { useState, useCallback } from "react";
import { useQuery, keepPreviousData, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getRestaurantes, postFavorito } from "../services/restauranteService";
import type { FiltrosRestaurante, Restaurante } from "../types";
import { isFavorite, toggleFavorite } from "../utils/favorites";

// ---------------------------------------------------------------
// Configuracion de filtros
// ---------------------------------------------------------------
const FILTROS_OPCIONES = [
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

type FlagKey = typeof FILTROS_OPCIONES[number]["key"];

// ---------------------------------------------------------------
// Badge de popularidad
// ---------------------------------------------------------------
function getBadge(r: Restaurante): { label: string; cls: string } | null {
  const f = r.favoritos ?? 0;
  if (f >= 50) return { label: "Top de la zona",    cls: "bg-red-500 text-white" };
  if (f >= 30) return { label: "Top familias",       cls: "bg-orange-500 text-white" };
  if (f >= 15) return { label: "Favorito familias",  cls: "bg-amber-400 text-white" };
  if (f >= 5)  return { label: "Recomendado",        cls: "bg-green-500 text-white" };
  const flagCount = [
    r.zonaInfantil, r.menuInfantil, r.tronaDisponible, r.cambiadorDisponible,
    r.sitioParaCarrito, r.terrazaSegura, r.actividadesParaNinos, r.zonaAmplia,
    r.parqueCercano, r.accesibleConCarrito, r.ambienteFamiliar,
  ].filter(Boolean).length;
  if (r.zonaInfantil && r.menuInfantil) return { label: "Ideal ninos",        cls: "bg-blue-500 text-white" };
  if (flagCount >= 7)                   return { label: "Perfecto familias",   cls: "bg-purple-500 text-white" };
  return null;
}

// ---------------------------------------------------------------
// Chips visibles en cards
// ---------------------------------------------------------------
const CHIPS_CARD = [
  { key: "zonaInfantil",        label: "Zona infantil" },
  { key: "menuInfantil",        label: "Menu infantil" },
  { key: "tronaDisponible",     label: "Trona" },
  { key: "cambiadorDisponible", label: "Cambiador" },
  { key: "terrazaSegura",       label: "Terraza" },
  { key: "parqueCercano",       label: "Parque" },
] as const;

// ---------------------------------------------------------------
// Icono SVG de ubicacion
// ---------------------------------------------------------------
function IconPin() {
  return (
    <svg className="w-3 h-3 inline-block flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 2a6 6 0 00-6 6c0 4.418 6 10 6 10s6-5.582 6-10a6 6 0 00-6-6zm0 8a2 2 0 110-4 2 2 0 010 4z" clipRule="evenodd"/>
    </svg>
  );
}

// ---------------------------------------------------------------
// Icono corazon
// ---------------------------------------------------------------
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

// ---------------------------------------------------------------
// Icono mapa
// ---------------------------------------------------------------
function IconMap() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
    </svg>
  );
}

// ---------------------------------------------------------------
// Placeholder sin imagen
// ---------------------------------------------------------------
function PlaceholderImg() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-stone-50 to-orange-50">
      <svg className="w-10 h-10 text-stone-200" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M3 7c0-1.1.9-2 2-2h2l2-2h6l2 2h2a2 2 0 012 2v11a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/>
        <circle cx="12" cy="13" r="3" strokeLinecap="round"/>
      </svg>
      <span className="text-xs text-stone-300 font-medium">Foto pendiente</span>
    </div>
  );
}

// ---------------------------------------------------------------
// Card de restaurante
// ---------------------------------------------------------------
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
      {/* Imagen */}
      <div className="relative h-48 overflow-hidden flex-shrink-0">
        {imagen ? (
          <img
            src={imagen}
            alt={r.nombre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              const el = e.currentTarget;
              el.style.display = "none";
              const parent = el.parentElement;
              if (parent && !parent.querySelector(".placeholder-shown")) {
                const ph = document.createElement("div");
                ph.className = "w-full h-full absolute inset-0 placeholder-shown";
                ph.innerHTML = `<div class="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-stone-50 to-orange-50"><svg class="w-10 h-10 text-stone-200" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 7c0-1.1.9-2 2-2h2l2-2h6l2 2h2a2 2 0 012 2v11a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/><circle cx="12" cy="13" r="3"/></svg><span class="text-xs text-stone-300 font-medium">Foto pendiente</span></div>`;
                parent.appendChild(ph);
              }
            }}
          />
        ) : (
          <PlaceholderImg />
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />

        {/* Badge */}
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

        {/* Boton favorito */}
        <button
          onClick={handleFav}
          aria-label={favLocal ? "Quitar de favoritos" : "Guardar como favorito"}
          className={`absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all border ${
            favLocal
              ? "bg-red-500 text-white border-red-500"
              : "bg-white/90 text-stone-400 border-white hover:text-red-400 hover:scale-110"
          }`}
        >
          <IconHeart filled={favLocal} />
        </button>

        {/* Contador favoritos */}
        {(r.favoritos ?? 0) > 0 && (
          <div className="absolute bottom-2 right-3 flex items-center gap-1 bg-black/50 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm">
            <IconHeart filled={true} />
            <span>{r.favoritos}</span>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4 flex flex-col flex-1">
        <div className="mb-2">
          <h2 className="font-bold text-slate-800 text-[15px] leading-snug line-clamp-1">{r.nombre}</h2>
          <p className="text-xs text-stone-400 mt-0.5 flex items-center gap-1">
            <IconPin />
            {r.localidad}, {r.ciudad}
          </p>
        </div>

        <p className="text-sm text-slate-500 line-clamp-2 mb-3 leading-relaxed">{r.descripcion}</p>

        {chips.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {chips.map(c => (
              <span
                key={c.key}
                className="text-[11px] bg-orange-50 text-orange-600 border border-orange-100 px-2 py-0.5 rounded-full font-medium"
              >
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
            title="Abrir en Google Maps"
            className="flex items-center gap-1.5 px-3 py-2.5 border border-stone-200 rounded-xl text-stone-500 hover:text-orange-600 hover:border-orange-200 hover:bg-orange-50 transition-all text-xs font-medium"
          >
            <IconMap />
            <span>Abrir mapa</span>
          </a>
        </div>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------
// Hero
// ---------------------------------------------------------------
function Hero({ total }: { total: number }) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-50 via-amber-50 to-stone-50 border border-orange-100 px-6 py-12 sm:py-16 mb-10">
      {/* Blobs decorativos */}
      <div className="blob absolute -top-16 -right-16 w-64 h-64 bg-orange-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="blob blob-delay-2 absolute -bottom-12 -left-12 w-56 h-56 bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="blob blob-delay-4 absolute top-1/2 right-1/4 w-32 h-32 bg-orange-100/50 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 max-w-2xl">
        {/* Eyebrow */}
        {total > 0 && (
          <span className="inline-block text-xs font-semibold text-orange-600 bg-orange-100 px-3 py-1 rounded-full mb-4">
            {total} restaurante{total !== 1 ? "s" : ""} verificado{total !== 1 ? "s" : ""}
          </span>
        )}

        {/* Titulo */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 leading-tight mb-4">
          Deja de darle vueltas: encuentra un sitio donde comer con tus peques
        </h1>

        {/* Subtitulo */}
        <p className="text-slate-500 text-base sm:text-lg leading-relaxed mb-3 max-w-xl">
          Restaurantes pensados para familias reales: carritos, tronas, zonas amplias, menus infantiles
          y esos pequenos detalles que hacen que comer fuera no sea una mision imposible.
        </p>

        <p className="text-sm text-stone-400">
          Busca, filtra y guarda tus favoritos para decidir mas rapido.
        </p>
      </div>

      {/* Tarjetas flotantes */}
      <div className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 hidden sm:flex flex-col gap-2.5 z-10">
        {[
          { t: "Trona disponible",  i: "trona" },
          { t: "Parque cerca",      i: "parque" },
          { t: "Terraza segura",    i: "terraza" },
          { t: "Menu infantil",     i: "menu" },
        ].map((item, idx) => (
          <div
            key={item.i}
            className={`bg-white/90 backdrop-blur-sm border border-stone-100 shadow-md rounded-xl px-3 py-2 flex items-center gap-2 text-xs font-semibold text-slate-700 ${
              idx === 0 ? "float-card" :
              idx === 1 ? "float-card-b" :
              idx === 2 ? "float-card-c" : "float-card-d"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
            {item.t}
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------
// Pagina principal
// ---------------------------------------------------------------
export default function PublicListPage() {
  const [search, setSearch]           = useState("");
  const [ciudad, setCiudad]           = useState("");
  const [page, setPage]               = useState(1);
  const [activeFlags, setActiveFlags] = useState<Partial<Record<FlagKey, boolean>>>({});
  const [searchInput, setSearchInput] = useState("");

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
  const meta         = data?.meta;
  const hasFilters   = Object.keys(activeFlags).length > 0 || search || ciudad;

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      {/* Hero */}
      <Hero total={meta?.total ?? 0} />

      {/* Buscador */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-5">
        <input
          type="text"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          placeholder="Nombre, zona, descripcion..."
          className="flex-1 bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 placeholder:text-stone-400"
        />
        <input
          type="text"
          value={ciudad}
          onChange={e => { setCiudad(e.target.value); setPage(1); }}
          placeholder="Ciudad"
          className="w-28 sm:w-36 bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 placeholder:text-stone-400"
        />
        <button
          type="submit"
          className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors whitespace-nowrap"
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
                  : "bg-white text-slate-600 border-stone-200 hover:border-orange-300 hover:text-orange-600"
              }`}
            >
              {label}
            </button>
          );
        })}
        {hasFilters && (
          <button
            onClick={() => {
              setActiveFlags({});
              setSearch("");
              setSearchInput("");
              setCiudad("");
              setPage(1);
            }}
            className="text-xs text-stone-400 hover:text-red-500 px-2 py-1.5 transition-colors"
          >
            Limpiar todo
          </button>
        )}
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
              <div className="h-48 bg-stone-100 animate-pulse" />
              <div className="p-4 space-y-2.5">
                <div className="h-4 bg-stone-100 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-stone-100 rounded animate-pulse w-1/2" />
                <div className="h-3 bg-stone-100 rounded animate-pulse" />
                <div className="h-3 bg-stone-100 rounded animate-pulse w-5/6" />
                <div className="h-9 bg-stone-100 rounded-xl animate-pulse mt-4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-100">
          <svg className="w-12 h-12 text-stone-200 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p className="text-slate-600 font-medium">No podemos conectar con el servidor</p>
          <p className="text-sm text-stone-400 mt-1">Comprueba que el backend esta activo en el puerto 3000</p>
        </div>
      )}

      {/* Sin resultados */}
      {!isLoading && !isError && restaurantes.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-100">
          <svg className="w-12 h-12 text-stone-200 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <p className="text-slate-600 font-semibold">No encontramos nada con esos filtros</p>
          <p className="text-sm text-stone-400 mt-1">Prueba con otros filtros o busca en otra ciudad</p>
          <Link
            to="/sugerir"
            className="mt-5 inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            Sugerir un restaurante
          </Link>
        </div>
      )}

      {/* Grid de restaurantes */}
      {!isLoading && !isError && restaurantes.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-stone-400">
              {meta?.total ?? 0} restaurante{(meta?.total ?? 0) !== 1 ? "s" : ""}
              {hasFilters ? " con estos filtros" : ""}
            </p>
            <p className="text-xs text-stone-400">Ordenados por popularidad</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {restaurantes.map(r => <RestauranteCard key={r.id} r={r} />)}
          </div>

          {/* Paginacion */}
          {meta && meta.totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-12">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-4 py-2 rounded-xl border border-stone-200 text-sm font-medium bg-white disabled:opacity-40 hover:border-orange-300 hover:text-orange-600 transition-colors"
              >
                Anterior
              </button>
              <span className="text-sm text-stone-400">
                {page} de {meta.totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                disabled={page >= meta.totalPages}
                className="px-4 py-2 rounded-xl border border-stone-200 text-sm font-medium bg-white disabled:opacity-40 hover:border-orange-300 hover:text-orange-600 transition-colors"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}

      {/* CTA sugerir */}
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
            Si has estado en un sitio comodo para ir con ninos, compartelo con nosotros.
            Lo revisaremos y, si encaja, ayudara a mas familias a disfrutar sin complicarse.
          </p>
          <Link
            to="/sugerir"
            className="inline-block bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold px-8 py-3 rounded-xl transition-colors text-sm sm:text-base"
          >
            Sugerir restaurante
          </Link>
        </div>
      </section>
    </main>
  );
}
'@ | Set-Content -Path "public\src\pages\PublicListPage.tsx" -Encoding UTF8
Write-Host "   PublicListPage.tsx listo." -ForegroundColor Green

# ============================================================
# RESUMEN
# ============================================================
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  COMPLETADO" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Archivos modificados:" -ForegroundColor White
Write-Host "  public/src/index.css            -> fuente Inter, animaciones blob/float" -ForegroundColor Gray
Write-Host "  public/src/shared/SiteHeader.tsx -> logo SVG, nav limpio" -ForegroundColor Gray
Write-Host "  public/src/App.tsx              -> footer: 'Hecho por familias, para familias'" -ForegroundColor Gray
Write-Host "  public/src/pages/PublicListPage.tsx -> hero nuevo, cards calidas, SVG icons, CTA mejorado" -ForegroundColor Gray
Write-Host ""
Write-Host "NO se han tocado:" -ForegroundColor White
Write-Host "  - Backend" -ForegroundColor Gray
Write-Host "  - Dashboard" -ForegroundColor Gray
Write-Host "  - Servicios (api.ts, restauranteService.ts, etc)" -ForegroundColor Gray
Write-Host "  - utils/favorites.ts" -ForegroundColor Gray
Write-Host "  - PublicDetailPage.tsx" -ForegroundColor Gray
Write-Host "  - SuggestFormPage.tsx" -ForegroundColor Gray
Write-Host ""
Write-Host "Para ver los cambios:" -ForegroundColor Yellow
Write-Host "  cd public && npm run dev" -ForegroundColor Cyan
Write-Host "  Abre: http://localhost:5174" -ForegroundColor Cyan
Write-Host ""
