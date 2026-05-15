import { useState, useCallback, useEffect, useRef } from "react";
import {
  useQuery,
  keepPreviousData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getRestaurantes, postFavorito } from "../services/restauranteService";
import type { FiltrosRestaurante, Restaurante } from "../types";
import { isFavorite, toggleFavorite } from "../utils/favorites";

const FILTROS = [
  { key: "zonaInfantil", label: "Zona infantil" },
  { key: "menuInfantil", label: "Menú infantil" },
  { key: "tronaDisponible", label: "Trona disponible" },
  { key: "cambiadorDisponible", label: "Cambiador" },
  { key: "sitioParaCarrito", label: "Sitio para carrito" },
  { key: "terrazaSegura", label: "Terraza segura" },
  { key: "parqueCercano", label: "Parque cercano" },
  { key: "actividadesParaNinos", label: "Actividades" },
  { key: "zonaAmplia", label: "Espacio amplio" },
  { key: "accesibleConCarrito", label: "Accesible" },
  { key: "aptoVegetariano", label: "Vegetariano" },
  { key: "aptoVegano", label: "Vegano" },
] as const;



const MOOD_FILTERS = [
  {
    label: "Padres tranquilos",
    emoji: "☕",
    query: "padres tranquilos",
    helper: "Sitios donde los peques se entretienen y tú respiras.",
  },
  {
    label: "Comer mientras juegan",
    emoji: "🍽️",
    query: "comer mientras juegan",
    helper: "Para comer sin estar levantándote cada dos minutos.",
  },
  {
    label: "Cumpleaños",
    emoji: "🎂",
    query: "cumpleanos",
    helper: "Opciones para celebrar con niños.",
  },
  {
    label: "Ludoteca",
    emoji: "🧸",
    query: "ludoteca",
    helper: "Con monitores, talleres o zona de juego interior.",
  },
  {
    label: "Parque de bolas",
    emoji: "🛝",
    query: "parque de bolas",
    helper: "Diversión directa para los peques.",
  },
  {
    label: "Terraza con niños",
    emoji: "🌿",
    query: "terraza con ninos",
    helper: "Exterior, espacio y menos agobio.",
  },
  {
    label: "Paella / arroz",
    emoji: "🥘",
    query: "paella",
    helper: "Plan familiar mediterráneo.",
  },
  {
    label: "Merienda",
    emoji: "🍰",
    query: "merienda",
    helper: "Café, helados, tartas o plan de tarde.",
  },
] as const;

const EMOTIONAL_TAGS = [
  { tag: "padres tranquilos", label: "Padres tranquilos", emoji: "☕" },
  { tag: "comer mientras juegan", label: "Comer mientras juegan", emoji: "🍽️" },
  { tag: "parque de bolas", label: "Parque de bolas", emoji: "🛝" },
  { tag: "ludoteca", label: "Ludoteca", emoji: "🧸" },
  { tag: "cumpleanos", label: "Cumpleaños", emoji: "🎂" },
  { tag: "cumpleanos infantiles", label: "Cumpleaños", emoji: "🎂" },
  { tag: "merienda", label: "Merienda", emoji: "🍰" },
  { tag: "terraza con ninos", label: "Terraza con niños", emoji: "🌿" },
  { tag: "menu infantil", label: "Menú infantil", emoji: "👶" },
  { tag: "ocio infantil", label: "Ocio infantil", emoji: "🎈" },
] as const;
type FlagKey = (typeof FILTROS)[number]["key"];


const HERO_TITLES = [
  "Comer fuera con peques ya no tiene que ser una aventura",
  "Encuentra sitios donde toda la familia esté cómoda",
  "Menos improvisar. Más disfrutar en familia.",
  "Descubre restaurantes pensados para familias reales",
];

const HERO_SUBS = [
  "Tronas, carritos, terrazas seguras y pequeños detalles que cambian todo.",
  "Filtra rápido y encuentra un sitio cómodo para todos.",
  "Porque comer fuera con niños también puede ser fácil.",
  "La comunidad ayuda a descubrir lugares family-friendly de verdad.",
];
const CHIPS_CARD = [
  { key: "zonaInfantil", label: "Zona infantil" },
  { key: "menuInfantil", label: "Menú infantil" },
  { key: "tronaDisponible", label: "Trona" },
  { key: "cambiadorDisponible", label: "Cambiador" },
  { key: "terrazaSegura", label: "Terraza" },
  { key: "parqueCercano", label: "Parque" },
] as const;


