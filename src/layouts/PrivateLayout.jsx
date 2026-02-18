import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "../controller/features/auth/AuthContext";

const PrivateLayout = () => {
  const { logout } = useAuth();

  const linkClass = ({ isActive }) =>
    `block px-3 py-2 rounded ${
      isActive ? "bg-orange-200 font-semibold" : "hover:bg-gray-100"
    }`;

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-white p-4 flex flex-col">
        <div className="mb-6">
          <div className="text-xl font-bold">Mi Cuentas</div>
          <div className="text-xs text-gray-500">Panel</div>
        </div>

        <nav className="space-y-1 flex-1">
          <NavLink to="/home" className={linkClass}>
            Home
          </NavLink>
          
           <NavLink to="/perfil" className={linkClass}>Perfil</NavLink> 
        </nav>

        <button
          onClick={logout}
          className="mt-4 w-full bg-black text-white py-2 rounded hover:opacity-90"
        >
          Logout
        </button>
      </aside>

      {/* Contenido que cambia */}
      <main className="flex-1 bg-gray-50 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default PrivateLayout;
