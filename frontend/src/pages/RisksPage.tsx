import { useEffect, useState } from "react";
import { api, RiskAlert } from "../api/client";

export default function RisksPage() {
  const [risks, setRisks] = useState<RiskAlert[]>([]);
  const [severity, setSeverity] = useState("");
  const [error, setError] = useState("");

  async function loadRisks() {
    try {
      const result = await api.getRisks(severity || undefined);
      setRisks(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load risks");
    }
  }

  useEffect(() => {
    loadRisks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [severity]);

  return (
    <div className="page">
      <h1>Risks</h1>
      {error && <p className="error">{error}</p>}
      <select
        data-testid="severity-filter"
        value={severity}
        onChange={(e) => setSeverity(e.target.value)}
      >
        <option value="">All severities</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>

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
          {risks.map((risk) => (
            <tr key={risk.id}>
              <td>{risk.file_id}</td>
              <td className={`severity-${risk.severity}`}>{risk.severity}</td>
              <td>{risk.reason}</td>
              <td>{risk.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
