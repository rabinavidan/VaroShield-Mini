import { useState } from "react";

interface BarItem {
  key: string;
  label: string;
  value: number;
  color: string;
}

function BarList({ items, total, unit }: { items: BarItem[]; total: number; unit: string }) {
  const max = Math.max(1, ...items.map((item) => item.value));
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="bar-list" role="list">
      {items.map((item) => {
        const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
        const widthPct = (item.value / max) * 100;
        return (
          <div
            key={item.key}
            role="listitem"
            className="bar-row"
            tabIndex={0}
            onMouseEnter={() => setHovered(item.key)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(item.key)}
            onBlur={() => setHovered(null)}
          >
            <span className="bar-row-label">
              <span className="bar-dot" style={{ background: item.color }} />
              {item.label}
            </span>
            <span className="bar-track">
              <span className="bar-fill" style={{ width: `${widthPct}%`, background: item.color }} />
            </span>
            <span className="bar-value">{item.value}</span>

            {hovered === item.key && (
              <div className="bar-tooltip" role="tooltip">
                <strong>{item.value}</strong> {unit} &middot; {pct}% of {total}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface PostureBreakdownProps {
  fileCounts: { sensitive: number; nonSensitive: number; unknown: number };
  riskCounts: { high: number; low: number };
}

export default function PostureBreakdown({ fileCounts, riskCounts }: PostureBreakdownProps) {
  const totalFiles = fileCounts.sensitive + fileCounts.nonSensitive + fileCounts.unknown;
  const totalRisks = riskCounts.high + riskCounts.low;

  return (
    <div className="chart-grid">
      <section className="chart-card">
        <p className="flow-eyebrow">Risk posture</p>
        <h2>Open alerts by severity</h2>
        <p className="flow-desc">Every alert currently open, split by the rule that raised it.</p>
        {totalRisks > 0 ? (
          <BarList
            unit="alerts"
            total={totalRisks}
            items={[
              { key: "high", label: "High", value: riskCounts.high, color: "var(--risk-high)" },
              { key: "low", label: "Low", value: riskCounts.low, color: "var(--risk-low)" },
            ]}
          />
        ) : (
          <p className="chart-empty">No open alerts yet — run a scan to populate this.</p>
        )}
      </section>

      <section className="chart-card">
        <p className="flow-eyebrow">Data discovery</p>
        <h2>Files by classification</h2>
        <p className="flow-desc">What the last scan found across every file in the system.</p>
        {totalFiles > 0 ? (
          <BarList
            unit="files"
            total={totalFiles}
            items={[
              { key: "sensitive", label: "Sensitive", value: fileCounts.sensitive, color: "var(--risk-high)" },
              {
                key: "non_sensitive",
                label: "Non-sensitive",
                value: fileCounts.nonSensitive,
                color: "var(--risk-low)",
              },
              {
                key: "unknown",
                label: "Unscanned",
                value: fileCounts.unknown,
                color: "var(--neutral-pill)",
              },
            ]}
          />
        ) : (
          <p className="chart-empty">No files yet — create one to populate this.</p>
        )}
      </section>
    </div>
  );
}
