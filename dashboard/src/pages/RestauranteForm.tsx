// dashboard/src/pages/RestauranteForm.tsx
import { useState, useMemo, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  createRestaurante, regeocodeRestaurante, type Restaurante,
} from "../services/restauranteService";

const GOOGLE_PLACES_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_KEY ?? "";

const FLAG_FIELDS = [
  "zonaAmplia", "parqueCercano", "zonaInfantil", "tronaDisponible",
  "cambiadorDisponible", "sitioParaCarrito", "terrazaSegura",
  "actividadesParaNinos", "menuInfantil", "aptoVegetariano",
  "aptoVegano", "sinPantallas", "ambienteFamiliar", "accesibleConCarrito",
] as const;

type FlagsState = Record<(typeof FLAG_FIELDS)[number], boolean>;

function labelFor(k: string) {
  const map: Record<string, string> = {
    zonaAmplia: "Zona amplia", parqueCercano: "Parque cercano",
    zonaInfantil: "Zona infantil", tronaDisponible: "Trona disponible",
    cambiadorDisponible: "Cambiador disponible", sitioParaCarrito: "Sitio para carrito",
    terrazaSegura: "Terraza segura", actividadesParaNinos: "Actividades para ninos",
    menuInfantil: "Menu infantil", aptoVegetariano: "Apto vegetariano",
    aptoVegano: "Apto vegano", sinPantallas: "Sin pantallas",
    ambienteFamiliar: "Ambiente familiar", accesibleConCarrito: "Accesible con carrito",
  };
  return map[k] || k;
}

function Input({ label, name, value, onChange, required }: {
  label: string; name: string; value: string; required?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="text-sm">
      <span className="block text-gray-600 mb-1">{label}</span>
      <input
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
        name={name} value={value} onChange={onChange} required={!!required}
      />
    </label>
  );
}

async function buscarFotosGooglePlaces(nombre: string, ciudad: string, apiKey: string): Promise<string[]> {
  if (!apiKey) throw new Error("Falta VITE_GOOGLE_PLACES_KEY en dashboard/.env");
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "places.id,places.displayName,places.photos",
    },
    body: JSON.stringify({ textQuery: `${nombre} restaurante ${ciudad}`, languageCode: "es", maxResultCount: 1 }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `Error ${res.status}`);
  }
  const data = await res.json();
  const place = data?.places?.[0];
  if (!place) throw new Error("No se encontro el restaurante en Google Places");
  return (place.photos ?? []).slice(0, 5).map((p: { name: string }) =>
    `https://places.googleapis.com/v1/${p.name}/media?key=${apiKey}&maxHeightPx=800&maxWidthPx=1200`
  );
}

