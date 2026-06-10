// features/insuranceMaster/useInsuranceMasterApi.js

import { useCallback } from "react";
import { apiClient } from "../../api/apiClient";
import { useAuth } from "../auth/AuthContext";
import { useApi } from "../../hooks/useApi";

export function useInsuranceMasterApi() {
  const { loading, error, run } = useApi();
  const { token } = useAuth();

  const getAll = useCallback(
    () => run(() => apiClient.get("/api/insurance-master", { token })),
    [run, token]
  );

  const getById = useCallback(
    (id) => run(() => apiClient.get(`/api/insurance-master/${id}`, { token })),
    [run, token]
  );

  const getAllWithConfigs = useCallback(
    () => run(() => apiClient.get("/api/insurance-master/billing-configs", { token })),
    [run, token]
  );

  const createBillingConfig = useCallback(
    (payload) => run(() => apiClient.post("/api/insurance-master/billing-configs", payload, { token })),
    [run, token]
  );

  const updateBillingConfig = useCallback(
    (insuranceCompanyId, payload) =>
      run(() => apiClient.put(`/api/insurance-master/billing-configs/${insuranceCompanyId}`, payload, { token })),
    [run, token]
  );

  return {
    getAll,
    getById,
    getAllWithConfigs,
    createBillingConfig,
    updateBillingConfig,
    loading,
    error
  };
}