function getFamilyTrust(r: Restaurante): { label: string; cls: string } {
  const score = [
    r.zonaInfantil,
    r.menuInfantil,
    r.tronaDisponible,
    r.cambiadorDisponible,
    r.sitioParaCarrito,
    r.terrazaSegura,
    r.parqueCercano,
    r.actividadesParaNinos,
    r.zonaAmplia,
    r.accesibleConCarrito,
    r.ambienteFamiliar,
  ].filter(Boolean).length;

  if (score >= 7) return { label: "Ideal para familias", cls: "bg-emerald-50 text-emerald-700 border-emerald-100" };
  if (score >= 4) return { label: "Muy familiar", cls: "bg-orange-50 text-orange-700 border-orange-100" };
  if (score >= 1) return { label: "Detalles familiares", cls: "bg-amber-50 text-amber-700 border-amber-100" };

  return { label: "Nuevo para la comunidad", cls: "bg-stone-50 text-stone-500 border-stone-100" };
}
function getBadge(r: Restaurante): { label: string; cls: string } | null {
  const f = r.favoritos ?? 0;
  if (f >= 50) return { label: "Top de la zona", cls: "bg-red-500 text-white" };
  if (f >= 30)
    return { label: "Top familias", cls: "bg-orange-500 text-white" };
  if (f >= 15)
    return { label: "Favorito familias", cls: "bg-amber-400 text-white" };
  if (f >= 5) return { label: "Recomendado", cls: "bg-green-500 text-white" };
  const n = [
    r.zonaInfantil,
    r.menuInfantil,
    r.tronaDisponible,
    r.cambiadorDisponible,
    r.sitioParaCarrito,
    r.terrazaSegura,
    r.actividadesParaNinos,
    r.zonaAmplia,
    r.parqueCercano,
    r.accesibleConCarrito,
    r.ambienteFamiliar,
  ].filter(Boolean).length;
  if (r.zonaInfantil && r.menuInfantil)
    return { label: "Ideal niños", cls: "bg-blue-500 text-white" };
  if (n >= 7)
    return { label: "Perfecto familias", cls: "bg-purple-500 text-white" };
  return null;
}

function distanciaKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function IconHeart({ filled }: { filled: boolean }) {
  return filled ? (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
        clipRule="evenodd"
      />
    </svg>
  ) : (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 20 20"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
      />
    </svg>
  );
}

function IconPin() {
  return (
    <svg
      className="w-3 h-3 inline-block flex-shrink-0"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path
        fillRule="evenodd"
        d="M10 2a6 6 0 00-6 6c0 4.418 6 10 6 10s6-5.582 6-10a6 6 0 00-6-6zm0 8a2 2 0 110-4 2 2 0 010 4z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function IconMap() {
  return (
    <svg
      className="w-4 h-4 flex-shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
      />
    </svg>
  );
}

function IconLocation() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
      />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

function PlaceholderImg() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-stone-50 to-orange-50">
      <svg
        className="w-10 h-10 text-stone-200"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        viewBox="0 0 48 48"
      >
        <rect
          x="4"
          y="12"
          width="40"
          height="28"
          rx="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="24" cy="26" r="7" strokeLinecap="round" />
        <circle cx="37" cy="18" r="3" fill="currentColor" stroke="none" />
      </svg>
      <span className="text-xs text-stone-300 font-medium tracking-wide">
        Sin foto todavía
      </span>
    </div>
  );
}


function getFamilyReasons(r: Restaurante): string[] {
  const reasons = [
    r.zonaInfantil ? "Zona infantil" : null,
    r.menuInfantil ? "Menú infantil" : null,
    r.tronaDisponible ? "Trona disponible" : null,
    r.cambiadorDisponible ? "Cambiador" : null,
    r.sitioParaCarrito ? "Espacio para carrito" : null,
    r.terrazaSegura ? "Terraza segura" : null,
    r.parqueCercano ? "Parque cerca" : null,
    r.actividadesParaNinos ? "Actividades para peques" : null,
    r.zonaAmplia ? "Espacio amplio" : null,
    r.accesibleConCarrito ? "Accesible con carrito" : null,
  ].filter(Boolean) as string[];

  return reasons.slice(0, 3);
}

