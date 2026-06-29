import { useCallback } from "react";
import { apiClient } from "../../api/apiClient";
import { useAuth } from "../auth/AuthContext";
import { useApi } from "../../hooks/useApi";

export function useResultsMasterApi() {
  const { loading, error, run } = useApi();
  const { token } = useAuth();

  const getPage = useCallback(
    (page, size) =>
      run(() => apiClient.get(`/api/results-master?page=${page}&size=${size}`, { token })),
    [run, token]
  );

  return { getPage, loading, error };
}
