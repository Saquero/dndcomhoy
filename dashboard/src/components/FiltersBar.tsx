import { useMemo, useState } from "react";

export type SortKey =
  | "nombre_asc"
  | "nombre_desc"
  | "ciudad_asc"
  | "ciudad_desc";
export type MatchMode = "all" | "any";

export type FamilyFlags = {
  zonaAmplia: boolean;
  parqueCercano: boolean;
  zonaInfantil: boolean;
  tronaDisponible: boolean;
  cambiadorDisponible: boolean;
  sitioParaCarrito: boolean;
  terrazaSegura: boolean;
  actividadesParaNinos: boolean; // sin ñ para TS/URL
  menuInfantil: boolean;
  aptoVegetariano: boolean;
  aptoVegano: boolean;
  sinPantallas: boolean;
  ambienteFamiliar: boolean;
  accesibleConCarrito: boolean;
};

export type Filters = {
  q: string;
  ciudad: string;
  onlyWithCoords: boolean;
  matchMode: MatchMode;
  flags: FamilyFlags;
  sortBy: SortKey;
};

type Props = {
  filters: Filters;
  setFilters: (updater: (prev: Filters) => Filters) => void;
  ciudades: string[];
  onRefetch?: () => void;
  showMap: boolean;
  setShowMap: (v: boolean) => void;
};

type FlagKey = keyof FamilyFlags;

function FlagCheck({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  const id = `f-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <label htmlFor={id} className="inline-flex items-center gap-2 text-sm">
      <input
        id={id}
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4"
      />
      {label}
    </label>
  );
}

export default function FiltersBar({
  filters,
  setFilters,
  ciudades,
  onRefetch,
  showMap,
  setShowMap,
}: Props) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const selectedFlagsCount = useMemo(
    () => Object.values(filters.flags).filter(Boolean).length,
    [filters.flags]
  );

  return (
    <div className="rounded-2xl border bg-white p-3 shadow-sm space-y-3">
      {/* Fila principal */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="md:col-span-2">
          <label className="text-xs text-gray-600">Buscar</label>
          <input
            value={filters.q}
            onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
            placeholder="Nombre, dirección, ciudad…"
            className="w-full mt-1 rounded-lg border px-3 py-2 outline-none focus:ring"
          />
        </div>

        <div>
          <label className="text-xs text-gray-600">Ciudad</label>
          <select
            value={filters.ciudad}
            onChange={(e) =>
              setFilters((f) => ({ ...f, ciudad: e.target.value }))
            }
            className="w-full mt-1 rounded-lg border px-3 py-2 outline-none focus:ring bg-white"
          >
            <option value="">Todas</option>
            {ciudades.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-600">Orden</label>
          <select
            value={filters.sortBy}
            onChange={(e) =>
              setFilters((f) => ({ ...f, sortBy: e.target.value as SortKey }))
            }
            className="w-full mt-1 rounded-lg border px-3 py-2 outline-none focus:ring bg-white"
          >
            <option value="nombre_asc">Nombre ↑</option>
            <option value="nombre_desc">Nombre ↓</option>
            <option value="ciudad_asc">Ciudad ↑</option>
            <option value="ciudad_desc">Ciudad ↓</option>
          </select>
        </div>
      </div>

      {/* Controles secundarios */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={filters.onlyWithCoords}
            onChange={(e) =>
              setFilters((f) => ({ ...f, onlyWithCoords: e.target.checked }))
            }
            className="h-4 w-4"
          />
          Solo con coordenadas
        </label>

        <button
          className="px-3 py-1 rounded-lg border bg-gray-50 hover:bg-gray-100 text-sm"
          onClick={() => setShowAdvanced((s) => !s)}
        >
          Filtros familiares{" "}
          {selectedFlagsCount > 0 ? `(${selectedFlagsCount})` : ""}
        </button>

        <div className="flex-1" />

        <button
          className="px-3 py-1 rounded-lg border text-sm"
          onClick={() =>
            setFilters((prev) => ({
              ...prev,
              q: "",
              ciudad: "",
              onlyWithCoords: false,
              flags: Object.fromEntries(
                Object.keys(prev.flags).map((k) => [k, false])
              ) as FamilyFlags,
              matchMode: "all",
              sortBy: "nombre_asc",
            }))
          }
        >
          Limpiar filtros
        </button>

        <button
          className="px-3 py-1 rounded-lg bg-black text-white text-sm"
          onClick={onRefetch}
        >
          Recargar
        </button>

        <label className="inline-flex items-center gap-2 text-sm ml-2">
          <input
            type="checkbox"
            checked={showMap}
            onChange={(e) => setShowMap(e.target.checked)}
            className="h-4 w-4"
          />
          Mostrar mapa
        </label>
      </div>

      {/* Filtros avanzados */}
      {showAdvanced && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2 mt-2">
          {(
            [
              "zonaAmplia",
              "parqueCercano",
              "zonaInfantil",
              "tronaDisponible",
              "cambiadorDisponible",
              "sitioParaCarrito",
              "terrazaSegura",
              "actividadesParaNinos",
              "menuInfantil",
              "aptoVegetariano",
              "aptoVegano",
              "sinPantallas",
              "ambienteFamiliar",
              "accesibleConCarrito",
            ] as FlagKey[]
          ).map((k) => (
            <FlagCheck
              key={k}
              label={
                {
                  zonaAmplia: "Zona amplia",
                  parqueCercano: "Parque cercano",
                  zonaInfantil: "Zona infantil",
                  tronaDisponible: "Trona disponible",
                  cambiadorDisponible: "Cambiador disponible",
                  sitioParaCarrito: "Sitio para carrito",
                  terrazaSegura: "Terraza segura",
                  actividadesParaNinos: "Actividades para niños",
                  menuInfantil: "Menú infantil",
                  aptoVegetariano: "Apto vegetariano",
                  aptoVegano: "Apto vegano",
                  sinPantallas: "Sin pantallas",
                  ambienteFamiliar: "Ambiente familiar",
                  accesibleConCarrito: "Accesible con carrito",
                }[k]
              }
              value={filters.flags[k]}
              onChange={(v) =>
                setFilters((f) => ({
                  ...f,
                  flags: { ...f.flags, [k]: v },
                }))
              }
            />
          ))}

          <div className="col-span-2 md:col-span-3 lg:col-span-4 flex items-center gap-3 pt-1">
            <span className="text-xs text-gray-600">Modo de coincidencia</span>
            <label className="inline-flex items-center gap-2 text-xs">
              <input
                type="radio"
                name="matchMode"
                checked={filters.matchMode === "all"}
                onChange={() => setFilters((f) => ({ ...f, matchMode: "all" }))}
              />
              Deben cumplirse todos
            </label>
            <label className="inline-flex items-center gap-2 text-xs">
              <input
                type="radio"
                name="matchMode"
                checked={filters.matchMode === "any"}
                onChange={() => setFilters((f) => ({ ...f, matchMode: "any" }))}
              />
              Con que cumplan alguno
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
