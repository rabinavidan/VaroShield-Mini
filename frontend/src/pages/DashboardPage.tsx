import { useEffect, useRef, useState } from "react";
import { api, DashboardSummary, FileItem, RiskAlert } from "../api/client";
import FileScanProgress from "../components/FileScanProgress";
import PostureBreakdown from "../components/PostureBreakdown";
import ScanConsole from "../components/ScanConsole";
import StatCard from "../components/StatCard";
import { createDemoFiles } from "../utils/demoData";

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
  const [creatingFiles, setCreatingFiles] = useState(false);
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
      // Each scan also drops in a fresh batch of demo records so the run
      // visibly grows the dataset instead of just re-classifying the same files.
      setCreatingFiles(true);
      const newFiles = await createDemoFiles();
      const newIds = new Set(newFiles.map((f) => f.id));
      const allFiles = await api.getFiles();
      setFiles([...allFiles.filter((f) => newIds.has(f.id)), ...allFiles.filter((f) => !newIds.has(f.id))]);
      setCreatingFiles(false);

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
    } finally {
      setCreatingFiles(false);
    }
  }

  const fileCounts = {
    risky: files.filter((f) => f.classification === "risky").length,
    safe: files.filter((f) => f.classification === "safe").length,
    unknown: files.filter((f) => f.classification === "unknown").length,
  };

  const openRisks = risks.filter((r) => r.status === "open");
  const riskCounts = {
    high: openRisks.filter((r) => r.severity === "high").length,
    low: openRisks.filter((r) => r.severity === "low").length,
  };

  const exposedSensitiveCount = files.filter(
    (f) => f.classification === "risky" && (f.is_public || f.is_shared_with_everyone)
  ).length;

  const scanInFlight = jobId !== "" && scanStatus !== "done" && scanStatus !== "failed";
  const busy = creatingFiles || scanInFlight;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Dashboard</h1>
          <p>Live posture across every file, permission, and scan.</p>
        </div>
        <button data-testid="start-scan-button" onClick={startScan} disabled={busy}>
          {creatingFiles ? "Preparing…" : scanInFlight ? "Scanning…" : "Start Scan"}
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

      <PostureBreakdown fileCounts={fileCounts} riskCounts={riskCounts} exposedSensitiveCount={exposedSensitiveCount} />

      {jobId && <ScanConsole jobId={jobId} status={scanStatus} summary={scanSummary} />}
      {jobId && (
        <FileScanProgress
          jobId={jobId}
          files={files}
          done={scanStatus === "done"}
          failed={scanStatus === "failed"}
        />
      )}
    </div>
  );
}
