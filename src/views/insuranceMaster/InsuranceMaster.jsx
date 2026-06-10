import { useEffect, useState } from "react";
import { useInsuranceMasterApi } from "../../controller/features/insuranceMaster/useInsuranceMasterApi";
import { showApiError } from "../../utils/showApiError";

const InsuranceMaster = () => {
  const { getAll, getAllWithConfigs, createBillingConfig, loading, error } =
    useInsuranceMasterApi();
  const [insuranceRows, setInsuranceRows] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [configForm, setConfigForm] = useState({
    billingModel: "",
    cost: "",
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
      billingModel: "",
      cost: "",
      cap: "",
      percentage: "",
    });
  };

  const closeConfigForm = () => {
    setSelectedCompany(null);
  };

  const onConfigFormChange = (event) => {
    const { name, value } = event.target;
    setConfigForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const onSubmitConfig = async (event) => {
    event.preventDefault();
    if (!selectedCompany) return;

    try {
      const createdConfig = await createBillingConfig({
        insuranceCompanyId: selectedCompany.insuranceCompanyId,
        billingModel: configForm.billingModel,
        cost: Number(configForm.cost),
        cap: configForm.cap === "" ? null : Number(configForm.cap),
        percentage: Number(configForm.percentage),
      });

      setInsuranceRows((currentRows) =>
        currentRows.map((row) =>
          row.insuranceCompanyId === createdConfig.insuranceCompanyId
            ? { ...row, config: createdConfig }
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
                    <td className="px-3 py-2">{row.config.cost}</td>
                    <td className="px-3 py-2">{row.config.cap ?? ""}</td>
                    <td className="px-3 py-2">{row.config.percentage}</td>
                  </>
                ) : (
                  <td className="px-3 py-2 text-amber-700" colSpan={4}>
                    Falta agregar el registro de configuración
                  </td>
                )}
                <td className="px-3 py-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!row.config) openConfigForm(row);
                    }}
                    className="rounded bg-black px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
                  >
                    {row.config ? "Editar" : "Configurar"}
                  </button>
                </td>
              </tr>
            ))}
            {!loading && insuranceRows.length === 0 && !error && (
              <tr>
                <td className="px-3 py-4 text-gray-500" colSpan={7}>
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
              <h2 className="text-lg font-semibold">Configurar seguro</h2>
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

              <label className="block text-sm">
                <span className="mb-1 block font-medium text-gray-700">Tope</span>
                <input
                  type="number"
                  step="0.000001"
                  name="cap"
                  value={configForm.cap}
                  onChange={onConfigFormChange}
                  className="w-full rounded border px-3 py-2"
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
                  Guardar
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
