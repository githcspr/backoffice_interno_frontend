import { useEffect, useState } from "react";
import { useInsuranceMasterApi } from "../../controller/features/insuranceMaster/useInsuranceMasterApi";
import { showApiError } from "../../utils/showApiError";

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function formatCurrency(value) {
  if (value === null || value === undefined || value === "") return "";
  return usdFormatter.format(Number(value));
}

function formatPercentage(value) {
  if (value === null || value === undefined || value === "") return "";
  return `${Number(value).toFixed(2)}%`;
}

const InsuranceMaster = () => {
  const { getAll, getAllWithConfigs, createBillingConfig, updateBillingConfig, loading, error } =
    useInsuranceMasterApi();
  const [insuranceRows, setInsuranceRows] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [configForm, setConfigForm] = useState({
    billingModel: "",
    cost: "",
    aplicaTope: false,
    cap: "",
    percentage: "",
  });

  useEffect(() => {
    Promise.all([getAll(), getAllWithConfigs()])
      .then(([companiesData, configsData]) => {
        const companies = Array.isArray(companiesData) ? companiesData : [];
        const configs = Array.isArray(configsData) ? configsData : [];
        const configsByCompanyId = new Map(
          configs.map((config) => [config.insuranceCompanyId, config])
        );

        setInsuranceRows(
          companies.map((company) => ({
            ...company,
            config: configsByCompanyId.get(company.insuranceCompanyId) ?? null,
          }))
        );
      })
      .catch(() => {
        setInsuranceRows([]);
      });
  }, [getAll, getAllWithConfigs]);

  const openConfigForm = (row) => {
    setSelectedCompany(row);
    setConfigForm({
      billingModel: row.config?.billingModel ?? "",
      cost: row.config?.cost ?? "",
      aplicaTope: Boolean(row.config?.aplicaTope),
      cap: row.config?.cap ?? "",
      percentage: row.config?.percentage ?? "",
    });
  };

  const closeConfigForm = () => {
    setSelectedCompany(null);
  };

  const onConfigFormChange = (event) => {
    const { name, type, checked, value } = event.target;
    setConfigForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "aplicaTope" && !checked ? { cap: "" } : {}),
    }));
  };

  const onSubmitConfig = async (event) => {
    event.preventDefault();
    if (!selectedCompany) return;

    try {
      const payload = {
        insuranceCompanyId: selectedCompany.insuranceCompanyId,
        billingModel: configForm.billingModel,
        cost: Number(configForm.cost),
        aplicaTope: configForm.aplicaTope,
        cap: configForm.aplicaTope && configForm.cap !== "" ? Number(configForm.cap) : null,
        percentage: Number(configForm.percentage),
      };

      const savedConfig = selectedCompany.config
        ? await updateBillingConfig(selectedCompany.insuranceCompanyId, payload)
        : await createBillingConfig(payload);

      setInsuranceRows((currentRows) =>
        currentRows.map((row) =>
          row.insuranceCompanyId === savedConfig.insuranceCompanyId
            ? { ...row, config: savedConfig }
            : row
        )
      );
      closeConfigForm();
    } catch (e) {
      showApiError(e);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Insurance Master</h1>

      {loading && <p className="text-sm text-gray-500">Cargando...</p>}
      {error && <p className="text-sm text-red-600">{error.message}</p>}

      <div className="overflow-x-auto rounded border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-3 py-2 font-semibold">ID</th>
              <th className="px-3 py-2 font-semibold">Nombre</th>
              <th className="px-3 py-2 font-semibold">Modelo de Cobro</th>
              <th className="px-3 py-2 font-semibold">Costo</th>
              <th className="px-3 py-2 font-semibold">Aplica Tope</th>
              <th className="px-3 py-2 font-semibold">Tope</th>
              <th className="px-3 py-2 font-semibold">Porcentaje</th>
              <th className="px-3 py-2 font-semibold">Acción</th>
            </tr>
          </thead>
          <tbody>
            {insuranceRows.map((row) => (
              <tr key={row.insuranceCompanyId} className="border-t">
                <td className="px-3 py-2">{row.insuranceCompanyId}</td>
                <td className="px-3 py-2">{row.insuranceName}</td>
                {row.config ? (
                  <>
                    <td className="px-3 py-2">{row.config.billingModel}</td>
                    <td className="px-3 py-2">{formatCurrency(row.config.cost)}</td>
                    <td className="px-3 py-2">{row.config.aplicaTope ? "Sí" : "No"}</td>
                    <td className="px-3 py-2">
                      {row.config.aplicaTope ? formatCurrency(row.config.cap) : "N/A"}
                    </td>
                    <td className="px-3 py-2">{formatPercentage(row.config.percentage)}</td>
                  </>
                ) : (
                  <td className="px-3 py-2 text-amber-700" colSpan={5}>
                    Falta agregar el registro de configuración
                  </td>
                )}
                <td className="px-3 py-2">
                  <button
                    type="button"
                    onClick={() => openConfigForm(row)}
                    className="rounded bg-black px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
                  >
                    {row.config ? "Editar" : "Configurar"}
                  </button>
                </td>
              </tr>
            ))}
            {!loading && insuranceRows.length === 0 && !error && (
              <tr>
                <td className="px-3 py-4 text-gray-500" colSpan={8}>
                  No hay registros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedCompany && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded bg-white p-5 shadow-lg">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">
                {selectedCompany.config ? "Editar configuración" : "Configurar seguro"}
              </h2>
              <p className="text-sm text-gray-500">
                {selectedCompany.insuranceCompanyId} - {selectedCompany.insuranceName}
              </p>
            </div>

            <form onSubmit={onSubmitConfig} className="space-y-3">
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-gray-700">Modelo de Cobro</span>
                <select
                  name="billingModel"
                  value={configForm.billingModel}
                  onChange={onConfigFormChange}
                  className="w-full rounded border px-3 py-2"
                  required
                >
                  <option value="">Seleccionar</option>
                  <option value="ENCUENTRO">ENCUENTRO</option>
                  <option value="PMPM">PMPM</option>
                </select>
              </label>

              <label className="block text-sm">
                <span className="mb-1 block font-medium text-gray-700">Costo</span>
                <input
                  type="number"
                  step="0.000001"
                  name="cost"
                  value={configForm.cost}
                  onChange={onConfigFormChange}
                  className="w-full rounded border px-3 py-2"
                  required
                />
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="aplicaTope"
                  checked={configForm.aplicaTope}
                  onChange={onConfigFormChange}
                  className="h-4 w-4"
                />
                <span className="font-medium text-gray-700">Aplica tope</span>
              </label>

              <label className="block text-sm">
                <span className="mb-1 block font-medium text-gray-700">Tope</span>
                <input
                  type="number"
                  step="0.000001"
                  name="cap"
                  value={configForm.cap}
                  onChange={onConfigFormChange}
                  className="w-full rounded border px-3 py-2"
                  disabled={!configForm.aplicaTope}
                  required={configForm.aplicaTope}
                />
              </label>

              <label className="block text-sm">
                <span className="mb-1 block font-medium text-gray-700">Porcentaje</span>
                <input
                  type="number"
                  step="0.000001"
                  name="percentage"
                  value={configForm.percentage}
                  onChange={onConfigFormChange}
                  className="w-full rounded border px-3 py-2"
                  required
                />
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeConfigForm}
                  className="rounded border px-4 py-2 text-sm hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                >
                  {selectedCompany.config ? "Actualizar" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InsuranceMaster;
