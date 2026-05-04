// dashboard/src/pages/HomePage.tsx
import { useQuery, useQueries } from "@tanstack/react-query";
import { getRestaurantes, type RestaurantesResponse } from "../services/restauranteService";
import { getSugerencias, type SugerenciasResponse } from "../services/sugerenciaService";

const FLAGS = [
  { key: "trona",            label: "Trona",              param: "tronaDisponible" },
  { key: "zonaInfantil",     label: "Zona infantil",       param: "zonaInfantil" },
  { key: "menuInfantil",     label: "Menu infantil",       param: "menuInfantil" },
  { key: "cambiador",        label: "Cambiador",           param: "cambiadorDisponible" },
  { key: "carrito",          label: "Carrito OK",          param: "sitioParaCarrito" },
  { key: "terraza",          label: "Terraza segura",      param: "terrazaSegura" },
  { key: "parque",           label: "Parque cercano",      param: "parqueCercano" },
  { key: "zonaAmplia",       label: "Zona amplia",         param: "zonaAmplia" },
  { key: "vegano",           label: "Vegano",              param: "aptoVegano" },
  { key: "vegetariano",      label: "Vegetariano",         param: "aptoVegetariano" },
  { key: "sinPantallas",     label: "Sin pantallas",       param: "sinPantallas" },
  { key: "ambienteFamiliar", label: "Ambiente familiar",   param: "ambienteFamiliar" },
  { key: "accesible",        label: "Accesible carrito",   param: "accesibleConCarrito" },
  { key: "actividades",      label: "Actividades ninos",   param: "actividadesParaNinos" },
] as const;

function BigCard({
  title, value, sub, loading, error, accent = false,
}: {
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

function SmallCard({
  title, count, percent, loading,
}: {
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

function TopFavCard() {
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

  if (isError || !top || ((top as any).favoritos ?? 0) === 0) {
    return (
      <div className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
        <p className="text-sm text-gray-500 mb-1">Restaurante mas popular</p>
        <p className="text-sm text-gray-400 italic">Aun sin favoritos registrados</p>
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
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-orange-500 font-semibold uppercase tracking-wide mb-0.5">Mas popular</p>
        <p className="font-bold text-gray-800 truncate">{top.nombre}</p>
        <p className="text-xs text-gray-400">{top.ciudad}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-2xl font-extrabold text-orange-500">{(top as any).favoritos}</p>
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

  const total      = totalQ.data?.meta?.total ?? 0;
  const withCoords = coordsQ.data?.meta?.total ?? 0;
  const noCoords   = Math.max(total - withCoords, 0);
  const pendientes = pendingQ.data?.meta?.total ?? 0;
  const pct        = (n: number) => (total ? Math.round((n / total) * 100) : 0);

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
            value={pendingQ.isError ? "-" : String(pendientes)}
            sub={pendingQ.isError ? "No se pudieron cargar" : pendientes > 0 ? "Sugerencias por revisar" : "Al dia"}
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
          <TopFavCard />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
          {FLAGS.map((f, i) => {
            const q     = flagQueries[i];
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
