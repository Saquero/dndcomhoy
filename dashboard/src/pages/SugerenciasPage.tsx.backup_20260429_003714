// dashboard/src/pages/SugerenciasPage.tsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSugerencias,
  aprobarSugerencia,
  rechazarSugerencia,
  type Sugerencia,
  type Estado,
} from "../services/sugerenciaService";

const ESTADO_LABELS: Record<Estado, string> = {
  PENDIENTE: "Pendiente",
  APROBADA: "Aprobada",
  RECHAZADA: "Rechazada",
  DUPLICADA: "Duplicada",
};

const ESTADO_COLORS: Record<Estado, string> = {
  PENDIENTE: "bg-yellow-100 text-yellow-800",
  APROBADA: "bg-green-100 text-green-800",
  RECHAZADA: "bg-red-100 text-red-800",
  DUPLICADA: "bg-gray-100 text-gray-700",
};

const FLAG_LABELS: Record<string, string> = {
  zonaAmplia: "Zona amplia",
  parqueCercano: "Parque cercano",
  zonaInfantil: "Zona infantil",
  tronaDisponible: "Trona",
  cambiadorDisponible: "Cambiador",
  sitioParaCarrito: "Sitio carrito",
  terrazaSegura: "Terraza segura",
  actividadesParaNinos: "Actividades ninos",
  menuInfantil: "Menu infantil",
  aptoVegetariano: "Vegetariano",
  aptoVegano: "Vegano",
  sinPantallas: "Sin pantallas",
  ambienteFamiliar: "Ambiente familiar",
  accesibleConCarrito: "Accesible carrito",
};

const FLAG_KEYS = Object.keys(FLAG_LABELS);

