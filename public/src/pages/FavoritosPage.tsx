import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFavorites, toggleFavorite } from "../utils/favorites";
import { getRestauranteById, postFavorito } from "../services/restauranteService";
import type { Restaurante } from "../types";

function IconHeart({ filled }: { filled: boolean }) {
  return filled ? (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 20 20">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
    </svg>
  );
}

function IconPin() {
  return (
    <svg className="w-3 h-3 inline-block flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 2a6 6 0 00-6 6c0 4.418 6 10 6 10s6-5.582 6-10a6 6 0 00-6-6zm0 8a2 2 0 110-4 2 2 0 010 4z" clipRule="evenodd"/>
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

function FavCard({ r, onRemove }: { r: Restaurante; onRemove: (id: number) => void }) {
  const imagen = r.imagenes?.[0];
  const mapsUrl = r.latitud && r.longitud
    ? `https://www.google.com/maps?q=${r.latitud},${r.longitud}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.nombre + " " + r.ciudad)}`;

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleFavorite(r.id);
    onRemove(r.id);
  };

  return (
    <article className="group bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col">
      <div className="relative h-40 overflow-hidden flex-shrink-0">
        {imagen ? (
          <img src={imagen} alt={r.nombre} className="w-full h-full object-cover"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-stone-50 to-orange-50">
            <svg className="w-8 h-8 text-stone-200" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 48 48">
              <rect x="4" y="12" width="40" height="28" rx="4" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="24" cy="26" r="7" strokeLinecap="round"/>
            </svg>
            <span className="text-xs text-stone-300">Sin foto</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
        <button onClick={handleRemove}
          className="absolute top-2 left-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
          title="Quitar de favoritos">
          <IconHeart filled={true} />
        </button>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h2 className="font-bold text-slate-800 text-[15px] leading-snug line-clamp-1 mb-0.5">{r.nombre}</h2>
        <p className="text-xs text-stone-400 flex items-center gap-1 mb-3"><IconPin /> {r.localidad}, {r.ciudad}</p>
        <p className="text-sm text-slate-500 line-clamp-2 mb-4 leading-relaxed">{r.descripcion}</p>
        <div className="mt-auto flex gap-2">
          <Link to={`/restaurante/${r.id}`}
            className="flex-1 text-center bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">
            Ver detalles
          </Link>
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2.5 border border-stone-200 rounded-xl text-stone-500 hover:text-orange-600 hover:border-orange-200 hover:bg-orange-50 transition-all text-xs font-medium">
            <IconMap /><span>Ir</span>
          </a>
        </div>
      </div>
    </article>
  );
}

export default function FavoritosPage() {
  const [ids, setIds] = useState<number[]>(() => getFavorites());

  const queries = useQueries({
    queries: ids.map(id => ({
      queryKey: ["restaurante", id],
      queryFn: () => getRestauranteById(id),
      staleTime: 60_000,
      retry: false,
    })),
  });

  const handleRemove = (id: number) => setIds(prev => prev.filter(i => i !== id));

  const restaurantes = queries.filter(q => q.data).map(q => q.data as Restaurante);
  const isLoading = queries.some(q => q.isLoading) && restaurantes.length === 0;

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-2">Mis favoritos</h1>
        <p className="text-stone-500 text-sm">
          {ids.length === 0 ? "Aun no has guardado ningun restaurante."
            : `Tienes ${ids.length} restaurante${ids.length !== 1 ? "s" : ""} guardado${ids.length !== 1 ? "s" : ""}.`}
        </p>
      </div>

      {ids.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-stone-100">
          <svg className="w-16 h-16 text-stone-200 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
          <p className="text-slate-600 font-semibold mb-2">Aun no has guardado nada</p>
          <p className="text-stone-400 text-sm mb-6 max-w-xs mx-auto leading-relaxed">
            Cuando encuentres un sitio que te guste, pulsa el corazon para guardarlo aqui.
          </p>
          <Link to="/" className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm">
            Explorar restaurantes
          </Link>
        </div>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: ids.length }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
              <div className="h-40 bg-stone-100 animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-stone-100 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-stone-100 rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && restaurantes.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
            {restaurantes.map(r => <FavCard key={r.id} r={r} onRemove={handleRemove} />)}
          </div>
          <div className="text-center">
            <Link to="/" className="inline-block border border-stone-200 hover:border-orange-300 text-slate-600 hover:text-orange-600 font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm bg-white">
              Seguir explorando
            </Link>
          </div>
        </>
      )}
    </main>
  );
}