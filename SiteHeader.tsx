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
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center shadow-sm group-hover:bg-orange-600 transition-colors flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="2.5" fill="white" stroke="none"/>
            </svg>
          </div>
          <div className="leading-tight">
            <p className="font-bold text-slate-800 text-[15px]">Donde Comemos Hoy</p>
            <p className="text-[10px] text-stone-400 hidden sm:block">Para familias con ninos</p>
          </div>
        </Link>

        <nav className="flex items-center gap-1">
          <Link to="/"
            className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
              active("/") ? "text-orange-600 bg-orange-50" : "text-slate-500 hover:text-slate-800 hover:bg-stone-100"
            }`}>
            Restaurantes
          </Link>
          <Link to="/mis-favoritos"
            className={`relative text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
              active("/mis-favoritos") ? "text-orange-600 bg-orange-50" : "text-slate-500 hover:text-slate-800 hover:bg-stone-100"
            }`}>
            Favoritos
            {favCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {favCount > 9 ? "9+" : favCount}
              </span>
            )}
          </Link>
          <Link to="/sugerir"
            className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
              active("/sugerir") ? "text-orange-600 bg-orange-50" : "text-slate-500 hover:text-slate-800 hover:bg-stone-100"
            }`}>
            Sugerir
          </Link>
        </nav>
      </div>
    </header>
  );
}
