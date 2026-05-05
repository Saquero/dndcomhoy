import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { getFavorites } from "../utils/favorites";

export default function SiteHeader() {
  const location = useLocation();
  const active = (path: string) => location.pathname === path;
  const [favCount, setFavCount] = useState(0);

  useEffect(() => {
    setFavCount(getFavorites().length);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-stone-100 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* LOGO + NOMBRE */}
        <Link to="/" className="flex items-center gap-3 group">
          {/* LOGO (TU PNG) */}
          <img
            src="/logo-dch-horizontal.png"
            alt="Dónde Comemos Hoy"
            className="h-12 sm:h-14 w-auto object-contain"
          />

          {/* TEXTO (por si en móvil quieres fallback o quitarlo luego) */}
          <div className="leading-tight hidden sm:block">
            <p className="font-bold text-slate-800 text-[15px]">
              Dónde Comemos Hoy
            </p>
            <p className="text-[10px] text-stone-400">
              Para familias con niños
            </p>
          </div>
        </Link>

        {/* NAV */}
        <nav className="flex items-center gap-1">
          <Link
            to="/"
            className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
              active("/")
                ? "text-orange-600 bg-orange-50"
                : "text-slate-500 hover:text-slate-800 hover:bg-stone-100"
            }`}
          >
            Restaurantes
          </Link>

          <Link
            to="/mis-favoritos"
            className={`relative text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
              active("/mis-favoritos")
                ? "text-orange-600 bg-orange-50"
                : "text-slate-500 hover:text-slate-800 hover:bg-stone-100"
            }`}
          >
            Favoritos
            {favCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {favCount > 9 ? "9+" : favCount}
              </span>
            )}
          </Link>

          <Link
            to="/sugerir"
            className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
              active("/sugerir")
                ? "text-orange-600 bg-orange-50"
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
