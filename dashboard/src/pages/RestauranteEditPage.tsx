// src/pages/RestauranteEditPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getRestauranteById,
  updateRestaurante,
  regeocodeRestaurante,
  type Restaurante,
} from "../services/restauranteService";

const FLAG_FIELDS = [
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
] as const;

type FlagsState = Record<(typeof FLAG_FIELDS)[number], boolean>;

export default function RestauranteEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    nombre: "",
    direccion: "",
    localidad: "",
    ciudad: "",
    provincia: "",
    codigoPostal: "",
    pais: "España",
    telefonoRestaurante: "",
    emailRestaurante: "",
    sitioWeb: "",
    horario: "",
    descripcion: "",
    latitud: "",
    longitud: "",
    imagenesText: "",
  });

  const [flags, setFlags] = useState<FlagsState>(
    () => Object.fromEntries(FLAG_FIELDS.map((k) => [k, false])) as FlagsState
  );

  // Carga inicial
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getRestauranteById(id!);
        if (!mounted) return;

        setForm({
          nombre: data.nombre || "",
          direccion: data.direccion || "",
          localidad: data.localidad || "",
          ciudad: data.ciudad || "",
          provincia: data.provincia || "",
          codigoPostal: data.codigoPostal || "",
          pais: data.pais || "España",
          telefonoRestaurante: data.telefonoRestaurante || "",
          emailRestaurante: data.emailRestaurante || "",
          sitioWeb: data.sitioWeb || "",
          horario: data.horario || "",
          descripcion: data.descripcion || "",
          latitud: data.latitud != null ? String(data.latitud) : "",
          longitud: data.longitud != null ? String(data.longitud) : "",
          imagenesText: Array.isArray(data.imagenes)
            ? data.imagenes.join("\n")
            : "",
        });

        setFlags((prev) => {
          const next = { ...prev };
          for (const k of FLAG_FIELDS) {
            next[k] = Boolean((data as any)[k]);
          }
          return next;
        });
      } catch (e: any) {
        setError(e?.response?.data?.error ?? "Error al cargar restaurante");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const imagenesArray = useMemo(
    () =>
      form.imagenesText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    [form.imagenesText]
  );

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const onFlagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFlags((s) => ({ ...s, [name]: checked }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload: Partial<Restaurante> & Record<string, any> = {
        nombre: form.nombre.trim(),
        direccion: form.direccion.trim(),
        localidad: form.localidad.trim(),
        ciudad: form.ciudad.trim(),
        provincia: form.provincia.trim(),
        codigoPostal: form.codigoPostal.trim() || undefined,
        pais: form.pais.trim() || undefined,
        telefonoRestaurante: form.telefonoRestaurante.trim() || undefined,
        emailRestaurante: form.emailRestaurante.trim() || undefined,
        sitioWeb: form.sitioWeb.trim() || undefined,
        horario: form.horario.trim() || undefined,
        descripcion: form.descripcion.trim(),
        imagenes: imagenesArray,
        ...flags,
      };

      if (form.latitud !== "") {
        const n = Number(form.latitud);
        if (!Number.isNaN(n)) payload.latitud = n;
      }
      if (form.longitud !== "") {
        const n = Number(form.longitud);
        if (!Number.isNaN(n)) payload.longitud = n;
      }

      Object.keys(payload).forEach(
        (k) => payload[k] === undefined && delete payload[k]
      );

      await updateRestaurante(id!, payload);
      navigate("/restaurantes");
    } catch (e: any) {
      const status = e?.response?.status;
      const msg = e?.response?.data?.error ?? "Error al guardar cambios";
      if (status === 409) setError("Ya existe un restaurante con ese nombre.");
      else setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const onRegeo = async () => {
    try {
      await regeocodeRestaurante(id!);
      const data = await getRestauranteById(id!);
      setForm((s) => ({
        ...s,
        latitud: data.latitud != null ? String(data.latitud) : "",
        longitud: data.longitud != null ? String(data.longitud) : "",
      }));
    } catch (e: any) {
      alert(e?.response?.data?.error ?? "Error al re-geocodificar");
    }
  };

  // ⬇️ Este return está DENTRO del componente (ojo a las llaves de arriba)
  if (loading) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-semibold mb-2">Editar restaurante</h1>
        <p>Cargando…</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Editar restaurante</h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(-1)}
            className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50"
          >
            Volver
          </button>
          <button
            onClick={onRegeo}
            className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50"
          >
            Re-geocodificar
          </button>
        </div>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <form
        onSubmit={onSubmit}
        className="rounded-2xl border bg-white p-4 shadow-sm space-y-6"
      >
        {/* Básicos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nombre *"
            name="nombre"
            value={form.nombre}
            onChange={onChange}
            required
          />
          <Input
            label="Dirección *"
            name="direccion"
            value={form.direccion}
            onChange={onChange}
            required
          />
          <Input
            label="Localidad *"
            name="localidad"
            value={form.localidad}
            onChange={onChange}
            required
          />
          <Input
            label="Ciudad *"
            name="ciudad"
            value={form.ciudad}
            onChange={onChange}
            required
          />
          <Input
            label="Provincia *"
            name="provincia"
            value={form.provincia}
            onChange={onChange}
            required
          />
          <Input
            label="Código postal"
            name="codigoPostal"
            value={form.codigoPostal}
            onChange={onChange}
          />
          <Input
            label="País"
            name="pais"
            value={form.pais}
            onChange={onChange}
          />
        </div>

        {/* Contacto */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Teléfono"
            name="telefonoRestaurante"
            value={form.telefonoRestaurante}
            onChange={onChange}
          />
          <Input
            label="Email"
            name="emailRestaurante"
            value={form.emailRestaurante}
            onChange={onChange}
          />
          <Input
            label="Sitio web"
            name="sitioWeb"
            value={form.sitioWeb}
            onChange={onChange}
          />
          <Input
            label="Horario"
            name="horario"
            value={form.horario}
            onChange={onChange}
          />
        </div>

        {/* Descripción */}
        <label className="text-sm block">
          <span className="block text-gray-600 mb-1">Descripción *</span>
          <textarea
            className="w-full rounded-lg border px-3 py-2 min-h-[100px]"
            name="descripcion"
            value={form.descripcion}
            onChange={onChange}
            required
          />
        </label>

        {/* Imágenes */}
        <label className="text-sm block">
          <span className="block text-gray-600 mb-1">
            Imágenes (una URL por línea)
          </span>
          <textarea
            className="w-full rounded-lg border px-3 py-2 min-h-[80px]"
            name="imagenesText"
            value={form.imagenesText}
            onChange={onChange}
          />
          <div className="text-xs text-gray-500 mt-1">
            {imagenesArray.length} imagen(es)
          </div>
        </label>

        {/* Coordenadas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Latitud (opcional)"
            name="latitud"
            value={form.latitud}
            onChange={onChange}
          />
          <Input
            label="Longitud (opcional)"
            name="longitud"
            value={form.longitud}
            onChange={onChange}
          />
        </div>

        {/* Flags */}
        <fieldset className="border rounded-xl p-3">
          <legend className="text-sm font-medium px-1">
            Características familiares
          </legend>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-2">
            {FLAG_FIELDS.map((key) => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name={key}
                  checked={flags[key]}
                  onChange={onFlagChange}
                  className="h-4 w-4"
                />
                <span>{labelFor(key)}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 transition disabled:opacity-60"
          >
            {saving ? "Guardando…" : "Guardar cambios"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/restaurantes")}
            className="rounded-xl border px-4 py-2"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({
  label,
  name,
  value,
  onChange,
  required,
}: {
  label: string;
  name: string;
  value: string;
  required?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="text-sm">
      <span className="block text-gray-600 mb-1">{label}</span>
      <input
        className="w-full rounded-lg border px-3 py-2"
        name={name}
        value={value}
        onChange={onChange}
        required={!!required}
      />
    </label>
  );
}

function labelFor(k: string) {
  const map: Record<string, string> = {
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
  };
  return map[k] || k;
}