function SugerenciaDetalle({
  s,
  onClose,
}: {
  s: Sugerencia;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [motivo, setMotivo] = useState("");
  const [showMotivoInput, setShowMotivoInput] = useState(false);

  const aprobar = useMutation({
    mutationFn: () => aprobarSugerencia(s.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sugerencias"] });
      onClose();
    },
  });

  const rechazar = useMutation({
    mutationFn: () => rechazarSugerencia(s.id, motivo),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sugerencias"] });
      onClose();
    },
  });

  const flags = FLAG_KEYS.filter((k) => s[k as keyof Sugerencia] === true);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white rounded-t-2xl">
          <div>
            <h2 className="font-bold text-slate-800 text-lg">{s.nombre}</h2>
            <p className="text-xs text-slate-400">{s.ciudad} â€” {new Date(s.creadaEn).toLocaleDateString("es-ES")}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl font-bold w-8 h-8 flex items-center justify-center">
            x
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-1">Descripcion</p>
            <p className="text-sm text-slate-600 leading-relaxed">{s.descripcion}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-slate-400 font-medium mb-0.5">Direccion</p>
              <p className="text-slate-700">{s.direccion}</p>
              <p className="text-slate-500 text-xs">{s.localidad}, {s.ciudad}, {s.provincia}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium mb-0.5">Contacto</p>
              <p className="text-slate-700">{s.nombreContacto}</p>
              {s.emailContacto && <p className="text-slate-500 text-xs">{s.emailContacto}</p>}
            </div>
          </div>

          {flags.length > 0 && (
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-2">Caracteristicas</p>
              <div className="flex flex-wrap gap-1.5">
                {flags.map((k) => (
                  <span key={k} className="text-xs bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full border border-orange-100">
                    {FLAG_LABELS[k]}
                  </span>
                ))}
              </div>
            </div>
          )}

          {s.comentarios && (
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-1">Comentarios</p>
              <p className="text-sm text-slate-600 italic">{s.comentarios}</p>
            </div>
          )}

          {/* Acciones */}
          {s.estado === "PENDIENTE" && (
            <div className="pt-2 space-y-3">
              {!showMotivoInput ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => aprobar.mutate()}
                    disabled={aprobar.isPending}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
                  >
                    {aprobar.isPending ? "Aprobando..." : "Aprobar y publicar"}
                  </button>
                  <button
                    onClick={() => setShowMotivoInput(true)}
                    className="flex-1 border border-red-200 text-red-600 hover:bg-red-50 font-semibold py-2.5 rounded-xl text-sm transition-colors"
                  >
                    Rechazar
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-600 block">
                    Motivo del rechazo {s.emailContacto ? "(se guardara para el contacto)" : ""}
                  </label>
                  <textarea
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    placeholder="Describe brevemente por que se rechaza..."
                    rows={3}
                    className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => rechazar.mutate()}
                      disabled={rechazar.isPending}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
                    >
                      {rechazar.isPending ? "Rechazando..." : "Confirmar rechazo"}
                    </button>
                    <button
                      onClick={() => setShowMotivoInput(false)}
                      className="px-4 border rounded-xl text-sm text-slate-500 hover:bg-slate-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {(aprobar.isError || rechazar.isError) && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-xl">
                  Error al procesar la sugerencia. Intenta de nuevo.
                </p>
              )}
            </div>
          )}

          {s.estado !== "PENDIENTE" && (
            <div className={`text-sm font-medium px-4 py-2.5 rounded-xl text-center ${ESTADO_COLORS[s.estado]}`}>
              Sugerencia {ESTADO_LABELS[s.estado].toLowerCase()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SugerenciasPage() {
  const [page, setPage] = useState(1);
  const [estadoFiltro, setEstadoFiltro] = useState<Estado | "">("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Sugerencia | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["sugerencias", page, estadoFiltro, search],
    queryFn: () =>
      getSugerencias({
        page,
        pageSize: 20,
        estado: estadoFiltro || undefined,
        search: search || undefined,
      }),
    staleTime: 10_000,
  });

  const sugerencias = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800">Sugerencias</h1>
        {meta && (
          <span className="text-sm text-slate-500">{meta.total} en total</span>
        )}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 w-48"
        />
        <select
          value={estadoFiltro}
          onChange={(e) => { setEstadoFiltro(e.target.value as Estado | ""); setPage(1); }}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 bg-white"
        >
          <option value="">Todos los estados</option>
          <option value="PENDIENTE">Pendientes</option>
          <option value="APROBADA">Aprobadas</option>
          <option value="RECHAZADA">Rechazadas</option>
          <option value="DUPLICADA">Duplicadas</option>
        </select>
      </div>

      {/* Lista */}
      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && sugerencias.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          No hay sugerencias con estos filtros.
        </div>
      )}

      {!isLoading && sugerencias.length > 0 && (
        <div className="space-y-2">
          {sugerencias.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelected(s)}
              className="w-full text-left rounded-xl border bg-white hover:shadow-sm hover:border-orange-200 transition-all p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-800 truncate">{s.nombre}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${ESTADO_COLORS[s.estado]}`}>
                      {ESTADO_LABELS[s.estado]}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {s.ciudad} &middot; {s.nombreContacto} &middot; {new Date(s.creadaEn).toLocaleDateString("es-ES")}
                  </p>
                </div>
                <span className="text-slate-300 text-sm flex-shrink-0">Ver</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Paginacion */}
      {meta && meta.pages > 1 && (
        <div className="flex justify-center items-center gap-3 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-4 py-2 rounded-xl border text-sm disabled:opacity-40 hover:bg-slate-50"
          >
            Anterior
          </button>
          <span className="text-sm text-slate-500">
            {page} / {meta.pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(meta.pages, p + 1))}
            disabled={page >= meta.pages}
            className="px-4 py-2 rounded-xl border text-sm disabled:opacity-40 hover:bg-slate-50"
          >
            Siguiente
          </button>
        </div>
      )}

      {/* Modal detalle */}
      {selected && (
        <SugerenciaDetalle s={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
