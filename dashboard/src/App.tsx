// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./components/DashboardLayout";
import HomePage from "./pages/HomePage";
import RestaurantesPage from "./pages/RestaurantesPage";
import SugerenciasPage from "./pages/SugerenciasPage";
import LoginPage from "./pages/LoginPage";
import PrivateRoute from "./components/PrivateRoute";
import RestauranteForm from "./pages/RestauranteForm"; // ⬅️ crear
import RestauranteEditPage from "./pages/RestauranteEditPage"; // ⬅️ crear
import "./app.css";

export default function App() {
  return (
    <Routes>
      {/* Pública */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protegidas */}
      <Route element={<PrivateRoute />}>
        <Route element={<DashboardLayout />}>
          {/* "/" */}
          <Route index element={<HomePage />} />

          {/* "/restaurantes" */}
          <Route path="/restaurantes" element={<RestaurantesPage />} />

          {/* Crear */}
          <Route path="/restaurantes/nuevo" element={<RestauranteForm />} />

          {/* Editar */}
          <Route
            path="/restaurantes/:id/editar"
            element={<RestauranteEditPage />}
          />

          {/* "/sugerencias" */}
          <Route path="/sugerencias" element={<SugerenciasPage />} />
        </Route>
      </Route>

      {/* comodín: cualquier otra cosa va a "/" */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
