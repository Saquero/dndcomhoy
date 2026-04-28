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
