import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRestauranteById, postFavorito } from "../services/restauranteService";
import { isFavorite, toggleFavorite } from "../utils/favorites";
import { enviarSugerencia } from "../services/sugerenciaService";

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


function getFamilyPlan(r: any): string[] {
  const plan = [
    r.tronaDisponible ? "Trona lista para los peques" : null,
    r.sitioParaCarrito ? "Carrito sin agobios" : null,
    r.terrazaSegura ? "Terraza más tranquila" : null,
    r.parqueCercano ? "Parque cerca para después" : null,
    r.zonaInfantil ? "Zona infantil para entretenerse" : null,
    r.menuInfantil ? "Menú infantil disponible" : null,
    r.zonaAmplia ? "Espacio amplio para moverse" : null,
    r.accesibleConCarrito ? "Acceso cómodo con carrito" : null,
  ].filter(Boolean) as string[];

  return plan.slice(0, 4);
}

function getTrustSummary(r: any): string {
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

  if (score >= 7) return "Muy preparado para familias";
  if (score >= 4) return "Buena opción familiar";
  if (score >= 1) return "Tiene detalles útiles para ir con peques";
  return "Nuevo para la comunidad";
}

function normalizeTag(tag: unknown) {
  return String(tag || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getTags(r: any): string[] {
  return Array.isArray(r.tags) ? r.tags.map(normalizeTag) : [];
}

function hasAnyTag(r: any, tags: string[]) {
  const current = getTags(r);
  return tags.some((tag) => current.includes(normalizeTag(tag)));
}

function getDetailInsights(r: any) {
  const idealFor: string[] = [];

  if (hasAnyTag(r, ["padres tranquilos", "comer mientras juegan"])) {
    idealFor.push("Comer con menos agobio");
  }

  if (hasAnyTag(r, ["cumpleanos", "cumpleanos infantiles"]) || r.actividadesParaNinos) {
    idealFor.push("Celebraciones con peques");
  }

  if (hasAnyTag(r, ["ludoteca", "parque de bolas", "ocio infantil"]) || r.zonaInfantil) {
    idealFor.push("Niños entretenidos");
  }

  if (hasAnyTag(r, ["terraza con ninos"]) || r.terrazaSegura) {
    idealFor.push("Plan con terraza");
  }

  if (hasAnyTag(r, ["paella", "arroz", "mediterraneo"])) {
    idealFor.push("Comida familiar mediterránea");
  }

  if (idealFor.length === 0) {
    idealFor.push("Salida familiar cómoda");
  }

  const parents = hasAnyTag(r, ["padres tranquilos", "comer mientras juegan"])
    ? "Pensado para que los adultos puedan comer o tomar algo con más calma mientras los peques se entretienen."
    : r.terrazaSegura || r.zonaAmplia || r.sitioParaCarrito
      ? "Tiene detalles que hacen la visita más cómoda para ir en familia sin tanta improvisación."
      : "Buen candidato para familias que buscan un sitio sencillo y cómodo.";

  const kids = r.zonaInfantil || hasAnyTag(r, ["ludoteca", "parque de bolas", "ocio infantil"])
    ? "Los peques tienen opciones para jugar o entretenerse durante la visita."
    : r.parqueCercano
      ? "Puede combinarse con parque cercano antes o después de comer."
      : r.menuInfantil
        ? "Cuenta con opciones pensadas para niños."
        : "Puede encajar si buscas un plan tranquilo sin demasiada complicación.";

  const tip = hasAnyTag(r, ["cumpleanos", "cumpleanos infantiles"])
    ? "Si vas a celebrar un cumpleaños, llama antes para confirmar disponibilidad, horarios y condiciones."
    : r.zonaInfantil || hasAnyTag(r, ["ludoteca", "parque de bolas"])
      ? "Antes de ir, conviene confirmar horarios de la zona infantil o si requiere reserva."
      : r.terrazaSegura
        ? "Si buscas terraza, llama antes para confirmar disponibilidad según hora y clima."
        : "Si vas en hora punta o con carrito, es buena idea llamar antes para confirmar comodidad y espacio.";

  return {
    idealFor: idealFor.slice(0, 3),
    parents,
    kids,
    tip,
  };
}

function FamilyInsightSection({ r, familyPlan }: { r: any; familyPlan: string[] }) {
  const insights = getDetailInsights(r);

  return (
    <section className="mb-6 bg-gradient-to-br from-orange-50 via-amber-50 to-white border border-orange-100 rounded-3xl p-5 sm:p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-500 mb-1">
            Plan familiar rápido
          </p>
          <h2 className="font-extrabold text-slate-800 text-xl leading-tight">
            Lo importante antes de ir
          </h2>
        </div>

        <span className="hidden sm:inline-flex bg-white border border-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
          DCH
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <div className="bg-white/90 border border-orange-100 rounded-2xl p-4">
          <p className="text-[11px] uppercase tracking-wide font-bold text-orange-500 mb-2">
            Ideal para
          </p>
          <div className="space-y-2">
            {insights.idealFor.map((item) => (
              <p key={item} className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <IconCheck />
                {item}
              </p>
            ))}
          </div>
        </div>

        <div className="bg-white/90 border border-orange-100 rounded-2xl p-4">
          <p className="text-[11px] uppercase tracking-wide font-bold text-orange-500 mb-2">
            Para padres
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            {insights.parents}
          </p>
        </div>

        <div className="bg-white/90 border border-orange-100 rounded-2xl p-4">
          <p className="text-[11px] uppercase tracking-wide font-bold text-orange-500 mb-2">
            Para peques
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            {insights.kids}
          </p>
        </div>
      </div>

      {familyPlan.length > 0 && (
        <div className="mb-4">
          <p className="text-[11px] uppercase tracking-wide font-bold text-stone-400 mb-2">
            Detalles útiles
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {familyPlan.map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 bg-white/80 border border-orange-100 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600"
              >
                <IconCheck />
                {item}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-white border border-orange-100 px-4 py-3">
        <p className="text-[11px] uppercase tracking-wide font-bold text-orange-500 mb-1">
          Consejo DCH
        </p>
        <p className="text-sm text-slate-600 leading-relaxed">
          {insights.tip}
        </p>
      </div>
    </section>
  );
}

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

function IconCheck() {
  return (
    <svg className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg className="w-4 h-4 text-stone-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg className="w-4 h-4 text-stone-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg className="w-4 h-4 text-stone-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function IconWeb() {
  return (
    <svg className="w-4 h-4 text-stone-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
    </svg>
  );
}

function IconMapBtn() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  );
}

function IconShare() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
  );
}

function ShareButton({ nombre }: { nombre: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: nombre + " - Dónde Comemos Hoy", url });
      } catch { /* cancelado */ }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl border border-stone-200 bg-white text-stone-500 hover:border-orange-200 hover:text-orange-500 transition-all"
    >
      <IconShare />
      {copied ? "Enlace copiado" : "Compartir"}
    </button>
  );
}

