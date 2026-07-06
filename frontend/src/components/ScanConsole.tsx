import { Fragment, useEffect, useRef, useState } from "react";

interface ScanConsoleProps {
  jobId: string;
  status: string;
  summary?: { scanned_files: number; sensitive_files: number };
}

const STEPS = ["Queued", "Scanning", "Complete"];

function stepIndex(status: string): number {
  if (status === "done" || status === "failed") return 2;
  if (status === "running") return 1;
  return 0;
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <path d="M5 12.5l4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <path d="M12 5v8" strokeLinecap="round" />
      <circle cx="12" cy="17.2" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function ScanConsole({ jobId, status, summary }: ScanConsoleProps) {
  const [elapsedMs, setElapsedMs] = useState(0);
  const startRef = useRef(Date.now());
  const active = stepIndex(status);
  const done = status === "done";
  const failed = status === "failed";

  useEffect(() => {
    startRef.current = Date.now();
    setElapsedMs(0);
  }, [jobId]);

  useEffect(() => {
    if (done || failed) {
      return;
    }
    const interval = setInterval(() => {
      setElapsedMs(Date.now() - startRef.current);
    }, 250);
    return () => clearInterval(interval);
  }, [done, failed, jobId]);

  const stepStates = STEPS.map((_, i) => {
    if (failed && i === 2) return "failed";
    if (i < active) return "done";
    if (i === active) return done ? "done" : "current";
    return "pending";
  });

  return (
    <section className="scan-console" data-testid="scan-status">
      <div className="scan-console-head">
        <span className="scan-console-job">{jobId}</span>
        <span className={`status-pill status-${status || "pending"}`}>{status || "pending"}</span>
        <span className="scan-console-elapsed">{(elapsedMs / 1000).toFixed(1)}s</span>
      </div>

      <div className="scan-steps">
        {STEPS.map((label, i) => (
          <Fragment key={label}>
            {i > 0 && (
              <div
                className={`scan-connector${stepStates[i - 1] === "done" ? " scan-connector--filled" : ""}${
                  stepStates[i] === "failed" ? " scan-connector--failed" : ""
                }`}
              />
            )}
            <div className={`scan-step scan-step--${stepStates[i]}`}>
              <span className="scan-step-dot">
                {stepStates[i] === "done" && <CheckIcon />}
                {stepStates[i] === "failed" && <AlertIcon />}
              </span>
              <span className="scan-step-label">{label}</span>
            </div>
          </Fragment>
        ))}
      </div>

      <div className="scan-progress-track">
        <div className={`scan-progress-fill scan-progress-${failed ? "failed" : done ? "done" : "active"}`} />
      </div>

      {done && summary && (
        <div className="scan-result">
          <strong>{summary.scanned_files}</strong> files scanned &middot; <strong>{summary.sensitive_files}</strong>{" "}
          sensitive found
        </div>
      )}
      {failed && <p className="scan-result scan-result-failed">Scan failed &mdash; check backend logs.</p>}
    </section>
  );
}
