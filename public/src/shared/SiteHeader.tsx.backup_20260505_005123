import { Link, useLocation } from "react-router-dom";

export default function SiteHeader() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-orange-100 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:bg-orange-600 transition-colors">
            <span className="text-[11px] font-black tracking-tight text-white">
              DCH
            </span>
          </div>

          <div className="leading-tight">
            <p className="font-bold text-slate-800 text-sm sm:text-[15px]">
              Dónde Comemos Hoy
            </p>
            <p className="text-[10px] text-stone-500 hidden sm:block">
              Hecho por familias, para familias
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            to="/"
            className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
              isActive("/")
                ? "text-orange-700 bg-orange-50"
                : "text-slate-500 hover:text-slate-800 hover:bg-stone-100"
            }`}
          >
            Restaurantes
          </Link>

          <Link
            to="/sugerir"
            className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
              isActive("/sugerir")
                ? "text-orange-700 bg-orange-50"
                : "text-slate-500 hover:text-slate-800 hover:bg-stone-100"
            }`}
          >
            Sugerir
          </Link>
        </nav>
      </div>
    </header>
  );
}