function CorrectionForm({ restauranteNombre, restauranteId }: { restauranteNombre: string; restauranteId: number }) {
  const [open, setOpen] = useState(false);
  const [texto, setTexto] = useState("");
  const [nombre, setNombre] = useState("");
  const [enviado, setEnviado] = useState(false);

  const mutation = useMutation({
    mutationFn: () => enviarSugerencia({
      nombre: restauranteNombre,
      direccion: "-",
      localidad: "-",
      ciudad: "-",
      provincia: "-",
      descripcion: `CORRECCION para restaurante ID ${restauranteId}: ${texto}`,
      nombreContacto: nombre || "Anonimo",
    }),
    onSuccess: () => { setEnviado(true); setTexto(""); setNombre(""); },
  });

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-stone-400 hover:text-orange-500 transition-colors underline underline-offset-2"
      >
        Algo ha cambiado o hay un error? Sugerir corrección
      </button>
    );
  }

  return (
    <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 mt-2">
      <h3 className="font-semibold text-slate-700 mb-1 text-sm">Sugerir una corrección</h3>
      <p className="text-xs text-stone-400 mb-4">
        Cuéntanos qué ha cambiado o que esta mal. Lo revisaremos lo antes posible.
      </p>
      {enviado ? (
        <div className="text-center py-4">
          <p className="text-green-600 font-semibold text-sm">Gracias, lo revisaremos pronto.</p>
          <button onClick={() => { setOpen(false); setEnviado(false); }} className="text-xs text-stone-400 mt-2 hover:text-slate-600">Cerrar</button>
        </div>
      ) : (
        <div className="space-y-3">
          <textarea
            value={texto}
            onChange={e => setTexto(e.target.value)}
            placeholder="Ej: El telefono ha cambiado, ya no tienen terraza, han cerrado..."
            rows={3}
            className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none placeholder:text-stone-400"
          />
          <input
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            placeholder="Tu nombre (opcional)"
            className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 placeholder:text-stone-400"
          />
          <div className="flex gap-2">
            <button
              onClick={() => mutation.mutate()}
              disabled={!texto.trim() || mutation.isPending}
              className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-2 rounded-xl text-sm transition-colors"
            >
              {mutation.isPending ? "Enviando..." : "Enviar corrección"}
            </button>
            <button
              onClick={() => setOpen(false)}
              className="px-4 border border-stone-200 rounded-xl text-sm text-stone-500 hover:bg-stone-100 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

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

  // SEO dinamico
  if (r) {
    document.title = `${r.nombre} - Dónde Comemos Hoy`;
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) { metaDesc = document.createElement("meta"); metaDesc.setAttribute("name", "description"); document.head.appendChild(metaDesc); }
    metaDesc.setAttribute("content", `${r.nombre} en ${r.ciudad}. ${r.descripcion.substring(0, 120)}...`);
  }

  const mutation = useMutation({
    mutationFn: () => postFavorito(numId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["restaurante", numId] }),
  });

  const handleFav = () => {
    const { added } = toggleFavorite(numId);
    setFavLocal(!favLocal);
    if (added) mutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-4">
        <div className="h-72 bg-stone-100 rounded-2xl animate-pulse" />
        <div className="h-7 bg-stone-100 rounded w-2/3 animate-pulse" />
        <div className="h-4 bg-stone-100 rounded w-1/3 animate-pulse" />
        <div className="h-4 bg-stone-100 rounded animate-pulse" />
      </div>
    );
  }

  if (isError || !r) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-600 font-medium mb-4">Restaurante no encontrado.</p>
        <Link to="/" className="text-orange-500 font-semibold hover:underline text-sm">Volver al listado</Link>
      </div>
    );
  }

  const mapsUrl = r.latitud && r.longitud
    ? `https://www.google.com/maps?q=${r.latitud},${r.longitud}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.nombre + " " + r.direccion + " " + r.ciudad)}`;

  const chips = CARACTERISTICAS.filter(c => r[c.key as keyof typeof r] === true);
  const tieneInfo = r.horario || r.telefonoRestaurante || r.emailRestaurante || r.sitioWeb;
  const familyPlan = getFamilyPlan(r);
  const trustSummary = getTrustSummary(r);

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-orange-500 mb-6 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Volver al listado
      </Link>

      <div className="rounded-2xl overflow-hidden h-64 sm:h-80 mb-6 bg-gradient-to-br from-stone-50 to-orange-50 relative">
        {r.imagenes && r.imagenes.length > 0 ? (
          <img src={r.imagenes[0]} alt={r.nombre} className="w-full h-full object-cover"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <svg className="w-14 h-14 text-stone-200" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 48 48">
              <rect x="4" y="12" width="40" height="28" rx="4" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="24" cy="26" r="7" strokeLinecap="round" />
              <circle cx="37" cy="18" r="3" fill="currentColor" stroke="none" />
            </svg>
            <span className="text-sm text-stone-300 font-medium">Sin foto todavía</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
      </div>

      <div className="mb-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 leading-tight">{r.nombre}</h1>
            <p className="text-stone-400 text-sm mt-1 truncate">{r.direccion}, {r.localidad}, {r.ciudad}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
            {r.verificado && (
              <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-100">
                Verificado
              </span>
            )}
            <ShareButton nombre={r.nombre} />
            <button
              onClick={handleFav}
              className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl border transition-all ${
                favLocal ? "bg-red-50 text-red-500 border-red-200" : "bg-white text-stone-500 border-stone-200 hover:border-red-200 hover:text-red-400"
              }`}
            >
              <IconHeart filled={favLocal} />
              {favLocal ? "Guardado" : "Guardar"}
            </button>
          </div>
        </div>
        {(r.favoritos ?? 0) > 0 && (
          <p className="text-sm text-orange-500 font-semibold mt-2">
            ❤️ {r.favoritos} {r.favoritos === 1 ? "familia lo ha guardado" : "familias lo han guardado"}
          </p>
        )}
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
          <p className="text-[11px] uppercase tracking-wide font-bold text-orange-500 mb-1">Confianza familiar DCH</p>
          <p className="text-sm font-bold text-slate-700">{trustSummary}</p>
        </div>
        <div className="bg-white border border-stone-100 rounded-2xl p-4 shadow-sm">
          <p className="text-[11px] uppercase tracking-wide font-bold text-stone-400 mb-1">Para decidir rápido</p>
          <p className="text-sm font-bold text-slate-700">Información pensada para familias</p>
        </div>
        <div className="bg-white border border-stone-100 rounded-2xl p-4 shadow-sm">
          <p className="text-[11px] uppercase tracking-wide font-bold text-stone-400 mb-1">Comunidad</p>
          <p className="text-sm font-bold text-slate-700">{(r.favoritos ?? 0) > 0 ? "Guardado por familias" : "Nuevo descubrimiento"}</p>
        </div>
      </section>

      <p className="text-slate-600 leading-relaxed mb-6 text-base">{r.descripcion}</p>

      <FamilyInsightSection r={r} familyPlan={familyPlan} />

      {chips.length > 0 && (
        <section className="mb-6">
          <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wide mb-3">Por qué es ideal para familias</h2>
          <div className="flex flex-wrap gap-2">
            {chips.map(c => (
              <span key={c.key} className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-700 text-sm font-medium px-3 py-1.5 rounded-full border border-orange-100">
                <IconCheck />
                {c.label}
              </span>
            ))}
          </div>
        </section>
      )}

      {tieneInfo && (
        <section className="bg-stone-50 rounded-2xl p-5 mb-6">
          <div className="space-y-3">
            {r.horario && (
              <div className="flex items-start gap-3 text-sm">
                <IconClock />
                <span className="text-slate-600 leading-relaxed">{r.horario}</span>
              </div>
            )}
            {r.telefonoRestaurante && (
              <div className="flex items-center gap-3 text-sm">
                <IconPhone />
                <a href={`tel:${r.telefonoRestaurante}`} className="text-orange-500 hover:underline font-medium">{r.telefonoRestaurante}</a>
              </div>
            )}
            {r.emailRestaurante && (
              <div className="flex items-center gap-3 text-sm">
                <IconMail />
                <a href={`mailto:${r.emailRestaurante}`} className="text-orange-500 hover:underline">{r.emailRestaurante}</a>
              </div>
            )}
            {r.sitioWeb && (
              <div className="flex items-center gap-3 text-sm">
                <IconWeb />
                <a href={r.sitioWeb} target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">Visitar sitio web</a>
              </div>
            )}
          </div>
        </section>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors">
          <IconMapBtn />
          Cómo llegar
        </a>
        <Link to="/"
          className="flex-1 text-center border border-stone-200 hover:border-orange-300 text-slate-600 hover:text-orange-600 font-semibold py-3 rounded-xl transition-colors bg-white">
          Ver más restaurantes
        </Link>
      </div>

      <CorrectionForm restauranteNombre={r.nombre} restauranteId={r.id} />
    </main>
  );
}