function getMoodChips(r: Restaurante) {
  const tags = Array.isArray((r as any).tags) ? ((r as any).tags as string[]) : [];
  const normalizedTags = tags.map((tag) =>
    String(tag)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
  );

  const seen = new Set<string>();

  return EMOTIONAL_TAGS.filter((item) => {
    if (seen.has(item.label)) return false;

    const found = normalizedTags.includes(item.tag);
    if (found) seen.add(item.label);

    return found;
  }).slice(0, 2);
}
function RestauranteCard({
  r,
  distancia,
}: {
  r: Restaurante;
  distancia?: number;
}) {
  const [favLocal, setFavLocal] = useState(() => isFavorite(r.id));
  const queryClient = useQueryClient();
  const imagen = r.imagenes?.[0];
  const mapsUrl =
    r.latitud && r.longitud
      ? `https://www.google.com/maps?q=${r.latitud},${r.longitud}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.nombre + " " + r.ciudad)}`;
  const badge = getBadge(r);
  const trust = getFamilyTrust(r);
  const chips = CHIPS_CARD.filter((c) => r[c.key as keyof typeof r] === true);
  const moodChips = getMoodChips(r);
  const reasons = getFamilyReasons(r);

  const mutation = useMutation({
    mutationFn: () => postFavorito(r.id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["restaurantes"] }),
  });

  const handleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const { added } = toggleFavorite(r.id);
    setFavLocal(!favLocal);
    if (added) mutation.mutate();
  };

  return (
    <article className="group bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">
      <div className="relative h-32 sm:h-48 overflow-hidden flex-shrink-0">
        {imagen ? (
          <img
            src={imagen}
            alt={r.nombre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <PlaceholderImg />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
        {badge && (
          <span
            className={`absolute top-3 right-3 text-[10px] font-bold tracking-wide px-2.5 py-1 rounded-full shadow-sm ${badge.cls}`}
          >
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
          aria-label={
            favLocal ? "Quitar de favoritos" : "Guardar como favorito"
          }
          className={`absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all duration-200 border active:scale-90 ${
            favLocal
              ? "bg-red-500 text-white border-red-500 scale-110"
              : "bg-white/90 text-stone-400 border-white hover:text-red-400"
          }`}
        >
          <IconHeart filled={favLocal} />
        </button>
        {(r.favoritos ?? 0) > 0 && (
          <div className="absolute bottom-2 right-3 flex items-center gap-1 bg-black/50 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
            <IconHeart filled={true} />
            <span>{r.favoritos}</span>
          </div>
        )}
        {distancia !== undefined && (
          <div className="absolute bottom-2 left-3 bg-black/50 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
            {distancia < 1
              ? `${Math.round(distancia * 1000)}m`
              : `${distancia.toFixed(1)}km`}
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <div className="mb-2">
          <h2 className="font-bold text-slate-800 text-[13px] sm:text-[15px] leading-snug line-clamp-1">
            {r.nombre}
          </h2>
          <p className="text-[10px] sm:text-xs text-stone-400 mt-0.5 flex items-center gap-1">
            <IconPin /> {r.localidad}, {r.ciudad}
          </p>
        </div>
        <p className="text-[11px] sm:text-sm text-slate-500 line-clamp-2 mb-2 sm:mb-3 leading-relaxed">
          {r.descripcion}
        </p>
        <div className={`inline-flex w-fit items-center gap-1.5 text-[10px] sm:text-[11px] font-bold border px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full mb-2 sm:mb-3 ${trust.cls}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
          {trust.label}
        </div>

        {reasons.length > 0 && (
          <div className="hidden sm:block mb-3 rounded-xl bg-orange-50/70 border border-orange-100 px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-wide text-orange-500 mb-1">
              Por qué encaja
            </p>
            <div className="flex flex-wrap gap-1.5">
              {reasons.map((reason) => (
                <span key={reason} className="text-[11px] font-semibold text-slate-600">
                  <span className="text-orange-500 font-black">✓</span> {reason}
                </span>
              ))}
            </div>
          </div>
        )}
        {chips.length > 0 && (
          <div className="hidden sm:flex flex-wrap gap-1.5 mb-4">
            {chips.map((c) => (
              <span
                key={c.key}
                className="text-[11px] bg-orange-50 text-orange-600 border border-orange-100 px-2 py-0.5 rounded-full font-medium"
              >
                {c.label}
              </span>
            ))}
          </div>
        )}

        {moodChips.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {moodChips.map((chip) => (
              <span
                key={`${chip.tag}-${chip.label}`}
                className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full font-bold"
              >
                {chip.emoji} {chip.label}
              </span>
            ))}
          </div>
        )}
        <div className="mt-auto flex gap-2">
          <Link
            to={`/restaurante/${r.id}`}
            className="flex-1 text-center bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm font-semibold py-2 sm:py-2.5 rounded-xl transition-colors"
          >
            Ver detalles
          </Link>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Cómo llegar"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 sm:py-2.5 border border-stone-200 rounded-xl text-stone-500 hover:text-orange-600 hover:border-orange-200 hover:bg-orange-50 transition-all text-xs font-medium"
          >
            <IconMap />
            <span className="hidden sm:inline">Ir</span>
          </a>
        </div>
      </div>
    </article>
  );
}


function MoodFiltersSection({
  search,
  searchInput,
  onApply,
  onClear,
}: {
  search: string;
  searchInput: string;
  onApply: (query: string) => void;
  onClear: () => void;
}) {
  const hasSearch = Boolean(search || searchInput);

  return (
    <section className="mb-8">
      <div className="flex items-end justify-between gap-3 mb-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-500 mb-1">
            Planes familiares
          </p>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-800">
            ¿Qué necesitas hoy?
          </h2>
        </div>

        {hasSearch && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-stone-400 hover:text-red-500 font-medium transition-colors"
          >
            Quitar búsqueda
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {MOOD_FILTERS.map((item) => {
          const isActive = search === item.query || searchInput === item.query;

          return (
            <button
              key={item.query}
              type="button"
              onClick={() => onApply(item.query)}
              title={item.helper}
              className={`text-left rounded-2xl border px-3 py-3 transition-all ${
                isActive
                  ? "bg-orange-500 text-white border-orange-500 shadow-md scale-[1.01]"
                  : "bg-white text-slate-700 border-stone-100 hover:border-orange-200 hover:bg-orange-50"
              }`}
            >
              <span className="block text-xl mb-1">{item.emoji}</span>

              <span className="block text-xs font-extrabold leading-tight">
                {item.label}
              </span>

              <span
                className={`hidden sm:block text-[10px] mt-1 leading-snug ${
                  isActive ? "text-white/80" : "text-stone-400"
                }`}
              >
                {item.helper}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}


function CompactFamilySearchControls({
  search,
  searchInput,
  activeFlags,
  hasFilters,
  onApply,
  onToggleFlag,
  onClearSearch,
  onClearAll,
}: {
  search: string;
  searchInput: string;
  activeFlags: Partial<Record<FlagKey, boolean>>;
  hasFilters: boolean;
  onApply: (query: string) => void;
  onToggleFlag: (key: FlagKey) => void;
  onClearSearch: () => void;
  onClearAll: () => void;
}) {
  const [openPanel, setOpenPanel] = useState<"plans" | "filters" | null>(null);

  const quickPlans = MOOD_FILTERS.filter((item) =>
    ["padres tranquilos", "comer mientras juegan", "cumpleanos", "parque de bolas"].includes(item.query)
  );

  const extraPlans = MOOD_FILTERS.filter(
    (item) => !quickPlans.some((quick) => quick.query === item.query)
  );

  const hasSearch = Boolean(search || searchInput);

  const togglePanel = (panel: "plans" | "filters") => {
    setOpenPanel((current) => (current === panel ? null : panel));
  };

  return (
    <section className="mb-8 space-y-3">
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {quickPlans.map((item) => {
          const isActive = search === item.query || searchInput === item.query;

          return (
            <button
              key={item.query}
              type="button"
              onClick={() => onApply(item.query)}
              title={item.helper}
              className={
                "flex-shrink-0 inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-bold transition-all " +
                (isActive
                  ? "bg-orange-500 text-white border-orange-500 shadow-md"
                  : "bg-white text-slate-700 border-stone-200 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700")
              }
            >
              <span className="text-base">{item.emoji}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => togglePanel("plans")}
          className={
            "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-extrabold transition-all " +
            (openPanel === "plans"
              ? "bg-orange-500 text-white border-orange-500 shadow-md"
              : "bg-white text-orange-700 border-orange-100 hover:border-orange-300 hover:bg-orange-50")
          }
        >
          <span>🧡</span>
          <span>{openPanel === "plans" ? "Cerrar planes" : "Más planes"}</span>
        </button>

        <button
          type="button"
          onClick={() => togglePanel("filters")}
          className={
            "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-extrabold transition-all " +
            (openPanel === "filters"
              ? "bg-slate-800 text-white border-slate-800 shadow-md"
              : "bg-white text-slate-600 border-stone-200 hover:border-slate-300 hover:bg-slate-50")
          }
        >
          <span>⚙️</span>
          <span>{openPanel === "filters" ? "Cerrar filtros" : "Filtros"}</span>
        </button>

        {(hasSearch || hasFilters) && (
          <button
            type="button"
            onClick={onClearAll}
            className="inline-flex items-center rounded-full border border-red-100 bg-red-50 px-3.5 py-2 text-xs font-bold text-red-500 hover:bg-red-100 transition-all"
          >
            Limpiar todo
          </button>
        )}
      </div>

      {hasSearch && (
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-orange-50 border border-orange-100 px-3 py-2">
          <p className="text-xs text-orange-700">
            Buscando: <span className="font-bold">{search || searchInput}</span>
          </p>

          <button
            type="button"
            onClick={onClearSearch}
            className="text-xs font-bold text-orange-600 hover:text-red-500"
          >
            Quitar búsqueda
          </button>
        </div>
      )}

      {openPanel === "plans" && (
        <div className="rounded-3xl border border-orange-100 bg-white shadow-sm p-4 sm:p-5">
          <div className="mb-3">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-500">
              Planes familiares
            </p>
            <h3 className="text-sm font-extrabold text-slate-800">
              Elige una situación real
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {extraPlans.map((item) => {
              const isActive = search === item.query || searchInput === item.query;

              return (
                <button
                  key={item.query}
                  type="button"
                  onClick={() => onApply(item.query)}
                  title={item.helper}
                  className={
                    "text-left rounded-2xl border px-3 py-3 transition-all " +
                    (isActive
                      ? "bg-orange-500 text-white border-orange-500 shadow-md scale-[1.01]"
                      : "bg-stone-50/70 text-slate-700 border-stone-100 hover:border-orange-200 hover:bg-orange-50")
                  }
                >
                  <span className="block text-xl mb-1">{item.emoji}</span>
                  <span className="block text-xs font-extrabold leading-tight">
                    {item.label}
                  </span>
                  <span className={"hidden sm:block text-[10px] mt-1 leading-snug " + (isActive ? "text-white/80" : "text-stone-400")}>
                    {item.helper}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {openPanel === "filters" && (
        <div className="rounded-3xl border border-stone-100 bg-white shadow-sm p-4 sm:p-5">
          <div className="mb-3">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
              Filtros prácticos
            </p>
            <h3 className="text-sm font-extrabold text-slate-800">
              Afina si necesitas algo concreto
            </h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {FILTROS.map(({ key, label }) => {
              const isOn = !!activeFlags[key];

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onToggleFlag(key)}
                  className={
                    "text-xs font-medium px-3 py-1.5 rounded-full border transition-all " +
                    (isOn
                      ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                      : "bg-white text-slate-600 border-stone-200 hover:border-orange-300 hover:text-orange-600")
                  }
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

function TopCommunitySection({ restaurantes }: { restaurantes: Restaurante[] }) {
  const top = [...restaurantes]
    .sort((a, b) => (b.favoritos ?? 0) - (a.favoritos ?? 0))
    .slice(0, 3);

  if (top.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-500 mb-1">
            Comunidad DCH
          </p>

          <h2 className="text-2xl font-extrabold text-slate-800">
            ❤️ Las familias están guardando...
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {top.map((r, index) => (
          <Link
            key={r.id}
            to={`/restaurante/${r.id}`}
            className="group relative overflow-hidden rounded-3xl border border-stone-100 bg-white shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="relative h-44 overflow-hidden">
              {r.imagenes?.[0] ? (
                <img
                  src={r.imagenes[0]}
                  alt={r.nombre}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <PlaceholderImg />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-black w-8 h-8 rounded-full flex items-center justify-center shadow">
                #{index + 1}
              </div>

              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="text-white font-extrabold text-lg leading-tight mb-1">
                  {r.nombre}
                </h3>

                <p className="text-white/80 text-xs">
                  {r.localidad}, {r.ciudad}
                </p>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-orange-500 bg-orange-50 border border-orange-100 px-2.5 py-1 rounded-full">
                  ❤️ {r.favoritos ?? 0} guardados
                </span>

                <span className="text-xs text-stone-400 font-medium">
                  Trending
                </span>
              </div>

              <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                {r.descripcion}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function FavoriteToast() {
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (event: Event) => {
      const custom = event as CustomEvent<{ added: boolean }>;
      setMessage(custom.detail?.added ? "Guardado en favoritos" : "Quitado de favoritos");
      setVisible(true);

      window.setTimeout(() => {
        setVisible(false);
      }, 1700);
    };

    window.addEventListener("dch:fav-toast", handler);
    return () => window.removeEventListener("dch:fav-toast", handler);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-[9999] -translate-x-1/2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-xl">
      ❤️ {message}
    </div>
  );
}
function Hero({ total }: { total: number }) {
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setHeroIndex((current) => (current + 1) % HERO_TITLES.length);
    }, 11000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-50 via-amber-50 to-stone-50 border border-orange-100 px-5 py-8 sm:px-8 sm:py-16 mb-8 sm:mb-10">
      <div className="blob absolute -top-16 -right-16 w-64 h-64 bg-orange-200/25 rounded-full blur-3xl pointer-events-none" />
      <div className="blob blob-delay-2 absolute -bottom-12 -left-12 w-56 h-56 bg-amber-200/25 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-2xl">
        {total > 0 && (
          <span className="inline-block text-xs font-bold text-orange-600 bg-orange-100 px-3 py-1 rounded-full mb-4">
            {total} sitio{total !== 1 ? "s" : ""} familiar{total !== 1 ? "es" : ""} revisado{total !== 1 ? "s" : ""}
          </span>
        )}

        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-800 leading-tight mb-3 sm:mb-4">
          {HERO_TITLES[heroIndex]}
        </h1>

        <p className="text-slate-500 text-sm sm:text-lg leading-relaxed mb-4 max-w-2xl">
          {HERO_SUBS[heroIndex]}
        </p>

        <div className="flex flex-wrap gap-2 mt-5">
          <span className="bg-white/90 border border-orange-100 text-orange-600 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
            👶 Family Friendly
          </span>
          <span className="bg-white/90 border border-orange-100 text-orange-600 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
            🛝 Zonas infantiles
          </span>
          <span className="bg-white/90 border border-orange-100 text-orange-600 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
            ❤️ Recomendado por familias
          </span>
        </div>
      </div>

      <div className="absolute right-4 sm:right-10 top-1/2 -translate-y-1/2 hidden sm:flex flex-col gap-2.5 z-10">
        {[
          { t: "Tronas sin preguntar", cls: "float-card" },
          { t: "Carrito sin agobios", cls: "float-card-b" },
          { t: "Peques entretenidos", cls: "float-card-c" },
          { t: "Padres más tranquilos", cls: "float-card-d" },
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


function getSearchContext(query: string, nearMe: boolean) {
  const q = String(query || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

  if (nearMe) {
    return {
      emoji: "📍",
      title: "Sitios cerca de ti",
      text: "Ordenamos los restaurantes por distancia para que encuentres algo cómodo sin dar mil vueltas.",
    };
  }

  if (!q) return null;

  if (q.includes("padres tranquilos")) {
    return {
      emoji: "☕",
      title: "Sitios para comer con más calma",
      text: "Lugares donde los peques pueden entretenerse y los adultos respirar un poco.",
    };
  }

  if (q.includes("comer mientras juegan")) {
    return {
      emoji: "🍽️",
      title: "Comer mientras los peques juegan",
      text: "Opciones pensadas para que comer fuera no sea levantarse cada dos minutos.",
    };
  }

  if (q.includes("cumple")) {
    return {
      emoji: "🎂",
      title: "Ideas para cumpleaños infantiles",
      text: "Sitios que pueden encajar para celebrar con niños sin complicarse demasiado.",
    };
  }

  if (q.includes("parque de bolas") || q.includes("ludoteca")) {
    return {
      emoji: "🛝",
      title: "Planes con juego asegurado",
      text: "Restaurantes y espacios donde los niños tienen zona para jugar o entretenerse.",
    };
  }

  if (q.includes("terraza")) {
    return {
      emoji: "🌿",
      title: "Terrazas para ir con niños",
      text: "Sitios con exterior o ambiente más cómodo para familias con peques.",
    };
  }

  if (q.includes("paella") || q.includes("arroz")) {
    return {
      emoji: "🥘",
      title: "Plan familiar de arroz o paella",
      text: "Opciones mediterráneas para comer en familia sin improvisar.",
    };
  }

  if (q.includes("merienda")) {
    return {
      emoji: "🍰",
      title: "Planes de merienda",
      text: "Cafés, meriendas o planes de tarde para ir con peques.",
    };
  }

  return {
    emoji: "🔎",
    title: "Resultados para tu búsqueda",
    text: "Hemos buscado coincidencias por nombre, descripción, ciudad y etiquetas familiares.",
  };
}


function NearMeContextBanner({
  nearMe,
  userPos,
}: {
  nearMe: boolean;
  userPos: { lat: number; lon: number } | null;
}) {
  if (!nearMe || !userPos) return null;

  return (
    <section className="mb-5 rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-sky-50 to-white px-4 py-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-white border border-blue-100 text-xl shadow-sm">
          📍
        </div>

        <div>
          <h2 className="text-sm sm:text-base font-extrabold text-slate-800">
            Sitios cerca de ti
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mt-1">
            Ordenamos los restaurantes por distancia para que encuentres algo cómodo sin dar mil vueltas.
          </p>
        </div>
      </div>
    </section>
  );
}

export default function PublicListPage() {
  const [search, setSearch] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [page, setPage] = useState(1);
  const [activeFlags, setActiveFlags] = useState<
    Partial<Record<FlagKey, boolean>>
  >({});
  const [searchInput, setSearchInput] = useState("");
  const [nearMe, setNearMe] = useState(false);
  const [userPos, setUserPos] = useState<{ lat: number; lon: number } | null>(
    null,
  );
  const [geoError, setGeoError] = useState<string | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);

  const filtros: FiltrosRestaurante = {
    q: search || searchInput || undefined,
    ciudad: ciudad || undefined,
    page,
    pageSize: nearMe ? 100 : 12,
    sortBy: "favoritos_desc",
    ...activeFlags,
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["restaurantes", filtros],
    queryFn: () => getRestaurantes(filtros),
    placeholderData: keepPreviousData,
  });

  const toggleFlag = useCallback((key: FlagKey) => {
    setActiveFlags((prev) => {
      const n = { ...prev };
      if (n[key]) delete n[key];
      else n[key] = true;
      return n;
    });
    setPage(1);
  }, []);

  const applyMoodFilter = useCallback((query: string) => {
    setSearch(query);
    setSearchInput(query);
    setActiveFlags({});
    setPage(1);
    setNearMe(false);
  }, []);

  const clearAll = () => {
    setActiveFlags({});
    setSearch("");
    setSearchInput("");
    setCiudad("");
    setPage(1);
    setNearMe(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const handleNearMe = () => {
    if (nearMe) {
      setNearMe(false);
      setUserPos(null);
      return;
    }
    setGeoLoading(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setNearMe(true);
        setGeoLoading(false);
      },
      () => {
        setGeoError(
          "No pudimos obtener tu ubicación. Comprueba los permisos del navegador.",
        );
        setGeoLoading(false);
      },
    );
  };

  let restaurantes = data?.data ?? [];
  const meta = data?.meta;
  const hasFilters = Boolean(Object.keys(activeFlags).length > 0 || search || searchInput || ciudad || nearMe);
  const searchContext = getSearchContext(search || searchInput, nearMe);

  // Ordenar por distancia si nearMe activo
  if (nearMe && userPos) {
    restaurantes = [...restaurantes]
      .filter((r) => r.latitud && r.longitud)
      .sort((a, b) => {
        const da = distanciaKm(
          userPos.lat,
          userPos.lon,
          a.latitud!,
          a.longitud!,
        );
        const db = distanciaKm(
          userPos.lat,
          userPos.lon,
          b.latitud!,
          b.longitud!,
        );
        return da - db;
      })
      .slice(0, 12);
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <Hero total={meta?.total ?? 0} />
      <FavoriteToast />

      {!hasFilters && <TopCommunitySection restaurantes={restaurantes} />}

      {/* Buscador */}
      <div className="mb-5 space-y-3">
        <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => {
              const value = e.target.value;
              setSearchInput(value);
              setSearch(value);
            }}
            placeholder="¿Qué plan familiar buscas hoy?"
            className="flex-1 bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 placeholder:text-stone-400"
          />

          <div className="flex gap-2">
            <input
              type="text"
              value={ciudad}
              onChange={(e) => {
                setCiudad(e.target.value);
                setPage(1);
              }}
              placeholder="Ciudad"
              className="min-w-0 flex-1 lg:w-36 lg:flex-none bg-white border border-stone-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 placeholder:text-stone-400"
            />

            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-3 rounded-xl text-sm transition-colors whitespace-nowrap"
            >
              Buscar
            </button>
          </div>

          <button
            type="button"
            onClick={handleNearMe}
            disabled={geoLoading}
            className={`flex items-center justify-center gap-2 text-sm font-semibold px-4 py-3 rounded-xl border transition-all lg:w-auto ${
              nearMe
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white text-slate-600 border-stone-200 hover:border-blue-300 hover:text-blue-600"
            }`}
          >
            <IconLocation />
            {geoLoading
              ? "Buscando..."
              : nearMe
                ? "Cerca de mí"
                : "Cerca de mí"}
          </button>
        </form>

        {(geoError || (nearMe && userPos)) && (
          <div className="min-h-5">
            {geoError && <p className="text-xs text-red-500">{geoError}</p>}
            {nearMe && userPos && (
              <p className="text-xs text-stone-400">
                Mostrando los restaurantes más cercanos a tu ubicación
              </p>
            )}
          </div>
        )}
      </div>

      <CompactFamilySearchControls
        search={search}
        searchInput={searchInput}
        activeFlags={activeFlags}
        hasFilters={hasFilters}
        onApply={applyMoodFilter}
        onToggleFlag={toggleFlag}
        onClearSearch={() => {
          setSearch("");
          setSearchInput("");
          setPage(1);
        }}
        onClearAll={clearAll}
      />

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm"
            >
              <div className="h-48 bg-gradient-to-r from-stone-100 via-orange-50 to-stone-100 animate-pulse" />
              <div className="p-4 space-y-2.5">
                <div className="h-4 bg-gradient-to-r from-stone-100 via-orange-50 to-stone-100 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-gradient-to-r from-stone-100 via-orange-50 to-stone-100 rounded animate-pulse w-1/2" />
                <div className="h-9 bg-gradient-to-r from-stone-100 via-orange-50 to-stone-100 rounded-xl animate-pulse mt-4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-100">
          <svg
            className="w-12 h-12 text-stone-200 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-slate-600 font-medium">
            No podemos conectar con el servidor
          </p>
          <p className="text-sm text-stone-400 mt-1">
            Comprueba que el backend está activo en el puerto 3000
          </p>
        </div>
      )}

      {!isLoading && !isError && restaurantes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 px-6 bg-white rounded-3xl border border-stone-100">
          <svg
            className="w-20 h-20 mb-5 text-stone-100"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            viewBox="0 0 80 80"
          >
            <rect
              x="16"
              y="28"
              width="48"
              height="26"
              rx="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M24 28v-4a4 4 0 014-4h24a4 4 0 014 4v4"
            />
            <line x1="28" y1="42" x2="52" y2="42" strokeLinecap="round" />
          </svg>
          <h3 className="text-lg font-bold text-slate-700 mb-2 text-center">
            Parece que todavía no conocemos un sitio así
          </h3>
          <p className="text-stone-400 text-sm text-center max-w-xs leading-relaxed mb-6">
            Prueba quitando algún filtro o buscando en otra zona. Si conoces un sitio familiar, puedes ayudarnos a añadirlo.
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={clearAll}
              className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors"
            >
              Limpiar filtros
            </button>
            <Link
              to="/sugerir"
              className="border border-stone-200 bg-white hover:border-orange-200 text-slate-600 text-sm font-medium px-5 py-2 rounded-xl transition-colors"
            >
              Sugerir un restaurante
            </Link>
          </div>
        </div>
      )}


      {!nearMe && searchContext && (
        <section className="mb-5 rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50 via-amber-50 to-white px-4 py-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-white border border-orange-100 text-xl shadow-sm">
              {searchContext.emoji}
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-800">
                {searchContext.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mt-1">
                {searchContext.text}
              </p>
            </div>
          </div>
        </section>
      )}

      {!isLoading && !isError && restaurantes.length > 0 && (
        <>
          <NearMeContextBanner nearMe={nearMe} userPos={userPos} />
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-stone-400">
              {nearMe
                ? `${restaurantes.length} más cercanos`
                : `${meta?.total ?? 0} sitio${(meta?.total ?? 0) !== 1 ? "s" : ""}${hasFilters ? " con estos filtros" : ""}`}
            </p>
            <p className="text-xs text-stone-400">
              {nearMe ? "Por distancia" : "Por popularidad"}
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {restaurantes.map((r) => (
              <RestauranteCard
                key={r.id}
                r={r}
                distancia={
                  nearMe && userPos && r.latitud && r.longitud
                    ? distanciaKm(
                        userPos.lat,
                        userPos.lon,
                        r.latitud,
                        r.longitud,
                      )
                    : undefined
                }
              />
            ))}
          </div>
          {!nearMe && meta && meta.totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-12">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-4 py-2 rounded-xl border border-stone-200 bg-white text-sm font-medium disabled:opacity-40 hover:border-orange-300 hover:text-orange-600 transition-colors"
              >
                Anterior
              </button>
              <span className="text-sm text-stone-400">
                {page} de {meta.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page >= meta.totalPages}
                className="px-4 py-2 rounded-xl border border-stone-200 bg-white text-sm font-medium disabled:opacity-40 hover:border-orange-300 hover:text-orange-600 transition-colors"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}

      <section className="mt-16 bg-white border border-stone-100 rounded-3xl p-8 sm:p-10 text-center shadow-sm">
        <div className="max-w-lg mx-auto">
          <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg
              className="w-6 h-6 text-orange-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
          </div>
          <h2 className="font-extrabold text-slate-800 text-xl sm:text-2xl mb-3 leading-tight">
            ¿Conoces un restaurante que otras familias deberían descubrir?
          </h2>
          <p className="text-stone-500 text-sm sm:text-base leading-relaxed mb-6">
            Si has estado en un sitio cómodo para ir con niños, compártelo con nosotros. Lo revisaremos y, si encaja, ayudará a más familias a disfrutar sin complicarse.
          </p>
          <Link
            to="/sugerir"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-xl transition-colors text-sm sm:text-base"
          >
            Sugerir restaurante
          </Link>
        </div>
      </section>
    </main>
  );
}

















