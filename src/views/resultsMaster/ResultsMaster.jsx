import { useEffect, useState } from "react";
import { useResultsMasterApi } from "../../controller/features/resultsMaster/useResultsMasterApi";

const COLUMNS = [
  ["resultNumberComplete", "Result Number Complete"],
  ["sedingApplication", "Seding Application"],
  ["observationResultLabLicense", "Observation Result Lab License"],
  ["insuranceCompanyId", "Insurance Company ID"],
  ["resultNumberHeader", "Result Number Header"],
  ["observationDate", "Observation Date"],
  ["memberId", "Member ID"],
  ["memberGroupNumber", "Member Group Number"],
  ["docNumber", "Doc Number"],
  ["observationResultSetId", "Observation Result Set ID"],
  ["finalIdetifier", "Final Identifier"],
  ["finalIdetifierText", "Final Identifier Text"],
  ["observationResultIdentifier", "Observation Result Identifier"],
  ["observationResultText", "Observation Result Text"],
  ["motor", "Motor"],
  ["observationResultValue", "Observation Result Value"],
  ["observationResultUnits", "Observation Result Units"],
  ["observationResultRange", "Observation Result Range"],
  ["observationResultAbnormalFlag", "Observation Result Abnormal Flag"],
  ["observationResultResultStatus", "Observation Result Status"],
  ["quantity", "Quantity"],
  ["hl7ControlNumber", "HL7 Control Number"],
  ["observationResultValueType", "Observation Result Value Type"],
  ["observationDate2", "Observation Date 2"],
  ["sendingFacilityLabNpi", "Sending Facility Lab NPI"],
  ["sendingFacilityLabLicense", "Sending Facility Lab License"],
  ["orcDateTransaction", "ORC Date Transaction"],
  ["obrLabName", "OBR Lab Name"],
  ["resultNumber", "Result Number"],
  ["fileNameOnly", "File Name"],
  ["fileErrorFlag", "File Error Flag"],
  ["labLicenseMsh4", "Lab License MSH4"],
  ["orcDateTransaction2", "ORC Date Transaction 2"],
  ["labNpiMsh4", "Lab NPI MSH4"],
  ["cutDate", "Cut Date"],
];

const EMPTY_PAGE = {
  content: [],
  page: 0,
  size: 50,
  totalElements: 0,
  totalPages: 0,
  first: true,
  last: true,
};

export default function ResultsMaster() {
  const { getPage, loading, error } = useResultsMasterApi();
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(50);
  const [pageData, setPageData] = useState(EMPTY_PAGE);

  useEffect(() => {
    let active = true;

    getPage(page, size)
      .then((data) => {
        if (active) setPageData(data);
      })
      .catch(() => {
        if (active) setPageData({ ...EMPTY_PAGE, page, size });
      });

    return () => {
      active = false;
    };
  }, [getPage, page, size]);

  const firstRecord = pageData.totalElements === 0 ? 0 : pageData.page * pageData.size + 1;
  const lastRecord = Math.min((pageData.page + 1) * pageData.size, pageData.totalElements);

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Results Master</h1>
          <p className="text-sm text-gray-500">
            {firstRecord.toLocaleString()}-{lastRecord.toLocaleString()} de{" "}
            {pageData.totalElements.toLocaleString()} registros
          </p>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          Filas
          <select
            value={size}
            onChange={(event) => {
              setSize(Number(event.target.value));
              setPage(0);
            }}
            className="rounded border bg-white px-2 py-1.5"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error.message}</p>}

      <div className="min-h-0 flex-1 overflow-auto border bg-white">
        <table className="min-w-max border-collapse text-xs">
          <thead className="sticky top-0 z-10 bg-gray-100 text-left">
            <tr>
              {COLUMNS.map(([key, label]) => (
                <th
                  key={key}
                  className="whitespace-nowrap border-b border-r px-2 py-2 font-semibold text-gray-700"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.content.map((result) => (
              <tr key={result.resultNumberComplete} className="even:bg-gray-50 hover:bg-blue-50">
                {COLUMNS.map(([key]) => {
                  const value = result[key] ?? "";
                  return (
                    <td
                      key={key}
                      title={String(value)}
                      className="max-w-72 truncate whitespace-nowrap border-b border-r px-2 py-1.5 text-gray-800"
                    >
                      {value}
                    </td>
                  );
                })}
              </tr>
            ))}

            {!loading && pageData.content.length === 0 && (
              <tr>
                <td className="px-3 py-6 text-center text-gray-500" colSpan={COLUMNS.length}>
                  No hay registros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-gray-600">
          Pagina {pageData.totalPages === 0 ? 0 : pageData.page + 1} de {pageData.totalPages}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(current - 1, 0))}
            disabled={loading || pageData.first}
            className="rounded border bg-white px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Anterior
          </button>
          <button
            type="button"
            onClick={() => setPage((current) => current + 1)}
            disabled={loading || pageData.last}
            className="rounded border bg-white px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
