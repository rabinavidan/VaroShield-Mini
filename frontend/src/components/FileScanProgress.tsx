import { useEffect, useState } from "react";
import { FileItem } from "../api/client";
import { EXPOSURE_LABEL, exposureOf, sourceMeta } from "../utils/fileMeta";

interface FileScanProgressProps {
  jobId: string;
  files: FileItem[];
  done: boolean;
  failed: boolean;
}

const MIN_DURATION_MS = 1000;
const MAX_DURATION_MS = 10000;

interface FileScanRowProps {
  file: FileItem;
  duration: number;
  resultReady: boolean;
  failed: boolean;
}

function FileScanRow({ file, duration, resultReady, failed }: FileScanRowProps) {
  const [width, setWidth] = useState(0);
  const [localDone, setLocalDone] = useState(false);

  useEffect(() => {
    setWidth(0);
    setLocalDone(false);
    const raf = requestAnimationFrame(() => setWidth(100));
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);

  const revealed = localDone && resultReady;
  const tone = failed ? "failed" : revealed ? (file.classification === "risky" ? "risky" : "safe") : "active";
  const meta = sourceMeta(file.source);
  const Icon = meta.Icon;
  const exposure = exposureOf(file);

  return (
    <div className="file-scan-row" data-testid="file-scan-row">
      <span className="file-scan-source" style={{ color: meta.color }} title={meta.label}>
        <Icon size={16} />
      </span>
      <span className="file-scan-name">{file.name}</span>
      <div className="file-scan-track">
        <div
          className={`file-scan-fill file-scan-fill--${tone}`}
          style={{ width: `${width}%`, transitionDuration: `${duration}ms` }}
          onTransitionEnd={() => setLocalDone(true)}
        />
      </div>
      <span className={`badge badge-${revealed ? file.classification : "unknown"}`}>
        {revealed ? file.classification : "scanning"}
      </span>
      <span className={`badge badge-${exposure}`} title={exposure === "shared" ? "Shared with everyone" : undefined}>
        {EXPOSURE_LABEL[exposure]}
      </span>
    </div>
  );
}

interface ScanSnapshot {
  jobId: string;
  files: FileItem[];
  durations: Record<number, number>;
}

const EMPTY_SNAPSHOT: ScanSnapshot = { jobId: "", files: [], durations: {} };

export default function FileScanProgress({ jobId, files, done, failed }: FileScanProgressProps) {
  const [snapshot, setSnapshot] = useState<ScanSnapshot>(EMPTY_SNAPSHOT);

  if (jobId && jobId !== snapshot.jobId) {
    const durations: Record<number, number> = {};
    files.forEach((file) => {
      durations[file.id] = MIN_DURATION_MS + Math.random() * (MAX_DURATION_MS - MIN_DURATION_MS);
    });
    setSnapshot({ jobId, files, durations });
  }

  if (!jobId || snapshot.files.length === 0) return null;

  return (
    <section className="file-scan-progress" data-testid="file-scan-progress">
      <p className="flow-eyebrow">Per-file scan</p>
      <div className="file-scan-row file-scan-row--head">
        <span className="file-scan-source" />
        <span className="file-scan-name">File</span>
        <span className="file-scan-track-head">Progress</span>
        <span>Classification</span>
        <span>Exposure</span>
      </div>
      {snapshot.files.map((snapshotFile) => {
        const current = files.find((f) => f.id === snapshotFile.id) || snapshotFile;
        return (
          <FileScanRow
            key={current.id}
            file={current}
            duration={snapshot.durations[current.id] ?? MAX_DURATION_MS}
            resultReady={done}
            failed={failed}
          />
        );
      })}
    </section>
  );
}
