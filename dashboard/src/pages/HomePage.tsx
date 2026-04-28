// dashboard/src/pages/HomePage.tsx
import { Link } from "react-router-dom";
import { useQuery, useQueries } from "@tanstack/react-query";
import { getRestaurantes, type RestaurantesResponse } from "../services/restauranteService";
import { getSugerencias, type SugerenciasResponse } from "../services/sugerenciaService";

// ----------------------------------------------------------------
// Flags con sus labels y param de backend
// ----------------------------------------------------------------
const FLAGS = [
  { key: "trona",           label: "Trona",              param: "tronaDisponible" },
  { key: "zonaInfantil",    label: "Zona infantil",       param: "zonaInfantil" },
  { key: "menuInfantil",    label: "Menu infantil",       param: "menuInfantil" },
  { key: "cambiador",       label: "Cambiador",           param: "cambiadorDisponible" },
  { key: "carrito",         label: "Carrito OK",          param: "sitioParaCarrito" },
  { key: "terraza",         label: "Terraza segura",      param: "terrazaSegura" },
  { key: "parque",          label: "Parque cercano",      param: "parqueCercano" },
  { key: "zonaAmplia",      label: "Zona amplia",         param: "zonaAmplia" },
  { key: "vegano",          label: "Vegano",              param: "aptoVegano" },
  { key: "vegetariano",     label: "Vegetariano",         param: "aptoVegetariano" },
  { key: "sinPantallas",    label: "Sin pantallas",       param: "sinPantallas" },
  { key: "ambienteFamiliar",label: "Ambiente familiar",   param: "ambienteFamiliar" },
  { key: "accesible",       label: "Accesible carrito",   param: "accesibleConCarrito" },
  { key: "actividades",     label: "Actividades ninos",   param: "actividadesParaNinos" },
] as const;

