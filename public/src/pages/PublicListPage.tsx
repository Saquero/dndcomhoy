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
  { key: "menuInfantil", label: "Menu infantil" },
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

type FlagKey = (typeof FILTROS)[number]["key"];

const CHIPS_CARD = [
  { key: "zonaInfantil", label: "Zona infantil" },
  { key: "menuInfantil", label: "Menu infantil" },
  { key: "tronaDisponible", label: "Trona" },
  { key: "cambiadorDisponible", label: "Cambiador" },
  { key: "terrazaSegura", label: "Terraza" },
  { key: "parqueCercano", label: "Parque" },
] as const;

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
    return { label: "Ideal ninos", cls: "bg-blue-500 text-white" };
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
        Sin foto todavia
      </span>
    </div>
  );
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
  const chips = CHIPS_CARD.filter((c) => r[c.key as keyof typeof r] === true);

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
    <article className="group bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col">
      <div className="relative h-48 overflow-hidden flex-shrink-0">
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
          className={`absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all border ${
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

      <div className="p-4 flex flex-col flex-1">
        <div className="mb-2">
          <h2 className="font-bold text-slate-800 text-[15px] leading-snug line-clamp-1">
            {r.nombre}
          </h2>
          <p className="text-xs text-stone-400 mt-0.5 flex items-center gap-1">
            <IconPin /> {r.localidad}, {r.ciudad}
          </p>
        </div>
        <p className="text-sm text-slate-500 line-clamp-2 mb-3 leading-relaxed">
          {r.descripcion}
        </p>
        {chips.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
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
        <div className="mt-auto flex gap-2">
          <Link
            to={`/restaurante/${r.id}`}
            className="flex-1 text-center bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
          >
            Ver detalles
          </Link>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Como llegar"
            className="flex items-center gap-1.5 px-3 py-2.5 border border-stone-200 rounded-xl text-stone-500 hover:text-orange-600 hover:border-orange-200 hover:bg-orange-50 transition-all text-xs font-medium"
          >
            <IconMap />
            <span>Ir</span>
          </a>
        </div>
      </div>
    </article>
  );
}

const HERO_PHRASES = [
  "Hoy toca comer fuera sin improvisar.",
  "Menos estrés, más sobremesa.",
  "Sitios pensados para peques... y para padres.",
  "Comer fuera también puede ser fácil.",
];

function Hero({ total }: { total: number }) {
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPhraseIndex((current) => (current + 1) % HERO_PHRASES.length);
    }, 3200);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-50 via-amber-50 to-stone-50 border border-orange-100 px-6 py-12 sm:px-8 sm:py-16 mb-10">
      <div className="blob absolute -top-16 -right-16 w-64 h-64 bg-orange-200/25 rounded-full blur-3xl pointer-events-none" />
      <div className="blob blob-delay-2 absolute -bottom-12 -left-12 w-56 h-56 bg-amber-200/25 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-2xl">
        {total > 0 && (
          <span className="inline-block text-xs font-bold text-orange-600 bg-orange-100 px-3 py-1 rounded-full mb-4">
            {total} restaurante{total !== 1 ? "s" : ""} verificado
            {total !== 1 ? "s" : ""}
          </span>
        )}

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-800 leading-tight mb-4">
          Salir a comer con niños ya no tiene que ser un caos
        </h1>

        <p className="text-slate-500 text-base sm:text-lg leading-relaxed mb-4 max-w-2xl">
          Encuentra restaurantes con tronas, espacio para carritos, zonas
          amplias y pequeños detalles que hacen que toda la familia disfrute.
        </p>

        <div className="inline-flex items-center gap-2 rounded-full bg-white/80 border border-orange-100 px-4 py-2 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
          <p className="text-sm font-semibold text-slate-600">
            {HERO_PHRASES[phraseIndex]}
          </p>
        </div>
      </div>

      <div className="absolute right-4 sm:right-10 top-1/2 -translate-y-1/2 hidden sm:flex flex-col gap-2.5 z-10">
        {[
          { t: "Tronas sin preguntar", cls: "float-card" },
          { t: "Carrito sin agobios", cls: "float-card-b" },
          { t: "Peques entretenidos", cls: "float-card-c" },
          { t: "Padres más tranquilos", cls: "float-card-d" },
        ].map((item) => (
          <div
            key={item.t}
            className={`${item.cls} bg-white/90 backdrop-blur-sm border border-stone-100 shadow-md rounded-xl px-3 py-2 flex items-center gap-2 text-xs font-semibold text-slate-700`}
          >
            <span className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
            {item.t}
          </div>
        ))}
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
          "No pudimos obtener tu ubicacion. Comprueba los permisos del navegador.",
        );
        setGeoLoading(false);
      },
    );
  };

  let restaurantes = data?.data ?? [];
  const meta = data?.meta;
  const hasFilters =
    Object.keys(activeFlags).length > 0 || search || ciudad || nearMe;

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

      {/* Buscador */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Nombre, zona, descripcion..."
          className="flex-1 bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 placeholder:text-stone-400"
        />
        <input
          type="text"
          value={ciudad}
          onChange={(e) => {
            setCiudad(e.target.value);
            setPage(1);
          }}
          placeholder="Ciudad"
          className="w-28 sm:w-36 bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 placeholder:text-stone-400"
        />
        <button
          type="submit"
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors whitespace-nowrap"
        >
          Buscar
        </button>
      </form>

      {/* Cerca de mi */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={handleNearMe}
          disabled={geoLoading}
          className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl border transition-all ${
            nearMe
              ? "bg-blue-500 text-white border-blue-500"
              : "bg-white text-slate-600 border-stone-200 hover:border-blue-300 hover:text-blue-600"
          }`}
        >
          <IconLocation />
          {geoLoading
            ? "Buscando..."
            : nearMe
              ? "Cerca de mi (activo)"
              : "Cerca de mi"}
        </button>
        {geoError && <p className="text-xs text-red-500">{geoError}</p>}
        {nearMe && userPos && (
          <p className="text-xs text-stone-400">
            Mostrando los mas cercanos a tu ubicacion
          </p>
        )}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-8">
        {FILTROS.map(({ key, label }) => {
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
            onClick={clearAll}
            className="text-xs text-stone-400 hover:text-red-500 px-2 py-1.5 transition-colors"
          >
            Limpiar todo
          </button>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-stone-100 overflow-hidden"
            >
              <div className="h-48 bg-stone-100 animate-pulse" />
              <div className="p-4 space-y-2.5">
                <div className="h-4 bg-stone-100 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-stone-100 rounded animate-pulse w-1/2" />
                <div className="h-9 bg-stone-100 rounded-xl animate-pulse mt-4" />
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
            Comprueba que el backend esta activo en el puerto 3000
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
            No hemos encontrado ningun sitio con esos filtros
          </h3>
          <p className="text-stone-400 text-sm text-center max-w-xs leading-relaxed mb-6">
            Prueba quitando alguno o buscando en otra zona. A veces el plan
            perfecto esta a un clic menos.
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

      {!isLoading && !isError && restaurantes.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-stone-400">
              {nearMe
                ? `${restaurantes.length} mas cercanos`
                : `${meta?.total ?? 0} restaurante${(meta?.total ?? 0) !== 1 ? "s" : ""}${hasFilters ? " con estos filtros" : ""}`}
            </p>
            <p className="text-xs text-stone-400">
              {nearMe ? "Por distancia" : "Por popularidad"}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
            Conoces un restaurante que otras familias deberian descubrir?
          </h2>
          <p className="text-stone-500 text-sm sm:text-base leading-relaxed mb-6">
            Si has estado en un sitio comodo para ir con ninos, compartelo con
            nosotros. Lo revisaremos y, si encaja, ayudara a mas familias a
            disfrutar sin complicarse.
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

