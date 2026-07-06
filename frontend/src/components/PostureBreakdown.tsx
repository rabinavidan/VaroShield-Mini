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

interface DonutSlice {
  key: string;
  label: string;
  value: number;
  color: string;
}

function DonutChart({
  slices,
  total,
  totalLabel,
  unit,
}: {
  slices: DonutSlice[];
  total: number;
  totalLabel: string;
  unit: string;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const size = 168;
  const stroke = 22;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const gapPx = 3;
  let cumulative = 0;
  const hoveredSlice = slices.find((s) => s.key === hovered) || null;

  return (
    <div className="donut-panel">
      <div className="donut-wrap">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          role="img"
          aria-label={`${totalLabel}: ${total} total`}
        >
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-alt)" strokeWidth={stroke} />
          {total > 0 &&
            slices.map((s) => {
              const frac = s.value / total;
              const dash = Math.max(0, frac * c - gapPx);
              const offset = -cumulative * c;
              cumulative += frac;
              return (
                <circle
                  key={s.key}
                  cx={size / 2}
                  cy={size / 2}
                  r={r}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={stroke}
                  strokeDasharray={`${dash} ${c - dash}`}
                  strokeDashoffset={offset}
                  transform={`rotate(-90 ${size / 2} ${size / 2})`}
                  className="donut-slice"
                  onMouseEnter={() => setHovered(s.key)}
                  onMouseLeave={() => setHovered(null)}
                />
              );
            })}
        </svg>
        <div className="donut-center">
          <strong>{total}</strong>
          <span>{totalLabel}</span>
        </div>
        {hoveredSlice && (
          <div className="donut-tooltip" role="tooltip">
            <strong>{hoveredSlice.value}</strong> {unit} &middot;{" "}
            {total > 0 ? Math.round((hoveredSlice.value / total) * 100) : 0}%
          </div>
        )}
      </div>
      <div className="donut-legend">
        {slices.map((s) => (
          <span key={s.key}>
            <span className="bar-dot" style={{ background: s.color }} />
            {s.label} <strong>{s.value}</strong>
          </span>
        ))}
      </div>
    </div>
  );
}

function GaugeRing({
  value,
  total,
  label,
  color,
}: {
  value: number;
  total: number;
  label: string;
  color: string;
}) {
  const size = 168;
  const stroke = 22;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = total > 0 ? value / total : 0;
  const dash = Math.max(0, pct * c);

  return (
    <div className="donut-panel">
      <div className="donut-wrap">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          role="img"
          aria-label={`${label}: ${Math.round(pct * 100)}%, ${value} of ${total}`}
        >
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-alt)" strokeWidth={stroke} />
          {total > 0 && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={color}
              strokeWidth={stroke}
              strokeDasharray={`${dash} ${c - dash}`}
              strokeLinecap="round"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          )}
        </svg>
        <div className="donut-center">
          <strong>{Math.round(pct * 100)}%</strong>
        </div>
      </div>
      <p className="gauge-caption">
        {value} of {total} {label}
      </p>
    </div>
  );
}

interface PostureBreakdownProps {
  fileCounts: { risky: number; safe: number; unknown: number };
  riskCounts: { high: number; low: number };
  exposedSensitiveCount: number;
}

export default function PostureBreakdown({ fileCounts, riskCounts, exposedSensitiveCount }: PostureBreakdownProps) {
  const totalFiles = fileCounts.risky + fileCounts.safe + fileCounts.unknown;
  const totalRisks = riskCounts.high + riskCounts.low;

  return (
    <div className="chart-grid">
      <section className="chart-card">
        <p className="flow-eyebrow">Risk posture</p>
        <h2>Open alerts by severity</h2>
        <p className="flow-desc">Every alert currently open, split by the rule that raised it.</p>
        {totalRisks > 0 ? (
          <DonutChart
            unit="alerts"
            total={totalRisks}
            totalLabel="open"
            slices={[
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
              { key: "risky", label: "Risky", value: fileCounts.risky, color: "var(--risk-high)" },
              {
                key: "safe",
                label: "Safe",
                value: fileCounts.safe,
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

      <section className="chart-card">
        <p className="flow-eyebrow">Exposure</p>
        <h2>Sensitive data exposed</h2>
        <p className="flow-desc">Sensitive files that are public or shared with everyone.</p>
        {fileCounts.risky > 0 ? (
          <GaugeRing
            value={exposedSensitiveCount}
            total={fileCounts.risky}
            label="sensitive files exposed"
            color={exposedSensitiveCount > 0 ? "var(--risk-high)" : "var(--risk-low)"}
          />
        ) : (
          <p className="chart-empty">No sensitive files found yet.</p>
        )}
      </section>
    </div>
  );
}
