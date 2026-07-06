import { useEffect, useRef, useState } from "react";
import { api, DashboardSummary, FileItem, RiskAlert } from "../api/client";
import PostureBreakdown from "../components/PostureBreakdown";
import ScanConsole from "../components/ScanConsole";
import StatCard from "../components/StatCard";

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [risks, setRisks] = useState<RiskAlert[]>([]);
  const [jobId, setJobId] = useState("");
  const [scanStatus, setScanStatus] = useState("");
  const [scanSummary, setScanSummary] = useState<{ scanned_files: number; sensitive_files: number } | undefined>(
    undefined
  );
  const [error, setError] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function loadDashboard() {
    try {
      const [summaryResult, filesResult, risksResult] = await Promise.all([
        api.getDashboardSummary(),
        api.getFiles(),
        api.getRisks(),
      ]);
      setSummary(summaryResult);
      setFiles(filesResult);
      setRisks(risksResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    }
  }

  useEffect(() => {
    loadDashboard();
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
      setScanSummary(undefined);

      pollRef.current = setInterval(async () => {
        const status = await api.getScanStatus(job.job_id);
        setScanStatus(status.status);
        setScanSummary(status.summary);
        if (status.status === "done" || status.status === "failed") {
          if (pollRef.current) clearInterval(pollRef.current);
          loadDashboard();
        }
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start scan");
    }
  }

  const fileCounts = {
    sensitive: files.filter((f) => f.classification === "sensitive").length,
    nonSensitive: files.filter((f) => f.classification === "non_sensitive").length,
    unknown: files.filter((f) => f.classification === "unknown").length,
  };

  const openRisks = risks.filter((r) => r.status === "open");
  const riskCounts = {
    high: openRisks.filter((r) => r.severity === "high").length,
    low: openRisks.filter((r) => r.severity === "low").length,
  };

  const scanInFlight = jobId !== "" && scanStatus !== "done" && scanStatus !== "failed";

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Dashboard</h1>
          <p>Live posture across every file, permission, and scan.</p>
        </div>
        <button data-testid="start-scan-button" onClick={startScan} disabled={scanInFlight}>
          {scanInFlight ? "Scanning…" : "Start Scan"}
        </button>
      </div>
      {error && <p className="error">{error}</p>}
      {summary && (
        <div className="card-grid">
          <StatCard label="Total Files" value={summary.total_files} testId="dashboard-total-files" />
          <StatCard label="Sensitive Files" value={summary.sensitive_files} testId="dashboard-sensitive-files" />
          <StatCard
            label="Public Files"
            value={summary.public_files}
            testId="dashboard-public-files"
            tone={summary.public_files > 0 ? "warning" : "default"}
          />
          <StatCard
            label="High Risks"
            value={summary.high_risks}
            testId="dashboard-high-risks"
            tone={summary.high_risks > 0 ? "critical" : "default"}
          />
          <StatCard
            label="Open Alerts"
            value={summary.open_alerts}
            testId="dashboard-open-alerts"
            tone={summary.open_alerts > 0 ? "critical" : "default"}
          />
        </div>
      )}

      <PostureBreakdown fileCounts={fileCounts} riskCounts={riskCounts} />

      {jobId && <ScanConsole jobId={jobId} status={scanStatus} summary={scanSummary} />}
    </div>
  );
}
