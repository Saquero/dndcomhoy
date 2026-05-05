import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import SiteHeader from "./shared/SiteHeader";
import SplashScreen from "./shared/SplashScreen";
import PublicListPage from "./pages/PublicListPage";
import PublicDetailPage from "./pages/PublicDetailPage";
import SuggestFormPage from "./pages/SuggestFormPage";
import FavoritosPage from "./pages/FavoritosPage";

export default function App() {
  const [showSplash, setShowSplash] = useState(() => {
    return sessionStorage.getItem("dch-splash-seen") !== "true";
  });

  useEffect(() => {
    if (!showSplash) return;

    const timer = window.setTimeout(() => {
      sessionStorage.setItem("dch-splash-seen", "true");
      setShowSplash(false);
    }, 2800);

    return () => window.clearTimeout(timer);
  }, [showSplash]);

  return (
    <>
      <AnimatePresence>
        {showSplash && <SplashScreen />}
      </AnimatePresence>

      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<PublicListPage />} />
            <Route path="/restaurante/:id" element={<PublicDetailPage />} />
            <Route path="/sugerir" element={<SuggestFormPage />} />
            <Route path="/mis-favoritos" element={<FavoritosPage />} />
            <Route path="*" element={
              <div className="max-w-lg mx-auto px-4 py-20 text-center">
                <p className="text-6xl font-black text-stone-200 mb-4">404</p>
                <p className="text-slate-500 mb-6">Esta pagina no existe.</p>
                <a href="/" className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
                  Volver al inicio
                </a>
              </div>
            } />
          </Routes>
        </div>
        <footer className="border-t border-stone-100 bg-white py-6 mt-16">
          <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-stone-400 text-center sm:text-left">
              Donde Comemos Hoy &middot; Hecho por familias, para familias.
            </p>
            <div className="flex items-center gap-4">
              <a href="/mis-favoritos" className="text-xs text-stone-400 hover:text-orange-500 transition-colors">Mis favoritos</a>
              <a href="/sugerir" className="text-xs text-stone-400 hover:text-orange-500 transition-colors">Sugerir restaurante</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
