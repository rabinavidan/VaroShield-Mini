import { useEffect, useRef, useState } from "react";
import { api, DashboardSummary } from "../api/client";
import StatCard from "../components/StatCard";

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [jobId, setJobId] = useState("");
  const [scanStatus, setScanStatus] = useState("");
  const [error, setError] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function loadSummary() {
    try {
      const result = await api.getDashboardSummary();
      setSummary(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load summary");
    }
  }

  useEffect(() => {
    loadSummary();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  async function startScan() {
    setError("");
    try {
      const job = await api.startScan();
      setJobId(job.job_id);
      setScanStatus(job.status);

      pollRef.current = setInterval(async () => {
        const status = await api.getScanStatus(job.job_id);
        setScanStatus(status.status);
        if (status.status === "done" || status.status === "failed") {
          if (pollRef.current) clearInterval(pollRef.current);
          loadSummary();
        }
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start scan");
    }
  }

  return (
    <div className="page">
      <h1>Dashboard</h1>
      {error && <p className="error">{error}</p>}
      {summary && (
        <div className="card-grid">
          <StatCard label="Total Files" value={summary.total_files} testId="dashboard-total-files" />
          <StatCard label="Sensitive Files" value={summary.sensitive_files} testId="dashboard-sensitive-files" />
          <StatCard label="Public Files" value={summary.public_files} testId="dashboard-public-files" />
          <StatCard label="High Risks" value={summary.high_risks} testId="dashboard-high-risks" />
          <StatCard label="Open Alerts" value={summary.open_alerts} testId="dashboard-open-alerts" />
        </div>
      )}
      <button data-testid="start-scan-button" onClick={startScan}>
        Start Scan
      </button>
      {jobId && (
        <p data-testid="scan-status">
          Job {jobId}: {scanStatus}
        </p>
      )}
    </div>
  );
}
