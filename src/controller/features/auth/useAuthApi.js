import { apiClient } from "../../api/apiClient";
import { useApi } from "../../hooks/useApi";

export function useAuthApi() {
  const { loading, error, run } = useApi();

  const login = (credentials) =>
    run(() => apiClient.post("/auth/login", credentials));

  //registro:
  const register = (payload) =>
    run(() => apiClient.post("/auth/register", payload));

  return { login, register, loading, error };
}
