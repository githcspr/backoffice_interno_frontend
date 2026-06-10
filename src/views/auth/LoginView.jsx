import { useState, useEffect } from "react";
import { useAuthApi } from "../../controller/features/auth/useAuthApi";
import { useAuth } from "../../controller/features/auth/AuthContext";
import { showApiError } from "../../utils/showApiError";
import logoSail from "../../assets/logo_sail.png"

export default function LoginView() {
  const { login, loading, error } = useAuthApi();
  const { setSessionFromLogin } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (error) {
      showApiError(error);
    }
  }, [error]);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const resp = await login(formData);
      setSessionFromLogin(resp);
    } catch {
      // el Swal ya se dispara en el useEffect
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
        <img src={logoSail} alt="" />
        <h1 className="text-xl font-semibold mb-4 text-center">Login</h1>

        <form onSubmit={onSubmit} className="space-y-4">
          <input
            name="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full border rounded px-3 py-2"
            placeholder="email"
          />

          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className="w-full border rounded px-3 py-2"
            placeholder="password"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded disabled:opacity-50"
          >
            {loading ? "Ingresando..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
