import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { enviarSugerencia } from "../services/sugerenciaService";
import type { SugerenciaPayload } from "../types";

const CARACTERISTICAS = [
  { key: "zonaInfantil",         label: "Zona infantil" },
  { key: "menuInfantil",         label: "Menu infantil" },
  { key: "tronaDisponible",      label: "Trona disponible" },
  { key: "cambiadorDisponible",  label: "Cambiador" },
  { key: "sitioParaCarrito",     label: "Sitio para carrito" },
  { key: "terrazaSegura",        label: "Terraza segura" },
  { key: "parqueCercano",        label: "Parque cercano" },
  { key: "actividadesParaNinos", label: "Actividades para ninos" },
  { key: "zonaAmplia",           label: "Zona amplia" },
  { key: "accesibleConCarrito",  label: "Accesible con carrito" },
  { key: "sinPantallas",         label: "Sin pantallas" },
  { key: "ambienteFamiliar",     label: "Ambiente familiar" },
  { key: "aptoVegetariano",      label: "Opciones vegetarianas" },
  { key: "aptoVegano",           label: "Opciones veganas" },
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
  nombre: "", direccion: "", localidad: "", ciudad: "",
  provincia: "", codigoPostal: "", descripcion: "",
  nombreContacto: "", emailContacto: "", comentarios: "",
};

function IconCheck({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function SuggestFormPage() {
  const [form, setForm]       = useState<FormData>(INITIAL_FORM);
  const [checks, setChecks]   = useState<Partial<Record<CheckboxKey, boolean>>>({});
  const [enviado, setEnviado] = useState(false);

  const mutation = useMutation({
    mutationFn: (payload: SugerenciaPayload) => enviarSugerencia(payload),
    onSuccess: () => { setEnviado(true); setForm(INITIAL_FORM); setChecks({}); },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const toggleCheck = (key: CheckboxKey) =>
    setChecks(prev => { const n = { ...prev }; if (n[key]) delete n[key]; else n[key] = true; return n; });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      ...form,
      codigoPostal:  form.codigoPostal  || undefined,
      emailContacto: form.emailContacto || undefined,
      comentarios:   form.comentarios   || undefined,
      ...checks,
    });
  };

  if (enviado) {
    return (
      <main className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-800 mb-3">Gracias por tu sugerencia</h1>
        <p className="text-slate-500 mb-6 leading-relaxed">
          Lo revisaremos y, si encaja, lo compartiremos con otras familias.
        </p>
        <Link to="/" className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors">
          Volver al listado
        </Link>
      </main>
    );
  }

  const field = (name: keyof FormData, label: string, placeholder: string, required = false, type = "text") => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label} {required && <span className="text-orange-500">*</span>}
      </label>
      <input
        type={type} name={name} value={form[name]} onChange={handleChange}
        placeholder={placeholder} required={required}
        className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 placeholder:text-stone-400"
      />
    </div>
  );

  return (
    <main className="max-w-xl mx-auto px-4 py-10">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-orange-500 mb-6 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Volver
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-800 mb-2">Sugiere un restaurante</h1>
        <p className="text-stone-500 text-sm leading-relaxed">
          Cuentanos ese sitio donde comiste tranquilo mientras los peques estaban a gusto.
          Lo revisaremos y, si encaja, lo compartiremos con otras familias.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section>
          <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide mb-3">Sobre el restaurante</h2>
          <div className="space-y-4">
            {field("nombre",    "Nombre del restaurante", "El Rincon de Maria",  true)}
            {field("direccion", "Direccion",              "Calle Mayor, 12",     true)}
            <div className="grid grid-cols-2 gap-3">
              {field("localidad", "Localidad", "Getafe", true)}
              {field("ciudad",    "Ciudad",    "Madrid",  true)}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {field("provincia",    "Provincia",     "Madrid", true)}
              {field("codigoPostal", "Codigo postal", "28900")}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Descripcion <span className="text-orange-500">*</span>
              </label>
              <textarea
                name="descripcion" value={form.descripcion} onChange={handleChange}
                placeholder="Cuentanos por que es un buen sitio para familias con ninos..."
                required rows={3}
                className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none placeholder:text-stone-400"
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide mb-1">Caracteristicas familiares</h2>
          <p className="text-xs text-stone-400 mb-3">Marca las que conozcas</p>
          <div className="grid grid-cols-2 gap-2">
            {CARACTERISTICAS.map(({ key, label }) => {
              const isOn = !!checks[key];
              return (
                <button
                  type="button" key={key} onClick={() => toggleCheck(key)}
                  className={`flex items-center gap-2 text-xs font-medium px-3 py-2.5 rounded-xl border transition-all text-left ${
                    isOn ? "bg-orange-50 border-orange-300 text-orange-700"
                         : "bg-white border-stone-200 text-slate-600 hover:border-orange-200"
                  }`}
                >
                  <span className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-colors ${
                    isOn ? "bg-orange-500 text-white" : "border border-stone-300"
                  }`}>
                    <IconCheck active={isOn} />
                  </span>
                  {label}
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide mb-3">Tus datos</h2>
          <div className="space-y-4">
            {field("nombreContacto", "Tu nombre",           "Como te llamas",                   true)}
            {field("emailContacto",  "Tu email (opcional)", "Para avisarte cuando se publique",  false, "email")}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Comentarios adicionales</label>
              <textarea
                name="comentarios" value={form.comentarios} onChange={handleChange}
                placeholder="Cualquier cosa que quieras anadir..." rows={2}
                className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none placeholder:text-stone-400"
              />
            </div>
          </div>
        </section>

        {mutation.isError && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
            Hubo un error al enviar. Comprueba los datos e intentalo de nuevo.
          </div>
        )}

        <button type="submit" disabled={mutation.isPending}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
          {mutation.isPending ? "Enviando..." : "Enviar sugerencia"}
        </button>
      </form>
    </main>
  );
}