export default function RestauranteForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: "", direccion: "", localidad: "", ciudad: "", provincia: "",
    codigoPostal: "", pais: "Espana", telefonoRestaurante: "",
    emailRestaurante: "", sitioWeb: "", horario: "", descripcion: "",
    latitud: "", longitud: "", imagenesText: "",
  });
  const [flags, setFlags] = useState<FlagsState>(
    () => Object.fromEntries(FLAG_FIELDS.map(k => [k, false])) as FlagsState
  );
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [buscarFotos, setBuscarFotos] = useState(false);
  const [fotoMsg, setFotoMsg]         = useState<string | null>(null);

  const imagenesArray = useMemo(
    () => form.imagenesText.split("\n").map(s => s.trim()).filter(Boolean),
    [form.imagenesText]
  );

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(s => ({ ...s, [e.target.name]: e.target.value }));

  const onFlagChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFlags(s => ({ ...s, [e.target.name]: e.target.checked }));

  const handleBuscarFotos = async () => {
    if (!form.nombre.trim() || !form.ciudad.trim()) {
      setFotoMsg("Rellena el nombre y la ciudad antes de buscar fotos.");
      return;
    }
    setBuscarFotos(true);
    setFotoMsg(null);
    try {
      const urls = await buscarFotosGooglePlaces(form.nombre.trim(), form.ciudad.trim(), GOOGLE_PLACES_API_KEY);
      if (urls.length === 0) {
        setFotoMsg("No se encontraron fotos en Google Places.");
      } else {
        setForm(s => ({ ...s, imagenesText: urls.join("\n") }));
        setFotoMsg(`${urls.length} foto(s) encontradas. Puedes editarlas abajo.`);
      }
    } catch (err: any) {
      setFotoMsg(`Error: ${err.message}`);
    } finally {
      setBuscarFotos(false);
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload: Partial<Restaurante> & Record<string, any> = {
        nombre: form.nombre.trim(), direccion: form.direccion.trim(),
        localidad: form.localidad.trim(), ciudad: form.ciudad.trim(),
        provincia: form.provincia.trim(),
        codigoPostal:        form.codigoPostal.trim()        || undefined,
        pais:                form.pais.trim()                || undefined,
        telefonoRestaurante: form.telefonoRestaurante.trim() || undefined,
        emailRestaurante:    form.emailRestaurante.trim()    || undefined,
        sitioWeb:            form.sitioWeb.trim()            || undefined,
        horario:             form.horario.trim()             || undefined,
        descripcion:         form.descripcion.trim(),
        imagenes: imagenesArray,
        ...flags,
      };
      if (form.latitud !== "") { const n = Number(form.latitud); if (!isNaN(n)) payload.latitud = n; }
      if (form.longitud !== "") { const n = Number(form.longitud); if (!isNaN(n)) payload.longitud = n; }

      if (!payload.nombre || !payload.direccion || !payload.localidad ||
          !payload.ciudad  || !payload.provincia || !payload.descripcion) {
        throw new Error("Completa nombre, direccion, localidad, ciudad, provincia y descripcion.");
      }

      const created = await createRestaurante(payload);
      if (!payload.latitud || !payload.longitud) {
        try { await regeocodeRestaurante(created.id); } catch { console.warn("Sin geocodificacion automatica"); }
      }
      navigate("/restaurantes");
    } catch (err: any) {
      const status = err?.response?.status;
      const msg    = err?.response?.data?.error || err?.message;
      setError(status === 409 ? "Ya existe un restaurante con ese nombre." : msg ?? "Error al crear restaurante");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800">Nuevo restaurante</h1>
        <button onClick={() => navigate(-1)} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors">
          Volver
        </button>
      </div>

      <form onSubmit={onSubmit} className="rounded-2xl border bg-white p-5 shadow-sm space-y-6">
        {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-xl">{error}</div>}

        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Datos basicos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nombre *"      name="nombre"    value={form.nombre}    onChange={onChange} required />
            <Input label="Direccion *"   name="direccion" value={form.direccion} onChange={onChange} required />
            <Input label="Localidad *"   name="localidad" value={form.localidad} onChange={onChange} required />
            <Input label="Ciudad *"      name="ciudad"    value={form.ciudad}    onChange={onChange} required />
            <Input label="Provincia *"   name="provincia" value={form.provincia} onChange={onChange} required />
            <Input label="Codigo postal" name="codigoPostal" value={form.codigoPostal} onChange={onChange} />
            <Input label="Pais"          name="pais"      value={form.pais}      onChange={onChange} />
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Contacto</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Telefono"  name="telefonoRestaurante" value={form.telefonoRestaurante} onChange={onChange} />
            <Input label="Email"     name="emailRestaurante"    value={form.emailRestaurante}    onChange={onChange} />
            <Input label="Sitio web" name="sitioWeb"            value={form.sitioWeb}            onChange={onChange} />
            <Input label="Horario"   name="horario"             value={form.horario}             onChange={onChange} />
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Descripcion</h2>
          <textarea
            className="w-full rounded-lg border border-gray-200 px-3 py-2 min-h-[100px] text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
            name="descripcion" value={form.descripcion} onChange={onChange} required
          />
        </section>

        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Imagenes</h2>
          <div className="mb-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
            <p className="text-sm font-medium text-blue-800 mb-1">Buscar fotos automaticamente</p>
            <p className="text-xs text-blue-600 mb-3">
              Rellena nombre y ciudad, luego pulsa el boton para cargar fotos reales de Google Places.
              {!GOOGLE_PLACES_API_KEY && (
                <span className="block mt-1 text-amber-600 font-medium">
                  Anade VITE_GOOGLE_PLACES_KEY en dashboard/.env para activar esta funcion.
                </span>
              )}
            </p>
            <button type="button" onClick={handleBuscarFotos}
              disabled={buscarFotos || !GOOGLE_PLACES_API_KEY}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
              {buscarFotos ? (
                <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>Buscando...</>
              ) : (
                <><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                  <circle cx="12" cy="13" r="3"/>
                </svg>Buscar fotos en Google Places</>
              )}
            </button>
            {fotoMsg && <p className={`text-xs mt-2 ${fotoMsg.startsWith("Error") ? "text-red-600" : "text-green-600"}`}>{fotoMsg}</p>}
          </div>

          {imagenesArray.length > 0 && (
            <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
              {imagenesArray.slice(0, 5).map((url, i) => (
                <img key={i} src={url} alt={`Preview ${i + 1}`}
                  className="w-24 h-24 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
              ))}
            </div>
          )}

          <label className="text-sm block">
            <span className="block text-gray-600 mb-1">URLs de imagenes (una por linea)</span>
            <textarea
              className="w-full rounded-lg border border-gray-200 px-3 py-2 min-h-[80px] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-200"
              name="imagenesText" value={form.imagenesText} onChange={onChange}
              placeholder="https://example.com/foto1.jpg"
            />
            <span className="text-xs text-gray-400 mt-1 block">{imagenesArray.length} imagen(es)</span>
          </label>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Coordenadas <span className="font-normal normal-case text-gray-400">(se autocompletan si quedan vacias)</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Latitud"  name="latitud"  value={form.latitud}  onChange={onChange} />
            <Input label="Longitud" name="longitud" value={form.longitud} onChange={onChange} />
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Caracteristicas familiares</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {FLAG_FIELDS.map(key => (
              <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" name={key} checked={flags[key]} onChange={onFlagChange}
                  className="h-4 w-4 accent-orange-500" />
                <span className="text-slate-700">{labelFor(key)}</span>
              </label>
            ))}
          </div>
        </section>

        <div className="flex gap-2 pt-2">
          <button type="submit" disabled={saving}
            className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60">
            {saving ? "Guardando..." : "Crear restaurante"}
          </button>
          <button type="button" onClick={() => navigate("/restaurantes")}
            className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}