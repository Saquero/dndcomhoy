import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { enviarSugerencia } from "../services/sugerenciaService";
import type { SugerenciaPayload } from "../types";

const CARACTERISTICAS = [
  { key: "zonaInfantil",         emoji: "ðŸ›", label: "Zona infantil" },
  { key: "menuInfantil",         emoji: "ðŸ‘¶", label: "Menu infantil" },
  { key: "tronaDisponible",      emoji: "ðŸª‘", label: "Trona disponible" },
  { key: "cambiadorDisponible",  emoji: "ðŸ§·", label: "Cambiador" },
  { key: "sitioParaCarrito",     emoji: "ðŸ›’", label: "Sitio para carrito" },
  { key: "terrazaSegura",        emoji: "â˜€ï¸",  label: "Terraza segura" },
  { key: "parqueCercano",        emoji: "ðŸŒ³", label: "Parque cercano" },
  { key: "actividadesParaNinos", emoji: "ðŸŽ¨", label: "Actividades para ninos" },
  { key: "zonaAmplia",           emoji: "ðŸ ", label: "Zona amplia" },
  { key: "accesibleConCarrito",  emoji: "â™¿", label: "Accesible con carrito" },
  { key: "ambienteFamiliar",     emoji: "ðŸ‘¨â€ðŸ‘©â€ðŸ‘§", label: "Ambiente familiar" },
  { key: "sinPantallas",         emoji: "ðŸ“µ", label: "Sin pantallas" },
  { key: "aptoVegetariano",      emoji: "ðŸ¥¦", label: "Opciones vegetarianas" },
  { key: "aptoVegano",           emoji: "ðŸŒ±", label: "Opciones veganas" },
] as const;

type CheckboxKey = typeof CARACTERISTICAS[number]["key"];

type FormData = {
  nombre: string;
  direccion: string;
  localidad: string;
  ciudad: string;
  provincia: string;
  codigoPostal: string;
  descripcion: string;
  nombreContacto: string;
  emailContacto: string;
  comentarios: string;
};

const INITIAL_FORM: FormData = {
  nombre: "",
  direccion: "",
  localidad: "",
  ciudad: "",
  provincia: "",
  codigoPostal: "",
  descripcion: "",
  nombreContacto: "",
  emailContacto: "",
  comentarios: "",
};

export default function SuggestFormPage() {
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [checks, setChecks] = useState<Partial<Record<CheckboxKey, boolean>>>({});
  const [enviado, setEnviado] = useState(false);

  const mutation = useMutation({
    mutationFn: (payload: SugerenciaPayload) => enviarSugerencia(payload),
    onSuccess: () => {
      setEnviado(true);
      setForm(INITIAL_FORM);
      setChecks({});
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleCheck = (key: CheckboxKey) => {
    setChecks(prev => {
      const next = { ...prev };
      if (next[key]) delete next[key];
      else next[key] = true;
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: SugerenciaPayload = {
      ...form,
      codigoPostal: form.codigoPostal || undefined,
      emailContacto: form.emailContacto || undefined,
      comentarios: form.comentarios || undefined,
      ...checks,
    };
    mutation.mutate(payload);
  };

  if (enviado) {
    return (
      <main className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">ðŸŽ‰</div>
        <h1 className="text-2xl font-extrabold text-slate-800 mb-3">
          iGracias por tu sugerencia!
        </h1>
        <p className="text-slate-500 mb-6">
          Revisaremos el restaurante y, si cumple los criterios, lo anadiremos a la lista.
        </p>
        <Link
          to="/"
          className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
        >
          Volver al listado
        </Link>
      </main>
    );
  }

  const field = (
    name: keyof FormData,
    label: string,
    placeholder: string,
    required = false,
    type = "text"
  ) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label} {required && <span className="text-orange-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={form[name]}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
      />
    </div>
  );

  return (
    <main className="max-w-xl mx-auto px-4 py-10">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-orange-500 mb-6 transition-colors">
        â† Volver
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-800 mb-1">Sugiere un restaurante</h1>
        <p className="text-slate-500 text-sm">
          Si conoces un sitio perfecto para ir con ninos, cuentanoslo. Lo revisamos y, si encaja, lo publicamos.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <section>
          <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wide mb-3">Sobre el restaurante</h2>
          <div className="space-y-4">
            {field("nombre", "Nombre del restaurante", "Ej: La Casita de Maria", true)}
            {field("direccion", "Direccion", "Calle, numero...", true)}
            <div className="grid grid-cols-2 gap-3">
              {field("localidad", "Localidad", "Ej: Getafe", true)}
              {field("ciudad", "Ciudad", "Ej: Madrid", true)}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {field("provincia", "Provincia", "Ej: Madrid", true)}
              {field("codigoPostal", "Codigo postal", "Ej: 28900")}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Descripcion <span className="text-orange-500">*</span>
              </label>
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                placeholder="CuÃ©ntanos por quÃ© es un buen sitio para familias..."
                required
                rows={3}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wide mb-3">Caracteristicas familiares</h2>
          <div className="grid grid-cols-2 gap-2">
            {CARACTERISTICAS.map(({ key, emoji, label }) => {
              const isOn = !!checks[key];
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => toggleCheck(key)}
                  className={`flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-xl border transition-colors text-left ${
                    isOn
                      ? "bg-orange-50 border-orange-300 text-orange-700"
                      : "bg-white border-slate-200 text-slate-600 hover:border-orange-200"
                  }`}
                >
                  <span>{emoji}</span>
                  <span>{label}</span>
                  {isOn && <span className="ml-auto text-orange-500">âœ“</span>}
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wide mb-3">Tus datos</h2>
          <div className="space-y-4">
            {field("nombreContacto", "Tu nombre", "Como te llamas", true)}
            {field("emailContacto", "Tu email (opcional)", "Para avisarte cuando se publique", false, "email")}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Comentarios adicionales</label>
              <textarea
                name="comentarios"
                value={form.comentarios}
                onChange={handleChange}
                placeholder="Cualquier cosa que quieras contarnos..."
                rows={2}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
              />
            </div>
          </div>
        </section>

        {mutation.isError && (
          <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
            âŒ Hubo un error al enviar. Comprueba los datos e intentalo de nuevo.
          </p>
        )}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
        >
          {mutation.isPending ? "Enviando..." : "Enviar sugerencia"}
        </button>
      </form>
    </main>
  );
}