// ----------------------------------------------------------------
// Componentes
// ----------------------------------------------------------------
function BigCard({
  title, value, sub, loading, error, to, accent = false,
}: {
  title: string; value: string; sub?: string;
  loading?: boolean; error?: string; to?: string; accent?: boolean;
}) {
  const inner = (
    <div className={`rounded-2xl p-5 border shadow-sm hover:shadow-md transition-all ${accent ? "bg-orange-50 border-orange-200" : "bg-white"}`}>
      <p className="text-sm text-gray-500">{title}</p>
      {loading ? (
        <div className="mt-2 h-8 w-24 animate-pulse rounded bg-gray-200" />
      ) : error ? (
        <div className="mt-2 text-sm text-red-600">Error: {error}</div>
      ) : (
        <>
          <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </>
      )}
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : inner;
}

function SmallCard({
  title, count, percent, loading, error,
}: {
  title: string; count: number; percent: number; loading?: boolean; error?: string;
}) {
  return (
    <div className="rounded-xl bg-white p-3 shadow-sm border">
      <p className="text-xs text-gray-500">{title}</p>
      {loading ? (
        <div className="mt-1 h-6 w-16 animate-pulse rounded bg-gray-200" />
      ) : error ? (
        <p className="mt-1 text-xs text-red-600">Error</p>
      ) : (
        <p className="mt-0.5 text-lg font-semibold text-gray-800">
          {percent}%{" "}
          <span className="text-gray-400 text-xs">({count})</span>
        </p>
      )}
    </div>
  );
}

function TopFavCard({ loading }: { loading?: boolean }) {
  const { data, isLoading, isError } = useQuery<RestaurantesResponse>({
    queryKey: ["home-top-fav"],
    queryFn: () => getRestaurantes({ page: 1, pageSize: 1, sortBy: "favoritos_desc" } as any),
    staleTime: 30_000,
  });

  const top = data?.data?.[0];
  const isActuallyLoading = loading || isLoading;

  if (isActuallyLoading) {
    return (
      <div className="rounded-2xl bg-white border p-4 shadow-sm">
        <p className="text-sm text-gray-500 mb-2">Restaurante mas popular</p>
        <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  if (isError || !top || (top.favoritos ?? 0) === 0) {
    return (
      <div className="rounded-2xl bg-white border p-4 shadow-sm">
        <p className="text-sm text-gray-500 mb-1">Restaurante mas popular</p>
        <p className="text-xs text-gray-400">Aun sin favoritos registrados</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 p-4 shadow-sm flex items-center gap-4">
      <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
        ðŸ†
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-orange-500 font-semibold uppercase tracking-wide mb-0.5">
          Mas popular
        </p>
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

// ----------------------------------------------------------------
// Pagina principal
// ----------------------------------------------------------------
export default function HomePage() {
  // Totales
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
  });

  // Queries por flag (igual que antes)
  const flagQueries = useQueries({
    queries: FLAGS.map((f) => ({
      queryKey: ["home-flag", f.param],
      queryFn: () => getRestaurantes({ page: 1, pageSize: 1, [f.param]: true } as any),
      staleTime: 30_000,
    })),
  });

  const total       = totalQ.data?.meta?.total ?? 0;
  const withCoords  = coordsQ.data?.meta?.total ?? 0;
  const withoutCoords = Math.max(total - withCoords, 0);
  const pendientes  = pendingQ.data?.meta?.total ?? 0;
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);

  return (
    <div className="space-y-6 p-1">
      <section>
        <h2 className="text-xl font-semibold mb-3">Resumen</h2>

        {/* Fila 1: totales + pendientes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BigCard
            title="Total de restaurantes"
            value={String(total)}
            sub="En base de datos"
            loading={totalQ.isLoading}
            error={totalQ.isError ? (totalQ.error as Error).message : undefined}
            to="/restaurantes"
          />
          <BigCard
            title="Peticiones pendientes"
            value={String(pendientes)}
            sub="Sugerencias por revisar"
            loading={pendingQ.isLoading}
            error={pendingQ.isError ? (pendingQ.error as Error).message : undefined}
            to="/sugerencias"
            accent={pendientes > 0}
          />
        </div>

        {/* Fila 2: coordenadas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <BigCard
            title="Con coordenadas"
            value={`${withCoords} (${pct(withCoords)}%)`}
            sub="Listos para mapa"
            loading={coordsQ.isLoading || totalQ.isLoading}
            error={
              coordsQ.isError ? (coordsQ.error as Error).message
              : totalQ.isError ? (totalQ.error as Error).message
              : undefined
            }
          />
          <BigCard
            title="Sin coordenadas"
            value={`${withoutCoords} (${pct(withoutCoords)}%)`}
            sub="Pendientes de geocodificar"
            loading={coordsQ.isLoading || totalQ.isLoading}
            error={
              coordsQ.isError ? (coordsQ.error as Error).message
              : totalQ.isError ? (totalQ.error as Error).message
              : undefined
            }
          />
        </div>

        {/* Fila 3: top favorito */}
        <div className="mt-4">
          <TopFavCard loading={totalQ.isLoading} />
        </div>

        {/* Fila 4: tarjetas pequeÃ±as de flags */}
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
                error={q.isError ? (q.error as Error).message : undefined}
              />
            );
          })}
        </div>
      </section>

      {/* Acceso rapido */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Acceso rapido</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            to="/restaurantes/nuevo"
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm py-3 rounded-xl text-center transition-colors"
          >
            + Nuevo restaurante
          </Link>
          <Link
            to="/sugerencias"
            className="bg-white border border-gray-200 hover:border-orange-200 hover:bg-orange-50 text-gray-700 font-semibold text-sm py-3 rounded-xl text-center transition-colors"
          >
            Ver sugerencias
          </Link>
          <Link
            to="/restaurantes"
            className="bg-white border border-gray-200 hover:border-orange-200 hover:bg-orange-50 text-gray-700 font-semibold text-sm py-3 rounded-xl text-center transition-colors"
          >
            Ver restaurantes
          </Link>
        </div>
      </section>
    </div>
  );
}
