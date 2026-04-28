import { NavLink } from "react-router-dom";
import clsx from "clsx";

const linkCls = ({ isActive }: { isActive: boolean }) =>
  clsx(
    "block px-3 py-2 rounded-lg text-sm",
    isActive ? "bg-gray-200 font-medium" : "text-gray-700 hover:bg-gray-100"
  );

export default function Sidebar() {
  return (
    <aside className="w-64 border-r bg-white p-3">
      <nav className="space-y-1">
        <NavLink to="/" className={linkCls} end>
          Inicio
        </NavLink>
        <NavLink to="/restaurantes" className={linkCls}>
          Restaurantes
        </NavLink>
        <NavLink to="/sugerencias" className={linkCls}>
          Sugerencias
        </NavLink>
      </nav>
    </aside>
  );
}
