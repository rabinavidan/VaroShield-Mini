import { useEffect, useState } from "react";
import { api, RiskAlert } from "../api/client";
import Pagination from "../components/Pagination";

const PAGE_SIZE = 8;

// The only values risk_service.py ever produces — kept static (not derived
// from the loaded list) so the filters are always immediately selectable,
// instead of appearing only after the async fetch resolves.
const SEVERITIES = ["high", "low"];
const STATUSES = ["open"];

export default function RisksPage() {
  const [risks, setRisks] = useState<RiskAlert[]>([]);
  const [severity, setSeverity] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");

  async function loadRisks() {
    try {
      const result = await api.getRisks();
      setRisks(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load risks");
    }
  }

  useEffect(() => {
    loadRisks();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [severity, status]);

  const filteredRisks = risks
    .filter((r) => !severity || r.severity === severity)
    .filter((r) => !status || r.status === status)
    .sort((a, b) => b.id - a.id);

  const pageCount = Math.max(1, Math.ceil(filteredRisks.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pagedRisks = filteredRisks.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Risks</h1>
          <p>Every open alert, with the rule that raised it.</p>
        </div>
      </div>
      {error && <p className="error">{error}</p>}

      <div className="filter-bar">
        <label>
          Severity
          <select data-testid="severity-filter" value={severity} onChange={(e) => setSeverity(e.target.value)}>
            <option value="">All severities</option>
            {SEVERITIES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label>
          Status
          <select data-testid="status-filter" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>

      <table data-testid="risks-table">
        <thead>
          <tr>
            <th>File ID</th>
            <th>Severity</th>
            <th>Reason</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {pagedRisks.map((risk) => (
            <tr key={risk.id}>
              <td>{risk.file_id}</td>
              <td>
                <span className={`badge badge-severity-${risk.severity}`}>{risk.severity}</span>
              </td>
              <td>{risk.reason}</td>
              <td>
                <span className={`badge badge-status-${risk.status}`}>{risk.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Pagination
        page={currentPage}
        pageCount={pageCount}
        totalItems={filteredRisks.length}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
    </div>
  );
}
