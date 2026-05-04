// dashboard/src/pages/RestaurantesPage.tsx
import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getRestaurantes, deleteRestaurante,
  type Restaurante, type RestaurantesResponse,
} from "../services/restauranteService";
import FiltersBar, { type Filters, type FamilyFlags } from "../components/FiltersBar";
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
  const p: Record<string, unknown> = { page, pageSize: PAGE_SIZE, sortBy: filters.sortBy };
  if (filters.q)              p.q              = filters.q;
  if (filters.ciudad)         p.ciudad         = filters.ciudad;
  if (filters.onlyWithCoords) p.onlyWithCoords = true;
  if (filters.matchMode !== "all") p.matchMode = filters.matchMode;
  Object.entries(filters.flags).forEach(([k, v]) => { if (v) p[k] = true; });
  return p;
}

export default function RestaurantesPage() {
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);
  const [page, setPage]       = useState(1);
  const [showMap, setShowMap] = useState(false);

  const setFiltersAndReset = useCallback(
    (updater: (prev: Filters) => Filters) => { setFilters(updater); setPage(1); }, []
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
  const meta         = data?.meta;
  const totalPages   = meta?.totalPages ?? 1;
  const ciudades     = [...new Set(restaurantes.map(r => r.ciudad).filter(Boolean))].sort();

  const mapItems: MarkerItem[] = restaurantes
    .filter(r => r.latitud != null && r.longitud != null)
    .map(r => ({ id: r.id, nombre: r.nombre, latitud: r.latitud!, longitud: r.longitud!, direccion: r.direccion, ciudad: r.ciudad }));

  const handleDelete = (r: Restaurante) => {
    if (!confirm(`Eliminar "${r.nombre}"? Esta accion no se puede deshacer.`)) return;
    deleteMutation.mutate(r.id);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Restaurantes</h1>
          {meta && <p className="text-sm text-slate-400 mt-0.5">{meta.total} en total</p>}
        </div>
        <Link to="/restaurantes/nuevo"
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-colors">
          + Nuevo
        </Link>
      </div>

      <FiltersBar filters={filters} setFilters={setFiltersAndReset} ciudades={ciudades} onRefetch={() => refetch()} showMap={showMap} setShowMap={setShowMap} />

      {showMap && mapItems.length > 0 && <Map items={mapItems} />}

      {isError && (
        <div className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-200">
          Error al cargar restaurantes. Comprueba la conexion con el backend.
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : restaurantes.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">No hay restaurantes con estos filtros.</div>
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
              {restaurantes.map(r => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800 truncate max-w-[180px]">{r.nombre}</p>
                    <p className="text-xs text-slate-400">{r.direccion?.substring(0, 40)}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-slate-600">{r.ciudad}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-slate-500">{r.localidad}</td>
                  <td className="px-4 py-3 text-center">
                    {(r.favoritos ?? 0) > 0 ? (
                      <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full">
                        {r.favoritos} fav
                      </span>
                    ) : (
                      <span className="text-slate-300 text-xs">0</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center hidden sm:table-cell">
                    {r.latitud && r.longitud
                      ? <span className="text-green-500 text-xs font-medium">OK</span>
                      : <span className="text-slate-300 text-xs">Sin coords</span>}
                  </td>
                  <td className="px-4 py-3 text-center hidden sm:table-cell">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.activo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {r.activo ? "Activo" : "Inactivo"}
                    </span>
                    {r.verificado && (
                      <span className="ml-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Ver.</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link to={`/restaurantes/${r.id}/editar`}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium hover:bg-slate-50 transition-colors">
                        Editar
                      </Link>
                      <button onClick={() => handleDelete(r)} disabled={deleteMutation.isPending}
                        className="px-3 py-1.5 rounded-lg border border-red-200 text-red-500 text-xs font-medium hover:bg-red-50 transition-colors disabled:opacity-40">
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

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
            className="px-4 py-2 rounded-xl border text-sm disabled:opacity-40 hover:bg-slate-50 transition-colors">Anterior</button>
          <span className="text-sm text-slate-500">{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
            className="px-4 py-2 rounded-xl border text-sm disabled:opacity-40 hover:bg-slate-50 transition-colors">Siguiente</button>
        </div>
      )}
    </div>
  );
}